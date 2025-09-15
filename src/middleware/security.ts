/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary security middleware.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIdentifier, checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiting';
import { logger } from '@/lib/logger';

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HTTPS only)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.supabase.co",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' *.supabase.co *.stripe.com",
    "frame-src 'self' *.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  return response;
}

/**
 * Bot detection middleware
 */
export function detectBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /php/i,
    /scrapy/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * IP whitelist/blacklist middleware
 */
export function checkIPAccess(request: NextRequest): { allowed: boolean; reason?: string } {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Block suspicious IPs
  const blockedIPs = [
    '127.0.0.1', // Localhost in production
    '0.0.0.0',
    '::1'
  ];
  
  if (blockedIPs.includes(ip)) {
    return { allowed: false, reason: 'Blocked IP address' };
  }
  
  // Allow all other IPs for now
  // In production, implement proper IP filtering
  return { allowed: true };
}

/**
 * API endpoint protection middleware
 */
export function protectAPIEndpoint(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMITS
): NextResponse | null {
  // Check IP access
  const ipCheck = checkIPAccess(request);
  if (!ipCheck.allowed) {
    logger.warn(`Blocked request from IP`, {
      ip: request.headers.get('x-forwarded-for'),
      reason: ipCheck.reason,
      endpoint
    });
    
    return NextResponse.json(
      { error: 'Access denied', reason: ipCheck.reason },
      { status: 403 }
    );
  }
  
  // Check for bots
  if (detectBot(request)) {
    logger.warn(`Bot detected`, {
      userAgent: request.headers.get('user-agent'),
      endpoint
    });
    
    return NextResponse.json(
      { error: 'Bot access not allowed' },
      { status: 403 }
    );
  }
  
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const config = RATE_LIMITS[endpoint];
  const rateLimitResult = checkRateLimit(identifier, config);
  
  if (!rateLimitResult.allowed) {
    logger.warn(`Rate limit exceeded`, {
      identifier,
      endpoint,
      retryAfter: rateLimitResult.retryAfter
    });
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
        }
      }
    );
  }
  
  return null; // Allow request to continue
}

/**
 * Request logging middleware
 */
export function logRequest(request: NextRequest, response: NextResponse): void {
  const method = request.method;
  const url = request.url;
  const status = response.status;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  logger.info(`Request processed`, {
    method,
    url,
    status,
    userAgent,
    ip,
    timestamp: new Date().toISOString()
  });
  
  // Log suspicious requests
  if (status >= 400) {
    logger.warn(`Suspicious request detected`, {
      method,
      url,
      status,
      userAgent,
      ip
    });
  }
}

/**
 * Main security middleware
 */
export function securityMiddleware(
  request: NextRequest,
  endpoint?: keyof typeof RATE_LIMITS
): NextResponse | null {
  // Add security headers to all responses
  const response = new NextResponse();
  addSecurityHeaders(response);
  
  // For API endpoints, apply additional protection
  if (endpoint && request.nextUrl.pathname.startsWith('/api/')) {
    return protectAPIEndpoint(request, endpoint);
  }
  
  return null;
}