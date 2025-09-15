/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary rate limiting and security utilities.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
export const RATE_LIMITS = {
  // API endpoints
  '/api/contracts': { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  '/api/contracts/[id]/calculate': { requests: 20, window: 60 * 1000 }, // 20 calculations per minute
  '/api/auth': { requests: 10, window: 60 * 1000 }, // 10 auth attempts per minute
  
  // Form submissions
  'contract_form': { requests: 5, window: 60 * 1000 }, // 5 form submissions per minute
  
  // File operations
  'export_pdf': { requests: 10, window: 60 * 1000 }, // 10 exports per minute
  'export_excel': { requests: 10, window: 60 * 1000 }, // 10 exports per minute
} as const;

export interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if request is within rate limits
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / config.window)}`;
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    // First request in this window
    rateLimitStore.set(key, { count: 1, resetTime: now + config.window });
    
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: now + config.window
    };
  }
  
  if (current.count >= config.requests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    allowed: true,
    remaining: config.requests - current.count,
    resetTime: current.resetTime
  };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session first
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fallback to IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  endpoint: keyof typeof RATE_LIMITS
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const config = RATE_LIMITS[endpoint];
    const identifier = getClientIdentifier(request);
    
    const rateLimitResult = checkRateLimit(identifier, config);
    
    if (!rateLimitResult.allowed) {
      logger.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`, {
        identifier,
        endpoint,
        retryAfter: rateLimitResult.retryAfter
      });
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': config.requests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      );
    }
    
    // Add rate limit headers to response
    const response = await handler(request);
    
    response.headers.set('X-RateLimit-Limit', config.requests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    return response;
  };
}

/**
 * Client-side rate limiting for forms
 */
export function createClientRateLimit(config: RateLimitConfig) {
  const store = new Map<string, { count: number; resetTime: number }>();
  
  return function checkClientRateLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / config.window)}`;
    
    const current = store.get(key);
    
    if (!current) {
      store.set(key, { count: 1, resetTime: now + config.window });
      
      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime: now + config.window
      };
    }
    
    if (current.count >= config.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }
    
    current.count++;
    store.set(key, current);
    
    return {
      allowed: true,
      remaining: config.requests - current.count,
      resetTime: current.resetTime
    };
  };
}

/**
 * Cleanup expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Suspicious activity detection
 */
export function detectSuspiciousActivity(
  identifier: string,
  activity: string,
  threshold: number = 10
): boolean {
  const key = `suspicious:${identifier}:${activity}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + window });
    return false;
  }
  
  if (now > current.resetTime) {
    // Reset window
    rateLimitStore.set(key, { count: 1, resetTime: now + window });
    return false;
  }
  
  current.count++;
  rateLimitStore.set(key, current);
  
  if (current.count >= threshold) {
    logger.warn(`Suspicious activity detected`, {
      identifier,
      activity,
      count: current.count,
      threshold
    });
    
    return true;
  }
  
  return false;
}
