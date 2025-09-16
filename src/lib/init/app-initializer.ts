/**
 * Inicializador da Aplicação Contabilease
 * Configura e inicializa todos os sistemas de estabilidade
 */

import { apiCache, calculationCache, contractCache, userCache } from '@/lib/cache/cache-manager';
import { logger } from '@/lib/logger';
import { telemetryManager } from '@/lib/monitoring/telemetry';
import { initPerformanceMonitoring } from '@/lib/performance/web-vitals';
import React from 'react';

export interface AppInitConfig {
  performance: {
    enabled: boolean;
    sampleRate: number;
    endpoint: string;
  };
  telemetry: {
    enabled: boolean;
    sampleRate: number;
    batchSize: number;
  };
  cache: {
    enabled: boolean;
    persist: boolean;
  };
  monitoring: {
    healthCheck: boolean;
    bundleAnalysis: boolean;
  };
}

class AppInitializer {
  private config: AppInitConfig;
  private initialized = false;

  constructor(config?: Partial<AppInitConfig>) {
    this.config = {
      performance: {
        enabled: true,
        sampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
        endpoint: '/api/performance',
      },
      telemetry: {
        enabled: true,
        sampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.05,
        batchSize: 50,
      },
      cache: {
        enabled: true,
        persist: process.env.NODE_ENV === 'production',
      },
      monitoring: {
        healthCheck: true,
        bundleAnalysis: process.env.NODE_ENV === 'development',
      },
      ...config,
    };
  }

  /**
   * Inicializa todos os sistemas da aplicação
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('App already initialized');
      return;
    }

    logger.info('Initializing Contabilease application', this.config);

    try {
      // 1. Inicializa sistema de performance
      if (this.config.performance.enabled) {
        await this.initializePerformance();
      }

      // 2. Inicializa sistema de telemetria
      if (this.config.telemetry.enabled) {
        await this.initializeTelemetry();
      }

      // 3. Inicializa sistema de cache
      if (this.config.cache.enabled) {
        await this.initializeCache();
      }

      // 4. Inicializa monitoramento
      if (this.config.monitoring.healthCheck) {
        await this.initializeHealthCheck();
      }

      // 5. Inicializa análise de bundles (apenas em desenvolvimento)
      if (this.config.monitoring.bundleAnalysis) {
        await this.initializeBundleAnalysis();
      }

      // 6. Configura error handlers globais
      this.setupGlobalErrorHandlers();

      // 7. Configura cleanup handlers
      this.setupCleanupHandlers();

      this.initialized = true;
      logger.info('Contabilease application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application', { error });
      throw error;
    }
  }

  /**
   * Inicializa sistema de performance
   */
  private async initializePerformance(): Promise<void> {
    logger.info('Initializing performance monitoring');

    if (typeof window !== 'undefined') {
      initPerformanceMonitoring({
        endpoint: this.config.performance.endpoint,
        debug: process.env.NODE_ENV === 'development',
        sampleRate: this.config.performance.sampleRate,
      });
    }

    logger.info('Performance monitoring initialized');
  }

  /**
   * Inicializa sistema de telemetria
   */
  private async initializeTelemetry(): Promise<void> {
    logger.info('Initializing telemetry system');

    telemetryManager.updateConfig({
      enabled: this.config.telemetry.enabled,
      sampleRate: this.config.telemetry.sampleRate,
      batchSize: this.config.telemetry.batchSize,
    });

    logger.info('Telemetry system initialized');
  }

  /**
   * Inicializa sistema de cache
   */
  private async initializeCache(): Promise<void> {
    logger.info('Initializing cache system');

    // Cache já é inicializado automaticamente
    // Aqui podemos fazer configurações adicionais se necessário

    logger.info('Cache system initialized', {
      contractCache: contractCache.getStats(),
      userCache: userCache.getStats(),
      calculationCache: calculationCache.getStats(),
      apiCache: apiCache.getStats(),
    });
  }

  /**
   * Inicializa health check
   */
  private async initializeHealthCheck(): Promise<void> {
    logger.info('Initializing health check system');

    // Health check é inicializado automaticamente
    // Aqui podemos fazer verificações iniciais

    logger.info('Health check system initialized');
  }

  /**
   * Inicializa análise de bundles
   */
  private async initializeBundleAnalysis(): Promise<void> {
    logger.info('Initializing bundle analysis');

    // Bundle analysis é inicializado automaticamente
    // Aqui podemos fazer análise inicial se necessário

    logger.info('Bundle analysis initialized');
  }

  /**
   * Configura error handlers globais
   */
  private setupGlobalErrorHandlers(): void {
    logger.info('Setting up global error handlers');

    if (typeof window !== 'undefined') {
      // Error handler para JavaScript
      window.addEventListener('error', event => {
        logger.error('Global JavaScript error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
      });

      // Error handler para promises rejeitadas
      window.addEventListener('unhandledrejection', event => {
        logger.error('Unhandled promise rejection', {
          reason: event.reason,
          promise: event.promise,
        });
      });
    }

    logger.info('Global error handlers configured');
  }

  /**
   * Configura cleanup handlers
   */
  private setupCleanupHandlers(): void {
    logger.info('Setting up cleanup handlers');

    if (typeof window !== 'undefined') {
      // Cleanup antes de descarregar a página
      window.addEventListener('beforeunload', () => {
        logger.info('Application cleanup started');

        // Flush telemetry
        telemetryManager.destroy();

        // Clear caches se necessário
        if (!this.config.cache.persist) {
          contractCache.clear();
          userCache.clear();
          calculationCache.clear();
          apiCache.clear();
        }

        logger.info('Application cleanup completed');
      });
    }

    logger.info('Cleanup handlers configured');
  }

  /**
   * Obtém status da inicialização
   */
  getStatus(): {
    initialized: boolean;
    config: AppInitConfig;
    systems: {
      performance: boolean;
      telemetry: boolean;
      cache: boolean;
      healthCheck: boolean;
      bundleAnalysis: boolean;
    };
  } {
    return {
      initialized: this.initialized,
      config: this.config,
      systems: {
        performance: this.config.performance.enabled,
        telemetry: this.config.telemetry.enabled,
        cache: this.config.cache.enabled,
        healthCheck: this.config.monitoring.healthCheck,
        bundleAnalysis: this.config.monitoring.bundleAnalysis,
      },
    };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<AppInitConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('App configuration updated', updates);
  }

  /**
   * Destrói a aplicação
   */
  destroy(): void {
    logger.info('Destroying application');

    // Destrói telemetry
    telemetryManager.destroy();

    // Limpa caches
    contractCache.clear();
    userCache.clear();
    calculationCache.clear();
    apiCache.clear();

    this.initialized = false;
    logger.info('Application destroyed');
  }
}

// Instância singleton
const appInitializer = new AppInitializer();

/**
 * Inicializa a aplicação
 */
export async function initializeApp(config?: Partial<AppInitConfig>): Promise<void> {
  if (config) {
    appInitializer.updateConfig(config);
  }

  return appInitializer.initialize();
}

/**
 * Obtém status da aplicação
 */
export function getAppStatus() {
  return appInitializer.getStatus();
}

/**
 * Destrói a aplicação
 */
export function destroyApp(): void {
  appInitializer.destroy();
}

/**
 * Hook para inicialização em componentes React
 */
export function useAppInitialization(config?: Partial<AppInitConfig>) {
  const [status, setStatus] = React.useState(() => appInitializer.getStatus());

  const initialize = React.useCallback(async () => {
    try {
      await initializeApp(config);
      setStatus(appInitializer.getStatus());
    } catch (error) {
      logger.error('Failed to initialize app in component', { error });
    }
  }, [config]);

  const destroy = React.useCallback(() => {
    destroyApp();
    setStatus(appInitializer.getStatus());
  }, []);

  React.useEffect(() => {
    if (!status.initialized) {
      initialize().catch(error => {
        logger.error('Error initializing app:', error);
      });
    }

    return () => {
      // Cleanup opcional no unmount
    };
  }, [initialize, status.initialized]);

  return {
    status,
    initialize,
    destroy,
  };
}

/**
 * Configurações pré-definidas para diferentes ambientes
 */
export const appConfigs = {
  development: {
    performance: {
      enabled: true,
      sampleRate: 1.0,
      endpoint: '/api/performance',
    },
    telemetry: {
      enabled: true,
      sampleRate: 1.0,
      batchSize: 10,
    },
    cache: {
      enabled: true,
      persist: false,
    },
    monitoring: {
      healthCheck: true,
      bundleAnalysis: true,
    },
  },

  production: {
    performance: {
      enabled: true,
      sampleRate: 0.1,
      endpoint: '/api/performance',
    },
    telemetry: {
      enabled: true,
      sampleRate: 0.05,
      batchSize: 100,
    },
    cache: {
      enabled: true,
      persist: true,
    },
    monitoring: {
      healthCheck: true,
      bundleAnalysis: false,
    },
  },

  testing: {
    performance: {
      enabled: false,
      sampleRate: 0,
      endpoint: '/api/performance',
    },
    telemetry: {
      enabled: false,
      sampleRate: 0,
      batchSize: 1,
    },
    cache: {
      enabled: false,
      persist: false,
    },
    monitoring: {
      healthCheck: false,
      bundleAnalysis: false,
    },
  },
} as const;
