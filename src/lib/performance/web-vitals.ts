/**
 * Sistema de monitoramento de performance Web Vitals
 * Implementa métricas Core Web Vitals para monitoramento de UX
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB, type Metric } from 'web-vitals';

interface PerformanceConfig {
  endpoint: string;
  debug: boolean;
  sampleRate: number;
}

interface CustomMetric extends Metric {
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: CustomMetric[] = [];
  private isEnabled: boolean = true;

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Verifica se deve coletar métricas baseado na taxa de amostragem
    if (Math.random() > this.config.sampleRate) {
      this.isEnabled = false;
      return;
    }

    // Coleta métricas Core Web Vitals
    this.collectWebVitals();

    // Coleta métricas customizadas
    this.collectCustomMetrics();

    // Monitora mudanças de visibilidade da página
    this.monitorPageVisibility();
  }

  private collectWebVitals() {
    // Largest Contentful Paint
    getLCP(metric => {
      this.handleMetric(metric, 'LCP');
    });

    // First Input Delay
    getFID(metric => {
      this.handleMetric(metric, 'FID');
    });

    // Cumulative Layout Shift
    getCLS(metric => {
      this.handleMetric(metric, 'CLS');
    });

    // First Contentful Paint
    getFCP(metric => {
      this.handleMetric(metric, 'FCP');
    });

    // Time to First Byte
    getTTFB(metric => {
      this.handleMetric(metric, 'TTFB');
    });
  }

  private collectCustomMetrics() {
    // Tempo de carregamento da página
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordCustomMetric('page_load_time', loadTime);
    });

    // Tempo de interação
    let firstInteraction = true;
    const interactionHandler = () => {
      if (firstInteraction) {
        const interactionTime = performance.now();
        this.recordCustomMetric('time_to_interaction', interactionTime);
        firstInteraction = false;

        // Remove listeners após primeira interação
        document.removeEventListener('click', interactionHandler);
        document.removeEventListener('keydown', interactionHandler);
        document.removeEventListener('touchstart', interactionHandler);
      }
    };

    document.addEventListener('click', interactionHandler);
    document.addEventListener('keydown', interactionHandler);
    document.addEventListener('touchstart', interactionHandler);

    // Monitora recursos carregados
    this.monitorResourceTiming();
  }

  private monitorResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;

            // Registra recursos lentos (> 1s)
            if (resourceEntry.duration > 1000) {
              this.recordCustomMetric('slow_resource', {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize,
                type: this.getResourceType(resourceEntry.name),
              });
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private monitorPageVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Envia métricas quando a página fica oculta
        this.flushMetrics();
      }
    });

    // Envia métricas antes da página ser descarregada
    window.addEventListener('beforeunload', () => {
      this.flushMetrics();
    });
  }

  private handleMetric(metric: Metric, type: string) {
    const customMetric: CustomMetric = {
      ...metric,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
    };

    this.metrics.push(customMetric);

    if (this.config.debug) {
      console.log(`[Performance] ${type}:`, customMetric);
    }

    // Avalia se a métrica está dentro dos limites recomendados
    this.evaluateMetric(customMetric, type);
  }

  private recordCustomMetric(name: string, value: number | object) {
    const metric: CustomMetric = {
      name,
      value: typeof value === 'number' ? value : JSON.stringify(value),
      delta: typeof value === 'number' ? value : 0,
      id: `${name}_${Date.now()}`,
      navigationType: 'navigate',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
    };

    this.metrics.push(metric);

    if (this.config.debug) {
      console.log(`[Performance] Custom ${name}:`, metric);
    }
  }

  private evaluateMetric(metric: CustomMetric, type: string) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[type as keyof typeof thresholds];
    if (!threshold) return;

    const value = metric.value as number;
    let rating: 'good' | 'needs-improvement' | 'poor';

    if (value <= threshold.good) {
      rating = 'good';
    } else if (value <= threshold.poor) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }

    // Registra avaliação da métrica
    this.recordCustomMetric(`${type}_rating`, {
      value,
      rating,
      threshold: threshold.good,
    });
  }

  private getConnectionInfo(): string | undefined {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return `${connection.effectiveType}_${connection.downlink}Mbps`;
    }
    return undefined;
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private async flushMetrics() {
    if (this.metrics.length === 0 || !this.isEnabled) return;

    try {
      const payload = {
        metrics: this.metrics,
        sessionId: this.getSessionId(),
        timestamp: Date.now(),
      };

      if (this.config.debug) {
        console.log('[Performance] Sending metrics:', payload);
      }

      // Envia métricas para endpoint configurado
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true, // Importante para beforeunload
      });

      this.metrics = []; // Limpa métricas após envio
    } catch (error) {
      console.error('[Performance] Failed to send metrics:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  // Métodos públicos
  public recordCustomEvent(name: string, value: number | object) {
    this.recordCustomMetric(name, value);
  }

  public recordNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      this.recordCustomMetric('navigation_timing', {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        totalTime: navigation.loadEventEnd - navigation.navigationStart,
      });
    }
  }

  public getMetrics(): CustomMetric[] {
    return [...this.metrics];
  }

  public clearMetrics() {
    this.metrics = [];
  }
}

// Instância global do monitor
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Inicializa o monitor de performance
 */
export function initPerformanceMonitoring(config: PerformanceConfig) {
  if (typeof window === 'undefined') return;

  performanceMonitor = new PerformanceMonitor(config);

  // Registra timing de navegação após carregamento
  if (document.readyState === 'complete') {
    performanceMonitor.recordNavigationTiming();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor?.recordNavigationTiming();
    });
  }
}

/**
 * Registra evento customizado de performance
 */
export function recordPerformanceEvent(name: string, value: number | object) {
  performanceMonitor?.recordCustomEvent(name, value);
}

/**
 * Obtém métricas coletadas
 */
export function getPerformanceMetrics(): CustomMetric[] {
  return performanceMonitor?.getMetrics() || [];
}

/**
 * Limpa métricas coletadas
 */
export function clearPerformanceMetrics() {
  performanceMonitor?.clearMetrics();
}

// Configuração padrão
const defaultConfig: PerformanceConfig = {
  endpoint: '/api/performance',
  debug: process.env.NODE_ENV === 'development',
  sampleRate: 1.0, // 100% em desenvolvimento, ajustar para produção
};

// Auto-inicialização em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  initPerformanceMonitoring(defaultConfig);
}
