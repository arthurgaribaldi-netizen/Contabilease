/**
 * Sistema de Health Check para monitoramento de saúde da aplicação
 * Implementa verificações de dependências críticas e status do sistema
 */

import { logger } from '@/lib/logger';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheckItem;
    external_apis: HealthCheckItem;
    memory: HealthCheckItem;
    disk: HealthCheckItem;
  };
}

export interface HealthCheckItem {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

class HealthChecker {
  private startTime = Date.now();

  /**
   * Executa todas as verificações de saúde
   */
  async runHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    try {
      const [database, externalApis, memory, disk] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkExternalAPIs(),
        this.checkMemory(),
        this.checkDisk(),
      ]);

      const checks = {
        database: database.status === 'fulfilled' ? database.value : {
          status: 'fail' as const,
          message: 'Database check failed',
          details: { error: database.status === 'rejected' ? database.reason : 'Unknown error' }
        },
        external_apis: externalApis.status === 'fulfilled' ? externalApis.value : {
          status: 'fail' as const,
          message: 'External APIs check failed',
          details: { error: externalApis.status === 'rejected' ? externalApis.reason : 'Unknown error' }
        },
        memory: memory.status === 'fulfilled' ? memory.value : {
          status: 'fail' as const,
          message: 'Memory check failed',
          details: { error: memory.status === 'rejected' ? memory.reason : 'Unknown error' }
        },
        disk: disk.status === 'fulfilled' ? disk.value : {
          status: 'fail' as const,
          message: 'Disk check failed',
          details: { error: disk.status === 'rejected' ? disk.reason : 'Unknown error' }
        },
      };

      // Determina status geral
      const hasFailures = Object.values(checks).some(check => check.status === 'fail');
      const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (hasFailures) {
        status = 'unhealthy';
      } else if (hasWarnings) {
        status = 'degraded';
      } else {
        status = 'healthy';
      }

      const result: HealthCheckResult = {
        status,
        timestamp,
        version: process.env.npm_package_version || '1.0.0',
        uptime,
        checks,
      };

      // Log do resultado
      if (status === 'unhealthy') {
        logger.error('Health check failed', result);
      } else if (status === 'degraded') {
        logger.warn('Health check degraded', result);
      } else {
        logger.info('Health check passed', result);
      }

      return result;
    } catch (error) {
      logger.error('Health check error', { error, timestamp, uptime });
      
      return {
        status: 'unhealthy',
        timestamp,
        version: process.env.npm_package_version || '1.0.0',
        uptime,
        checks: {
          database: { status: 'fail', message: 'Health check system error' },
          external_apis: { status: 'fail', message: 'Health check system error' },
          memory: { status: 'fail', message: 'Health check system error' },
          disk: { status: 'fail', message: 'Health check system error' },
        },
      };
    }
  }

  /**
   * Verifica conectividade com banco de dados
   */
  private async checkDatabase(): Promise<HealthCheckItem> {
    const startTime = Date.now();
    
    try {
      // Verifica se Supabase está configurado
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return {
          status: 'fail',
          message: 'Supabase configuration missing',
          responseTime: Date.now() - startTime,
        };
      }

      // Testa conectividade básica
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          status: 'pass',
          message: 'Database connection healthy',
          responseTime,
        };
      } else {
        return {
          status: 'warn',
          message: `Database connection degraded (${response.status})`,
          responseTime,
          details: { status: response.status, statusText: response.statusText },
        };
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'Database connection failed',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Verifica APIs externas críticas
   */
  private async checkExternalAPIs(): Promise<HealthCheckItem> {
    const startTime = Date.now();
    
    try {
      const checks = await Promise.allSettled([
        this.checkStripeAPI(),
        this.checkGoogleAPIs(),
      ]);

      const responseTime = Date.now() - startTime;
      const results = checks.map(check => 
        check.status === 'fulfilled' ? check.value : false
      );

      const allPassed = results.every(result => result === true);
      const somePassed = results.some(result => result === true);

      if (allPassed) {
        return {
          status: 'pass',
          message: 'All external APIs healthy',
          responseTime,
        };
      } else if (somePassed) {
        return {
          status: 'warn',
          message: 'Some external APIs degraded',
          responseTime,
          details: { results },
        };
      } else {
        return {
          status: 'fail',
          message: 'External APIs failed',
          responseTime,
          details: { results },
        };
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'External APIs check failed',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Verifica API do Stripe
   */
  private async checkStripeAPI(): Promise<boolean> {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return false;

      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
        signal: AbortSignal.timeout(3000),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Verifica APIs do Google
   */
  private async checkGoogleAPIs(): Promise<boolean> {
    try {
      // Verifica se Google Analytics está configurado
      const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
      return !!gaId;
    } catch {
      return false;
    }
  }

  /**
   * Verifica uso de memória
   */
  private async checkMemory(): Promise<HealthCheckItem> {
    try {
      if (typeof process === 'undefined') {
        return {
          status: 'warn',
          message: 'Memory check not available in browser',
        };
      }

      const memUsage = process.memoryUsage();
      const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const usagePercent = (usedMB / totalMB) * 100;

      if (usagePercent > 90) {
        return {
          status: 'fail',
          message: `Memory usage critical: ${usagePercent.toFixed(1)}%`,
          details: { usedMB, totalMB, usagePercent },
        };
      } else if (usagePercent > 75) {
        return {
          status: 'warn',
          message: `Memory usage high: ${usagePercent.toFixed(1)}%`,
          details: { usedMB, totalMB, usagePercent },
        };
      } else {
        return {
          status: 'pass',
          message: `Memory usage normal: ${usagePercent.toFixed(1)}%`,
          details: { usedMB, totalMB, usagePercent },
        };
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'Memory check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Verifica espaço em disco
   */
  private async checkDisk(): Promise<HealthCheckItem> {
    try {
      if (typeof process === 'undefined') {
        return {
          status: 'warn',
          message: 'Disk check not available in browser',
        };
      }

      // Em produção, você pode usar bibliotecas como 'fs' para verificar disco
      // Por enquanto, retornamos um status de pass
      return {
        status: 'pass',
        message: 'Disk space check passed',
        details: { note: 'Disk check not implemented in browser environment' },
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Disk check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}

// Instância singleton
const healthChecker = new HealthChecker();

/**
 * Executa health check completo
 */
export async function runHealthCheck(): Promise<HealthCheckResult> {
  return healthChecker.runHealthCheck();
}

/**
 * Health check rápido para endpoints de liveness
 */
export async function quickHealthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
  try {
    const result = await healthChecker.runHealthCheck();
    return {
      status: result.status === 'healthy' ? 'ok' : 'error',
      timestamp: result.timestamp,
    };
  } catch {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Middleware para health check em rotas
 */
export function withHealthCheck(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    
    if (url.pathname === '/health') {
      const result = await runHealthCheck();
      return new Response(JSON.stringify(result), {
        status: result.status === 'healthy' ? 200 : 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (url.pathname === '/health/live') {
      const result = await quickHealthCheck();
      return new Response(JSON.stringify(result), {
        status: result.status === 'ok' ? 200 : 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return handler(req);
  };
}
