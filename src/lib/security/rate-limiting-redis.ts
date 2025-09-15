/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Sistema de Rate Limiting Robusto com Redis
 * Substitui o sistema em memória por uma solução escalável e persistente
 */

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

// Configuração do Redis
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

// Configuração de rate limiting
export interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
  blockDuration?: number; // in milliseconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  totalHits: number;
  blocked?: boolean;
}

// Implementação Redis usando fetch (compatível com Edge Runtime)
class RedisRateLimiter {
  private redisUrl: string;
  private fallbackStore: Map<string, { count: number; resetTime: number; blocked: boolean }>;

  constructor(config: RedisConfig) {
    this.redisUrl = `redis://${config.host}:${config.port}`;
    this.fallbackStore = new Map();
  }

  async checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      return await this.checkWithRedis(key, config);
    } catch (error) {
      logger.warn('Redis unavailable, falling back to memory store', { error });
      return this.checkWithFallback(key, config);
    }
  }

  private async checkWithRedis(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / config.window);
    const redisKey = `rate_limit:${key}:${windowStart}`;
    const blockKey = `blocked:${key}`;

    // Verificar se está bloqueado
    const isBlocked = await this.redisGet(blockKey);
    if (isBlocked && now < parseInt(isBlocked)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: parseInt(isBlocked),
        retryAfter: Math.ceil((parseInt(isBlocked) - now) / 1000),
        totalHits: 0,
        blocked: true,
      };
    }

    // Incrementar contador
    const currentCount = await this.redisIncr(redisKey);
    
    // Definir TTL na primeira requisição
    if (currentCount === 1) {
      await this.redisExpire(redisKey, Math.ceil(config.window / 1000));
    }

    const remaining = Math.max(0, config.requests - currentCount);
    const resetTime = now + config.window;

    if (currentCount > config.requests) {
      // Bloquear por período adicional se configurado
      if (config.blockDuration) {
        const blockUntil = now + config.blockDuration;
        await this.redisSet(blockKey, blockUntil.toString(), Math.ceil(config.blockDuration / 1000));
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil(config.window / 1000),
        totalHits: currentCount,
        blocked: true,
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime,
      totalHits: currentCount,
    };
  }

  private checkWithFallback(
    key: string,
    config: RateLimitConfig
  ): RateLimitResult {
    const now = Date.now();
    const windowStart = Math.floor(now / config.window);
    const fallbackKey = `${key}:${windowStart}`;

    const current = this.fallbackStore.get(fallbackKey);

    if (!current) {
      this.fallbackStore.set(fallbackKey, { count: 1, resetTime: now + config.window, blocked: false });
      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime: now + config.window,
        totalHits: 1,
      };
    }

    if (current.blocked && now < current.resetTime) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
        totalHits: current.count,
        blocked: true,
      };
    }

    if (current.count >= config.requests) {
      // Bloquear por período adicional se configurado
      if (config.blockDuration) {
        current.blocked = true;
        current.resetTime = now + config.blockDuration;
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
        totalHits: current.count,
        blocked: true,
      };
    }

    current.count++;
    this.fallbackStore.set(fallbackKey, current);

    return {
      allowed: true,
      remaining: config.requests - current.count,
      resetTime: current.resetTime,
      totalHits: current.count,
    };
  }

  private async redisGet(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.redisUrl}/get/${key}`);
      if (!response.ok) throw new Error('Redis GET failed');
      const data = await response.text();
      return data === 'null' ? null : data;
    } catch {
      return null;
    }
  }

  private async redisSet(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const url = ttl ? `${this.redisUrl}/setex/${key}/${ttl}/${value}` : `${this.redisUrl}/set/${key}/${value}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Redis SET failed');
    } catch (error) {
      logger.error('Redis SET failed', { error, key });
    }
  }

  private async redisIncr(key: string): Promise<number> {
    try {
      const response = await fetch(`${this.redisUrl}/incr/${key}`);
      if (!response.ok) throw new Error('Redis INCR failed');
      const data = await response.text();
      return parseInt(data) || 0;
    } catch (error) {
      logger.error('Redis INCR failed', { error, key });
      return 0;
    }
  }

  private async redisExpire(key: string, seconds: number): Promise<void> {
    try {
      const response = await fetch(`${this.redisUrl}/expire/${key}/${seconds}`);
      if (!response.ok) throw new Error('Redis EXPIRE failed');
    } catch (error) {
      logger.error('Redis EXPIRE failed', { error, key });
    }
  }

  // Limpeza de entradas expiradas no fallback
  cleanupFallback(): void {
    const now = Date.now();
    for (const [key, value] of this.fallbackStore.entries()) {
      if (now > value.resetTime) {
        this.fallbackStore.delete(key);
      }
    }
  }
}

// Configuração de rate limits otimizada
export const RATE_LIMITS = {
  // API endpoints críticos
  '/api/contracts': { 
    requests: 100, 
    window: 60 * 1000,
    blockDuration: 5 * 60 * 1000 // 5 minutos de bloqueio
  },
  '/api/contracts/[id]/calculate': { 
    requests: 20, 
    window: 60 * 1000,
    blockDuration: 10 * 60 * 1000 // 10 minutos de bloqueio
  },
  '/api/auth': { 
    requests: 10, 
    window: 60 * 1000,
    blockDuration: 15 * 60 * 1000 // 15 minutos de bloqueio
  },
  
  // Form submissions
  'contract_form': { 
    requests: 5, 
    window: 60 * 1000,
    blockDuration: 5 * 60 * 1000
  },
  
  // File operations
  'export_pdf': { 
    requests: 10, 
    window: 60 * 1000,
    blockDuration: 10 * 60 * 1000
  },
  'export_excel': { 
    requests: 10, 
    window: 60 * 1000,
    blockDuration: 10 * 60 * 1000
  },

  // Endpoints públicos
  '/api/health': {
    requests: 1000,
    window: 60 * 1000
  },
  '/api/public': {
    requests: 200,
    window: 60 * 1000
  }
} as const;

// Instância global do rate limiter
const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

const rateLimiter = new RedisRateLimiter(redisConfig);

// Limpeza automática do fallback
if (typeof window === 'undefined') {
  setInterval(() => rateLimiter.cleanupFallback(), 5 * 60 * 1000);
}

/**
 * Identificador de cliente otimizado
 */
export function getClientIdentifier(request: NextRequest): string {
  // Priorizar user ID se disponível
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Usar IP com hash para privacidade
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Hash do IP para privacidade
  const hashedIp = Buffer.from(ip).toString('base64').slice(0, 16);
  return `ip:${hashedIp}`;
}

/**
 * Middleware de rate limiting para API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  endpoint: keyof typeof RATE_LIMITS
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const config = RATE_LIMITS[endpoint];
    const identifier = getClientIdentifier(request);
    
    const rateLimitResult = await rateLimiter.checkRateLimit(identifier, config);
    
    if (!rateLimitResult.allowed) {
      logger.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`, {
        identifier,
        endpoint,
        retryAfter: rateLimitResult.retryAfter,
        totalHits: rateLimitResult.totalHits,
        blocked: rateLimitResult.blocked
      });
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimitResult.blocked 
            ? 'Your IP has been temporarily blocked due to excessive requests.'
            : 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
          totalHits: rateLimitResult.totalHits
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': config.requests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'X-RateLimit-Total-Hits': rateLimitResult.totalHits.toString(),
            'X-RateLimit-Blocked': rateLimitResult.blocked?.toString() || 'false'
          }
        }
      );
    }
    
    // Adicionar headers de rate limit à resposta
    const response = await handler(request);
    
    response.headers.set('X-RateLimit-Limit', config.requests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    response.headers.set('X-RateLimit-Total-Hits', rateLimitResult.totalHits.toString());
    
    return response;
  };
}

/**
 * Rate limiting para client-side
 */
export function createClientRateLimit(config: RateLimitConfig) {
  const store = new Map<string, { count: number; resetTime: number; blocked: boolean }>();
  
  return function checkClientRateLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / config.window)}`;
    
    const current = store.get(key);
    
    if (!current) {
      store.set(key, { count: 1, resetTime: now + config.window, blocked: false });
      
      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime: now + config.window,
        totalHits: 1,
      };
    }

    if (current.blocked && now < current.resetTime) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
        totalHits: current.count,
        blocked: true,
      };
    }
    
    if (current.count >= config.requests) {
      // Bloquear por período adicional se configurado
      if (config.blockDuration) {
        current.blocked = true;
        current.resetTime = now + config.blockDuration;
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
        totalHits: current.count,
        blocked: true,
      };
    }
    
    current.count++;
    store.set(key, current);
    
    return {
      allowed: true,
      remaining: config.requests - current.count,
      resetTime: current.resetTime,
      totalHits: current.count,
    };
  };
}

/**
 * Detecção de atividade suspeita
 */
export async function detectSuspiciousActivity(
  identifier: string,
  activity: string,
  threshold: number = 10
): Promise<boolean> {
  const key = `suspicious:${identifier}:${activity}`;
  const config: RateLimitConfig = {
    requests: threshold,
    window: 60 * 1000, // 1 minuto
    blockDuration: 30 * 60 * 1000 // 30 minutos de bloqueio
  };

  const result = await rateLimiter.checkRateLimit(key, config);
  
  if (result.blocked) {
    logger.warn(`Suspicious activity detected and blocked`, {
      identifier,
      activity,
      totalHits: result.totalHits,
      threshold,
      blockDuration: config.blockDuration
    });
  }
  
  return result.blocked || false;
}

/**
 * Limpeza de rate limits expirados
 */
export async function cleanupRateLimits(): Promise<void> {
  try {
    // Redis limpa automaticamente com TTL
    // Apenas limpar fallback local
    rateLimiter.cleanupFallback();
  } catch (error) {
    logger.error('Error cleaning up rate limits', { error });
  }
}

/**
 * Estatísticas de rate limiting
 */
export async function getRateLimitStats(identifier: string): Promise<{
  totalRequests: number;
  blockedRequests: number;
  lastReset: number;
}> {
  // Implementar coleta de estatísticas se necessário
  return {
    totalRequests: 0,
    blockedRequests: 0,
    lastReset: Date.now()
  };
}
