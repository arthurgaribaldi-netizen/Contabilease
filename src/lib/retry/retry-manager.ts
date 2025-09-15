/**
 * Sistema de Retry Inteligente para Contabilease
 * Implementa retry com backoff exponencial, jitter e circuit breaker
 */

import { logger } from '@/lib/logger';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // Delay base em milliseconds
  maxDelay: number; // Delay máximo em milliseconds
  backoffMultiplier: number; // Multiplicador para backoff exponencial
  jitter: boolean; // Se deve adicionar jitter aleatório
  retryCondition?: (error: Error) => boolean; // Condição para retry
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Número de falhas antes de abrir
  recoveryTimeout: number; // Tempo para tentar recuperação
  monitoringPeriod: number; // Período de monitoramento
}

class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'half-open';
        logger.info('Circuit breaker: transitioning to half-open');
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
      logger.warn('Circuit breaker: opened due to failures', {
        failureCount: this.failureCount,
        threshold: this.config.failureThreshold,
      });
    }
  }

  getState(): { state: string; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

class RetryManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  /**
   * Executa operação com retry automático
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    circuitBreakerKey?: string
  ): Promise<RetryResult<T>> {
    const defaultConfig: RetryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
    };

    const finalConfig = { ...defaultConfig, ...config };
    const startTime = Date.now();
    let lastError: Error | undefined;

    // Usa circuit breaker se especificado
    if (circuitBreakerKey) {
      const circuitBreaker = this.getCircuitBreaker(circuitBreakerKey);
      
      try {
        const result = await circuitBreaker.execute(operation);
        return {
          success: true,
          result,
          attempts: 1,
          totalTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }
    }

    // Executa retry manual
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        logger.debug(`Retry successful on attempt ${attempt}`, {
          attempts: attempt,
          totalTime: Date.now() - startTime,
        });

        return {
          success: true,
          result,
          attempts: attempt,
          totalTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Verifica se deve fazer retry
        if (attempt === finalConfig.maxAttempts) {
          break;
        }

        if (finalConfig.retryCondition && !finalConfig.retryCondition(lastError)) {
          logger.debug('Retry condition not met', { error: lastError.message });
          break;
        }

        // Calcula delay para próximo retry
        const delay = this.calculateDelay(attempt, finalConfig);
        
        logger.debug(`Retry attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: lastError.message,
          attempt,
          delay,
        });

        await this.sleep(delay);
      }
    }

    logger.error(`All retry attempts failed`, {
      attempts: finalConfig.maxAttempts,
      totalTime: Date.now() - startTime,
      error: lastError?.message,
    });

    return {
      success: false,
      error: lastError,
      attempts: finalConfig.maxAttempts,
      totalTime: Date.now() - startTime,
    };
  }

  /**
   * Calcula delay para retry com backoff exponencial e jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    // Backoff exponencial
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Limita ao delay máximo
    delay = Math.min(delay, config.maxDelay);
    
    // Adiciona jitter se habilitado
    if (config.jitter) {
      const jitterAmount = delay * 0.1; // 10% de jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return Math.max(0, Math.round(delay));
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtém ou cria circuit breaker
   */
  private getCircuitBreaker(key: string): CircuitBreaker {
    if (!this.circuitBreakers.has(key)) {
      const config: CircuitBreakerConfig = {
        failureThreshold: 5,
        recoveryTimeout: 60000, // 1 minuto
        monitoringPeriod: 300000, // 5 minutos
      };
      
      this.circuitBreakers.set(key, new CircuitBreaker(config));
    }
    
    return this.circuitBreakers.get(key)!;
  }

  /**
   * Obtém estado de circuit breaker
   */
  getCircuitBreakerState(key: string): { state: string; failureCount: number; lastFailureTime: number } | null {
    const circuitBreaker = this.circuitBreakers.get(key);
    return circuitBreaker ? circuitBreaker.getState() : null;
  }

  /**
   * Reseta circuit breaker
   */
  resetCircuitBreaker(key: string): void {
    this.circuitBreakers.delete(key);
    logger.info(`Circuit breaker reset: ${key}`);
  }
}

// Instância singleton
const retryManager = new RetryManager();

/**
 * Executa operação com retry
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  circuitBreakerKey?: string
): Promise<RetryResult<T>> {
  return retryManager.executeWithRetry(operation, config, circuitBreakerKey);
}

/**
 * Decorator para retry automático em métodos
 */
export function retryable(config?: Partial<RetryConfig>) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const operation = () => originalMethod.apply(this, args);
      const result = await retryManager.executeWithRetry(operation, config);
      
      if (!result.success) {
        throw result.error;
      }
      
      return result.result;
    };

    return descriptor;
  };
}

/**
 * Configurações pré-definidas para diferentes tipos de operação
 */
export const retryConfigs = {
  // Para operações de rede
  network: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      return error.message.includes('timeout') || 
             error.message.includes('network') ||
             error.message.includes('ECONNRESET');
    },
  },
  
  // Para operações de banco de dados
  database: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    jitter: true,
    retryCondition: (error: Error) => {
      return error.message.includes('connection') ||
             error.message.includes('timeout') ||
             error.message.includes('ECONNREFUSED');
    },
  },
  
  // Para APIs externas
  api: {
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      return error.message.includes('5') || // Erros 5xx
             error.message.includes('timeout') ||
             error.message.includes('ECONNRESET');
    },
  },
  
  // Para operações críticas
  critical: {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  },
} as const;

/**
 * Hook para usar retry em componentes React
 */
export function useRetry() {
  return {
    execute: withRetry,
    getCircuitBreakerState: (key: string) => retryManager.getCircuitBreakerState(key),
    resetCircuitBreaker: (key: string) => retryManager.resetCircuitBreaker(key),
  };
}

/**
 * Utilitário para retry de fetch
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config?: Partial<RetryConfig>
): Promise<Response> {
  const result = await withRetry(
    () => fetch(url, options),
    config || retryConfigs.network,
    `fetch_${url}`
  );
  
  if (!result.success) {
    throw result.error;
  }
  
  return result.result!;
}
