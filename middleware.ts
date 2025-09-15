import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { logger } from './src/lib/logger';
import { advancedRateLimitMiddleware } from './src/middleware/advanced-rate-limiting';
import { enhancedSecurityMiddleware } from './src/middleware/enhanced-security';
import { getUserIdFromRequest, requireAuthentication, requirePaidSubscription } from './src/middleware/payment-validation';
import { applySecurityHeaders, configureCORS, securityMiddleware } from './src/middleware/security';
import { requireValidSession } from './src/middleware/session-validation';
import { zeroTrustAuthMiddleware } from './src/middleware/zero-trust-auth';

// Middleware de internacionalização
const intlMiddleware = createMiddleware({
  locales: ['pt-BR', 'en', 'es'],
  defaultLocale: 'pt-BR',
  localePrefix: 'always',
});

/**
 * Enhanced Middleware Principal para Micro SaaS 2025
 * Implementa Zero Trust Architecture com múltiplas camadas de segurança
 */
export default async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  try {
    // 1. Enhanced Security Middleware (Primeira camada de proteção)
    const enhancedSecurityResponse = await enhancedSecurityMiddleware(request);
    if (enhancedSecurityResponse) {
      logger.warn('Request blocked by enhanced security middleware', {
        path: pathname,
        method: request.method,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        timestamp: new Date().toISOString()
      });
      return enhancedSecurityResponse;
    }

    // 2. Advanced Rate Limiting (Segunda camada de proteção)
    const rateLimitResponse = await advancedRateLimitMiddleware(request);
    if (rateLimitResponse) {
      logger.warn('Request blocked by rate limiting', {
        path: pathname,
        method: request.method,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        timestamp: new Date().toISOString()
      });
      return rateLimitResponse;
    }

    // 3. Basic Security Checks (Terceira camada de proteção)
    const securityResponse = securityMiddleware(request);
    if (securityResponse) {
      logger.warn('Request blocked by basic security middleware', {
        path: pathname,
        method: request.method,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        timestamp: new Date().toISOString()
      });
      return securityResponse;
    }

    // 4. Zero Trust Authentication (Quarta camada de proteção)
    if (isProtectedRoute(pathname)) {
      const zeroTrustResponse = await zeroTrustAuthMiddleware(request);
      if (zeroTrustResponse) {
        logger.warn('Request blocked by Zero Trust authentication', {
          path: pathname,
          method: request.method,
          ip: request.ip || request.headers.get('x-forwarded-for'),
          timestamp: new Date().toISOString()
        });
        return zeroTrustResponse;
      }
    }

    // 5. Enhanced Session Validation (Quinta camada de proteção)
    if (isProtectedRoute(pathname)) {
      const sessionResponse = await requireValidSession(request, {
        requireActiveSubscription: pathname.startsWith('/api/contracts') && !pathname.includes('/calculate'),
        allowFreePlan: !pathname.startsWith('/api/contracts') || pathname.includes('/calculate')
      });
      
      if (sessionResponse) {
        logger.warn('Request blocked by session validation', {
          path: pathname,
          method: request.method,
          ip: request.ip || request.headers.get('x-forwarded-for'),
          timestamp: new Date().toISOString()
        });
        return sessionResponse;
      }
    }

    // 6. Legacy Validation (Compatibilidade com código existente)
    if (isProtectedRoute(pathname)) {
      const userId = await getUserIdFromRequest(request);
      
      if (!userId) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Para APIs de contratos, requer assinatura paga (exceto para plano gratuito básico)
      if (pathname.startsWith('/api/contracts') && !pathname.includes('/calculate')) {
        const paymentResponse = await requirePaidSubscription(request, userId);
        if (paymentResponse) {
          return paymentResponse;
        }
      }

      // Para outras rotas protegidas, requer apenas autenticação
      const authResponse = await requireAuthentication(request, userId);
      if (authResponse) {
        return authResponse;
      }
    }

    // 7. Aplica middleware de internacionalização
    const response = intlMiddleware(request);

    // 8. Aplica headers de segurança avançados
    const securedResponse = applySecurityHeaders(response, request);

    // 9. Configura CORS para APIs
    if (pathname.startsWith('/api/')) {
      return configureCORS(securedResponse);
    }

    // 10. Log de sucesso
    const duration = Date.now() - startTime;
    logger.info('Request processed successfully', {
      path: pathname,
      method: request.method,
      duration: `${duration}ms`,
      ip: request.ip || request.headers.get('x-forwarded-for'),
      timestamp: new Date().toISOString()
    });

    return securedResponse;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error in enhanced middleware', {
      error: error instanceof Error ? error.message : error,
      path: pathname,
      method: request.method,
      duration: `${duration}ms`,
      ip: request.ip || request.headers.get('x-forwarded-for'),
      timestamp: new Date().toISOString()
    });

    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * Verifica se a rota requer proteção
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = [
    /^\/api\/contracts/,
    /^\/api\/subscriptions/,
    /^\/api\/auth/,
    /^\/api\/admin/,
    /^\/api\/export/,
    /^\/api\/upload/,
    /^\/dashboard/,
    /^\/contracts/,
    /^\/admin/,
    /^\/settings/
  ];

  return protectedPatterns.some(pattern => pattern.test(pathname));
}

// Ensure middleware runs on all non-static routes (exclude _next, api and asset files)
export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
