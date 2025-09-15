/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Sistema de Monitoramento e Telemetria
 * Coleta métricas de performance, erros e uso da aplicação
 */

import { logger } from '../logger';

export interface TelemetryEvent {
  event: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  metrics?: Record<string, number>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface ErrorMetric {
  error: string;
  stack?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // em segundos
  lastTriggered?: string;
}

class TelemetryManager {
  private events: TelemetryEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorMetric[] = [];
  private alertRules: AlertRule[] = [];
  private batchSize = 100;
  private flushInterval: NodeJS.Timeout | null = null;
  private endpoint: string;
  private apiKey: string;

  constructor() {
    this.endpoint = process.env.TELEMETRY_ENDPOINT || '';
    this.apiKey = process.env.TELEMETRY_API_KEY || '';
    
    if (typeof window === 'undefined') {
      this.startPeriodicFlush();
    }
  }

  // Eventos de telemetria
  trackEvent(event: string, properties?: Record<string, unknown>, userId?: string): void {
    const telemetryEvent: TelemetryEvent = {
      event,
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.getSessionId(),
      properties,
    };

    this.events.push(telemetryEvent);
    
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // Métricas de performance
  trackPerformance(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Verificar alertas
    this.checkAlertRules(metric);
    
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  // Métricas de erro
  trackError(error: ErrorMetric): void {
    this.errors.push(error);
    
    // Verificar alertas de erro
    this.checkErrorAlertRules(error);
    
    if (this.errors.length >= this.batchSize) {
      this.flushErrors();
    }
  }

  // Métricas de negócio
  trackBusinessMetric(name: string, value: number, context?: Record<string, unknown>): void {
    this.trackPerformance({
      name: `business.${name}`,
      value,
      unit: 'count',
      timestamp: new Date().toISOString(),
      context,
    });
  }

  // Métricas de API
  trackAPICall(endpoint: string, method: string, statusCode: number, duration: number): void {
    this.trackPerformance({
      name: 'api.call',
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      context: {
        endpoint,
        method,
        statusCode,
      },
    });
  }

  // Métricas de página
  trackPageView(path: string, duration?: number): void {
    this.trackEvent('page_view', { path, duration });
    
    if (duration) {
      this.trackPerformance({
        name: 'page.load_time',
        value: duration,
        unit: 'ms',
        timestamp: new Date().toISOString(),
        context: { path },
      });
    }
  }

  // Métricas de usuário
  trackUserAction(action: string, context?: Record<string, unknown>): void {
    this.trackEvent('user_action', { action, ...context });
  }

  // Métricas de performance web vitals
  trackWebVitals(metric: { name: string; value: number; delta: number; id: string }): void {
    this.trackPerformance({
      name: `web_vitals.${metric.name}`,
      value: metric.value,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      context: {
        delta: metric.delta,
        id: metric.id,
      },
    });
  }

  // Verificação de regras de alerta
  private checkAlertRules(metric: PerformanceMetric): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled || rule.metric !== metric.name) continue;
      
      // Verificar cooldown
      if (rule.lastTriggered) {
        const lastTriggered = new Date(rule.lastTriggered);
        const cooldownMs = rule.cooldown * 1000;
        if (Date.now() - lastTriggered.getTime() < cooldownMs) continue;
      }
      
      // Verificar threshold
      let shouldAlert = false;
      switch (rule.operator) {
        case 'gt': shouldAlert = metric.value > rule.threshold; break;
        case 'lt': shouldAlert = metric.value < rule.threshold; break;
        case 'eq': shouldAlert = metric.value === rule.threshold; break;
        case 'gte': shouldAlert = metric.value >= rule.threshold; break;
        case 'lte': shouldAlert = metric.value <= rule.threshold; break;
      }
      
      if (shouldAlert) {
        this.triggerAlert(rule, metric);
      }
    }
  }

  // Verificação de alertas de erro
  private checkErrorAlertRules(error: ErrorMetric): void {
    // Alertar sobre erros críticos
    if (error.error.includes('CRITICAL') || error.error.includes('FATAL')) {
      this.triggerErrorAlert(error);
    }
  }

  // Disparar alerta
  private triggerAlert(rule: AlertRule, metric: PerformanceMetric): void {
    rule.lastTriggered = new Date().toISOString();
    
    const alert = {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      metric: metric.name,
      value: metric.value,
      threshold: rule.threshold,
      timestamp: new Date().toISOString(),
      context: metric.context,
    };

    logger.warn(`Alert triggered: ${rule.name}`, alert);
    
    // Enviar alerta para sistema externo
    this.sendAlert(alert);
  }

  // Disparar alerta de erro
  private triggerErrorAlert(error: ErrorMetric): void {
    const alert = {
      type: 'error_alert',
      severity: 'high',
      error: error.error,
      component: error.component || 'unknown',
      timestamp: error.timestamp,
      context: error.context,
    };

    logger.error(`Error alert triggered`, alert);
    
    // Enviar alerta para sistema externo
    this.sendAlert(alert);
  }

  // Enviar alerta
  private async sendAlert(alert: any): Promise<void> {
    if (!this.endpoint || !this.apiKey) return;

    try {
      await fetch(`${this.endpoint}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      logger.error('Failed to send alert', { error, alert });
    }
  }

  // Flush de eventos
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    await this.sendTelemetry('events', eventsToFlush);
  }

  // Flush de métricas
  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    await this.sendTelemetry('metrics', metricsToFlush);
  }

  // Flush de erros
  private async flushErrors(): Promise<void> {
    if (this.errors.length === 0) return;

    const errorsToFlush = [...this.errors];
    this.errors = [];

    await this.sendTelemetry('errors', errorsToFlush);
  }

  // Envio de telemetria
  private async sendTelemetry(type: string, data: any[]): Promise<void> {
    if (!this.endpoint || !this.apiKey) return;

    try {
      await fetch(`${this.endpoint}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString(),
          source: 'contabilease',
        }),
      });
    } catch (error) {
      logger.error('Failed to send telemetry', { error, type, count: data.length });
    }
  }

  // Flush periódico
  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushEvents();
      this.flushMetrics();
      this.flushErrors();
    }, 30000); // Flush a cada 30 segundos
  }

  // Obter session ID
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('telemetry_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('telemetry_session_id', sessionId);
    }
    return sessionId;
  }

  // Configurar regras de alerta
  configureAlertRules(rules: AlertRule[]): void {
    this.alertRules = rules;
  }

  // Obter estatísticas
  getStats(): {
    events: number;
    metrics: number;
    errors: number;
    alerts: number;
  } {
    return {
      events: this.events.length,
      metrics: this.metrics.length,
      errors: this.errors.length,
      alerts: this.alertRules.filter(rule => rule.lastTriggered).length,
    };
  }

  // Limpeza
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
    this.flushMetrics();
    this.flushErrors();
  }
}

// Instância global
export const telemetry = new TelemetryManager();

// Configurar regras de alerta padrão
telemetry.configureAlertRules([
  {
    id: 'api_slow_response',
    name: 'API Slow Response',
    metric: 'api.call',
    threshold: 2000,
    operator: 'gt',
    severity: 'medium',
    enabled: true,
    cooldown: 300, // 5 minutos
  },
  {
    id: 'page_slow_load',
    name: 'Page Slow Load',
    metric: 'page.load_time',
    threshold: 3000,
    operator: 'gt',
    severity: 'medium',
    enabled: true,
    cooldown: 600, // 10 minutos
  },
  {
    id: 'high_error_rate',
    name: 'High Error Rate',
    metric: 'error.rate',
    threshold: 10,
    operator: 'gt',
    severity: 'high',
    enabled: true,
    cooldown: 300, // 5 minutos
  },
  {
    id: 'memory_usage_high',
    name: 'High Memory Usage',
    metric: 'memory.usage',
    threshold: 100 * 1024 * 1024, // 100MB
    operator: 'gt',
    severity: 'high',
    enabled: true,
    cooldown: 600, // 10 minutos
  },
]);

// Hooks para React
export function useTelemetry() {
  return {
    trackEvent: telemetry.trackEvent.bind(telemetry),
    trackPerformance: telemetry.trackPerformance.bind(telemetry),
    trackError: telemetry.trackError.bind(telemetry),
    trackBusinessMetric: telemetry.trackBusinessMetric.bind(telemetry),
    trackAPICall: telemetry.trackAPICall.bind(telemetry),
    trackPageView: telemetry.trackPageView.bind(telemetry),
    trackUserAction: telemetry.trackUserAction.bind(telemetry),
    trackWebVitals: telemetry.trackWebVitals.bind(telemetry),
  };
}

// Middleware para Next.js
export function withTelemetry(handler: any) {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    
    try {
      const result = await handler(req, res);
      const duration = Date.now() - startTime;
      
      telemetry.trackAPICall(req.url, req.method, res.statusCode, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      telemetry.trackError({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        component: 'api',
        timestamp: new Date().toISOString(),
        context: {
          url: req.url,
          method: req.method,
          duration,
        },
      });
      
      throw error;
    }
  };
}

// Inicialização
export function initializeTelemetry() {
  if (typeof window === 'undefined') return;

  // Track page views
  telemetry.trackPageView(window.location.pathname);
  
  // Track web vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(telemetry.trackWebVitals);
      getFID(telemetry.trackWebVitals);
      getFCP(telemetry.trackWebVitals);
      getLCP(telemetry.trackWebVitals);
      getTTFB(telemetry.trackWebVitals);
    });
  }
  
  logger.info('Telemetry initialized');
}