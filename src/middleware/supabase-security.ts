import { RATE_LIMITS, SECURITY_FUNCTIONS } from '@/lib/supabase/security';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  max: number;
  window: number;
}

function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  request: NextRequest
): boolean {
  const now = Date.now();
  const key = `${identifier}:${request.ip || 'unknown'}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.window,
    });
    return true;
  }

  if (current.count >= config.max) {
    // Log rate limit violation
    SECURITY_FUNCTIONS.logSecurityEvent({
      eventType: 'rate_limit_exceeded',
      severity: 'medium',
      details: {
        identifier,
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        count: current.count,
        max: config.max,
        window: config.window,
      },
      ip: request.ip || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return false;
  }

  current.count++;
  rateLimitStore.set(key, current);
  return true;
}

export async function supabaseSecurityMiddleware(
  request: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  try {
    // Create Supabase client for middleware
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });

    // Security headers
    Object.entries({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    }).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // CORS headers
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://contabilease.vercel.app',
      'https://www.contabilease.com',
      'https://contabilease.com',
    ];

    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
    }

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    // Rate limiting for auth endpoints
    if (pathname.includes('/auth/')) {
      const isLoginAttempt = pathname.includes('/login') || pathname.includes('/signin');
      const isPasswordReset = pathname.includes('/reset-password');
      
      let rateLimitConfig: RateLimitConfig;
      
      if (isLoginAttempt) {
        rateLimitConfig = RATE_LIMITS.AUTH_ATTEMPTS;
      } else if (isPasswordReset) {
        rateLimitConfig = RATE_LIMITS.PASSWORD_RESET;
      } else {
        rateLimitConfig = RATE_LIMITS.API_CALLS;
      }

      if (!checkRateLimit(`auth:${pathname}`, rateLimitConfig, request)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
          }),
          {
            status: 429,
            headers: {
              ...response.headers,
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
      }
    }

    // Rate limiting for API endpoints
    if (pathname.startsWith('/api/')) {
      if (!checkRateLimit(`api:${pathname}`, RATE_LIMITS.API_CALLS, request)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many API requests. Please try again later.',
          }),
          {
            status: 429,
            headers: {
              ...response.headers,
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
      }
    }

    // Validate session for protected routes
    if (pathname.startsWith('/dashboard/') || pathname.startsWith('/app/')) {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        SECURITY_FUNCTIONS.logSecurityEvent({
          eventType: 'session_validation_error',
          severity: 'medium',
          details: { error: error.message, pathname },
          ip: request.ip || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        });

        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      if (!session) {
        SECURITY_FUNCTIONS.logSecurityEvent({
          eventType: 'unauthorized_access_attempt',
          severity: 'medium',
          details: { pathname },
          ip: request.ip || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        });

        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      // Validate session age and integrity
      const isSessionValid = await SECURITY_FUNCTIONS.validateSession(session);
      if (!isSessionValid) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    // Log suspicious activity
    const userAgent = request.headers.get('user-agent');
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scraper/i,
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
    ];

    if (userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      SECURITY_FUNCTIONS.logSecurityEvent({
        eventType: 'suspicious_user_agent',
        severity: 'medium',
        details: { userAgent, pathname },
        ip: request.ip || undefined,
        userAgent,
      });
    }

    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    
    // Log the error but don't block the request
    SECURITY_FUNCTIONS.logSecurityEvent({
      eventType: 'middleware_error',
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      ip: request.ip || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.next();
  }
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
