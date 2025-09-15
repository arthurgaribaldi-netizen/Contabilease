import { NextRequest, NextResponse } from 'next/server';

/**
 * Configuração de headers de segurança para o Contabilease
 * Implementa as melhores práticas de segurança web
 */

interface SecurityConfig {
  csp: {
    directives: Record<string, string[]>;
    reportOnly?: boolean;
  };
  headers: Record<string, string>;
}

const securityConfig: SecurityConfig = {
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Necessário para Next.js
        "'unsafe-eval'", // Necessário para desenvolvimento
        'https://vercel.live', // Vercel Live
        'https://cdn.jsdelivr.net', // CDN para bibliotecas
        'https://unpkg.com', // CDN alternativo
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Necessário para Tailwind CSS
        'https://fonts.googleapis.com',
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': [
        "'self'",
        'https://*.supabase.co', // Supabase
        'https://*.vercel.app', // Vercel
        'https://vitals.vercel-insights.com', // Vercel Analytics
        'wss://*.supabase.co', // WebSocket do Supabase
      ],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    },
    reportOnly: process.env.NODE_ENV === 'development',
  },
  headers: {
    // Previne clickjacking
    'X-Frame-Options': 'DENY',

    // Previne MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Habilita XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Controla referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (anteriormente Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'fullscreen=(self)',
      'picture-in-picture=()',
    ].join(', '),

    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Cross-Origin Embedder Policy
    'Cross-Origin-Embedder-Policy': 'require-corp',

    // Cross-Origin Opener Policy
    'Cross-Origin-Opener-Policy': 'same-origin',

    // Cross-Origin Resource Policy
    'Cross-Origin-Resource-Policy': 'same-origin',

    // Cache Control para APIs
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
};

/**
 * Aplica headers de segurança à resposta
 */
export function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Aplica headers básicos de segurança
  Object.entries(securityConfig.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Aplica Content Security Policy
  const cspHeader = generateCSPHeader(securityConfig.csp);
  response.headers.set('Content-Security-Policy', cspHeader);

  // Headers específicos para APIs
  if (pathname.startsWith('/api/')) {
    // APIs de cálculos podem ter cache controlado pelo servidor
    if (pathname.includes('/calculate') || pathname.includes('/cache/')) {
      response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    } else {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    response.headers.set('X-API-Version', '1.0');
  }

  // Headers específicos para páginas estáticas
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Headers para assets
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000');
  }

  return response;
}

/**
 * Gera header Content Security Policy
 */
function generateCSPHeader(csp: SecurityConfig['csp']): string {
  const directives = Object.entries(csp.directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');

  return directives;
}

/**
 * Middleware de segurança para Next.js
 */
export function securityMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Bloqueia acesso a arquivos sensíveis
  if (pathname.match(/\.(env|config|log|sql|bak|backup)$/)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Bloqueia acesso a diretórios sensíveis
  if (
    pathname.startsWith('/.git/') ||
    pathname.startsWith('/.svn/') ||
    pathname.startsWith('/.hg/') ||
    pathname.startsWith('/node_modules/') ||
    pathname.startsWith('/.next/')
  ) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Rate limiting básico (implementação simples)
  const _clientIP = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // Bloqueia bots maliciosos conhecidos
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /wget/i,
    /curl/i,
  ];

  if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return null;
}

/**
 * Configuração de CORS para APIs
 */
export function configureCORS(response: NextResponse): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://contabilease.vercel.app',
    'https://contabilease.com',
  ];

  const origin = response.headers.get('origin');

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * Validação de entrada para APIs
 */
export function validateAPIInput(
  data: Record<string, unknown>,
  schema: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    if (value !== undefined && rules.type) {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} must be a string`);
      } else if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} must be a number`);
      } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} must be a boolean`);
      }
    }

    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`${key} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`${key} must be at most ${rules.maxLength} characters`);
    }

    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push(`${key} format is invalid`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitização de dados de entrada
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove caracteres potencialmente perigosos
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}
