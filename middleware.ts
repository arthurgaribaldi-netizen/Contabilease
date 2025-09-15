import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from './src/lib/logger';
import { generateCSPWithNonce } from './src/lib/security/content-security-policy';
import { addSecurityHeaders, securityMiddleware } from './src/middleware/security';

// Middleware de internacionalização
const intlMiddleware = createMiddleware({
  locales: ['pt-BR', 'en', 'es'],
  defaultLocale: 'pt-BR',
  localePrefix: 'always',
});

/**
 * Enhanced Middleware for Contabilease
 * Security, internationalization, CSP, and telemetry
 */
export default async function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Basic Security Checks
    const securityResponse = securityMiddleware(request);
    if (securityResponse) {
      return securityResponse;
    }

    // 2. Apply internationalization middleware
    const response = intlMiddleware(request);

    // 3. Generate CSP with nonce
    const { csp, nonce } = generateCSPWithNonce();
    
    // 4. Apply security headers with CSP
    const securedResponse = addSecurityHeaders(response);
    securedResponse.headers.set('Content-Security-Policy', csp);
    securedResponse.headers.set('X-Content-Security-Policy-Nonce', nonce);

    // 5. Add performance headers
    securedResponse.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    securedResponse.headers.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // 6. Log request for telemetry
    logger.info('Request processed', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      responseTime: Date.now() - startTime,
    });

    return securedResponse;
  } catch (error) {
    logger.error('Error in middleware', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.url,
      method: request.method,
    });
    
    return new NextResponse('Internal server error', { status: 500 });
  }
}


// Ensure middleware runs on all non-static routes (exclude _next, api and asset files)
export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
