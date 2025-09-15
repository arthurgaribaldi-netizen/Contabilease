/**
 * Sistema de Telemetria e Observabilidade para Contabilease
 * Implementa coleta de métricas, logs estruturados e rastreamento distribuído
 */

import { logger } from '@/lib/logger';
import React from 'react';

export interface TelemetryEvent {
  id: string;
  type: 'metric' | 'log' | 'trace' | 'span';
  name: string;
  timestamp: number;
  data: Record<string, unknown>;
  tags: Record<string, string>;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
}

export interface TelemetryConfig {
  enabled: boolean;
  sampleRate: number; // 0-1
  batchSize: number;
  flushInterval: number; // ms
  maxRetries: number;
  endpoints: {
    metrics: string;
    logs: string;
    traces: string;
  };
  tags: Record<string, string>;
}

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface LogData {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  tags?: Record<string, string>;
}

export interface TraceData {
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, string>;
  logs?: Array<{ timestamp: number; message: string; level: string }>;
}

class TelemetryManager {
  private config: TelemetryConfig;
  private events: TelemetryEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;
  private traceContext: { traceId: string; spanId: string } | null = null;

  constructor(config?: Partial<TelemetryConfig>) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      batchSize: 100,
      flushInterval: 30000, // 30 segundos
      maxRetries: 3,
      endpoints: {
        metrics: '/api/telemetry/metrics',
        logs: '/api/telemetry/logs',
        traces: '/api/telemetry/traces',
      },
      tags: {
        service: 'contabilease',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      ...config,
    };

    this.startFlushTimer();
  }

  /**
   * Registra métrica
   */
  recordMetric(data: MetricData): void {
    if (!this.shouldSample()) return;

    const event: TelemetryEvent = {
      id: this.generateId(),
      type: 'metric',
      name: data.name,
      timestamp: data.timestamp || Date.now(),
      data: {
        value: data.value,
        unit: data.unit,
      },
      tags: { ...this.config.tags, ...data.tags },
      traceId: this.traceContext?.traceId,
      spanId: this.traceContext?.spanId,
    };

    this.addEvent(event);
    logger.debug(`Metric recorded: ${data.name}`, { value: data.value, tags: data.tags });
  }

  /**
   * Registra log estruturado
   */
  recordLog(data: LogData): void {
    if (!this.shouldSample()) return;

    const event: TelemetryEvent = {
      id: this.generateId(),
      type: 'log',
      name: data.level,
      timestamp: Date.now(),
      data: {
        message: data.message,
        context: data.context,
      },
      tags: { ...this.config.tags, ...data.tags },
      traceId: this.traceContext?.traceId,
      spanId: this.traceContext?.spanId,
    };

    this.addEvent(event);
    logger.debug(`Log recorded: ${data.level}`, { message: data.message });
  }

  /**
   * Inicia trace distribuído
   */
  startTrace(operationName: string, tags?: Record<string, string>): string {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    
    this.traceContext = { traceId, spanId };

    const event: TelemetryEvent = {
      id: this.generateId(),
      type: 'trace',
      name: operationName,
      timestamp: Date.now(),
      data: {
        startTime: Date.now(),
      },
      tags: { ...this.config.tags, ...tags },
      traceId,
      spanId,
    };

    this.addEvent(event);
    logger.debug(`Trace started: ${operationName}`, { traceId, spanId });
    
    return spanId;
  }

  /**
   * Finaliza trace
   */
  finishTrace(spanId: string, tags?: Record<string, string>): void {
    const endTime = Date.now();
    
    const event: TelemetryEvent = {
      id: this.generateId(),
      type: 'trace',
      name: 'trace_finish',
      timestamp: endTime,
      data: {
        endTime,
        duration: endTime - (this.traceContext?.traceId ? Date.now() : endTime),
      },
      tags: { ...this.config.tags, ...tags },
      traceId: this.traceContext?.traceId,
      spanId,
    };

    this.addEvent(event);
    logger.debug(`Trace finished: ${spanId}`, { duration: event.data.duration });
  }

  /**
   * Cria span dentro de trace
   */
  createSpan(operationName: string, parentSpanId?: string, tags?: Record<string, string>): string {
    const spanId = this.generateSpanId();
    
    const event: TelemetryEvent = {
      id: this.generateId(),
      type: 'span',
      name: operationName,
      timestamp: Date.now(),
      data: {
        startTime: Date.now(),
      },
      tags: { ...this.config.tags, ...tags },
      traceId: this.traceContext?.traceId,
      spanId,
      parentSpanId: parentSpanId || this.traceContext?.spanId,
    };

    this.addEvent(event);
    logger.debug(`Span created: ${operationName}`, { spanId, parentSpanId });
    
    return spanId;
  }

  /**
   * Finaliza span
   */
  finishSpan(spanId: string, tags?: Record<string, string>): void {
    const endTime = Date.now();
    
    const event: TelemetryEvent = {
      id: this.generateId(),
      type: 'span',
      name: 'span_finish',
      timestamp: endTime,
      data: {
        endTime,
        duration: endTime - Date.now(), // Será calculado corretamente na implementação real
      },
      tags: { ...this.config.tags, ...tags },
      traceId: this.traceContext?.traceId,
      spanId,
    };

    this.addEvent(event);
    logger.debug(`Span finished: ${spanId}`, { duration: event.data.duration });
  }

  /**
   * Adiciona evento à fila
   */
  private addEvent(event: TelemetryEvent): void {
    if (!this.config.enabled) return;

    this.events.push(event);

    // Flush automático se atingir batch size
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Verifica se deve fazer sample
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera Trace ID
   */
  private generateTraceId(): string {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  /**
   * Gera Span ID
   */
  private generateSpanId(): string {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  /**
   * Inicia timer de flush
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush eventos para endpoints
   */
  async flush(): Promise<void> {
    if (this.isFlushing || this.events.length === 0) return;

    this.isFlushing = true;
    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Agrupa eventos por tipo
      const metrics = eventsToFlush.filter(e => e.type === 'metric');
      const logs = eventsToFlush.filter(e => e.type === 'log');
      const traces = eventsToFlush.filter(e => e.type === 'trace' || e.type === 'span');

      // Envia em paralelo
      await Promise.allSettled([
        this.sendEvents(this.config.endpoints.metrics, metrics),
        this.sendEvents(this.config.endpoints.logs, logs),
        this.sendEvents(this.config.endpoints.traces, traces),
      ]);

      logger.debug(`Telemetry flushed: ${eventsToFlush.length} events`);
    } catch (error) {
      logger.error('Telemetry flush failed', { error });
      
      // Recoloca eventos na fila para retry
      this.events.unshift(...eventsToFlush);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Envia eventos para endpoint
   */
  private async sendEvents(endpoint: string, events: TelemetryEvent[]): Promise<void> {
    if (events.length === 0) return;

    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
        });

        if (response.ok) {
          return;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await this.sleep(Math.pow(2, retries) * 1000);
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtém estatísticas de telemetria
   */
  getStats(): {
    eventsInQueue: number;
    isFlushing: boolean;
    config: TelemetryConfig;
  } {
    return {
      eventsInQueue: this.events.length,
      isFlushing: this.isFlushing,
      config: { ...this.config },
    };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.flushInterval) {
      this.startFlushTimer();
    }
    
    logger.info('Telemetry configuration updated', updates);
  }

  /**
   * Destrói o manager
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    this.flush();
  }
}

// Instância singleton
export const telemetryManager = new TelemetryManager();

/**
 * Funções de conveniência para telemetria
 */
export function recordMetric(data: MetricData): void {
  telemetryManager.recordMetric(data);
}

export function recordLog(data: LogData): void {
  telemetryManager.recordLog(data);
}

export function startTrace(operationName: string, tags?: Record<string, string>): string {
  return telemetryManager.startTrace(operationName, tags);
}

export function finishTrace(spanId: string, tags?: Record<string, string>): void {
  telemetryManager.finishTrace(spanId, tags);
}

export function createSpan(operationName: string, parentSpanId?: string, tags?: Record<string, string>): string {
  return telemetryManager.createSpan(operationName, parentSpanId, tags);
}

export function finishSpan(spanId: string, tags?: Record<string, string>): void {
  telemetryManager.finishSpan(spanId, tags);
}

/**
 * Decorator para telemetria automática
 */
export function withTelemetry(operationName: string, tags?: Record<string, string>) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const spanId = createSpan(`${operationName}.${propertyKey}`, undefined, tags);
      
      try {
        const result = await originalMethod.apply(this, args);
        
        recordMetric({
          name: `${operationName}.${propertyKey}.success`,
          value: 1,
          tags: { ...tags, status: 'success' },
        });
        
        return result;
      } catch (error) {
        recordMetric({
          name: `${operationName}.${propertyKey}.error`,
          value: 1,
          tags: { ...tags, status: 'error', error: error instanceof Error ? error.message : 'Unknown' },
        });
        
        throw error;
      } finally {
        finishSpan(spanId);
      }
    };

    return descriptor;
  };
}

/**
 * Hook para telemetria em componentes React
 */
export function useTelemetry() {
  const recordMetric = React.useCallback((data: MetricData) => {
    telemetryManager.recordMetric(data);
  }, []);

  const recordLog = React.useCallback((data: LogData) => {
    telemetryManager.recordLog(data);
  }, []);

  const startTrace = React.useCallback((operationName: string, tags?: Record<string, string>) => {
    return telemetryManager.startTrace(operationName, tags);
  }, []);

  const finishTrace = React.useCallback((spanId: string, tags?: Record<string, string>) => {
    telemetryManager.finishTrace(spanId, tags);
  }, []);

  return {
    recordMetric,
    recordLog,
    startTrace,
    finishTrace,
    stats: telemetryManager.getStats(),
  };
}

/**
 * Utilitários para métricas comuns
 */
export const metrics = {
  // Métricas de performance
  performance: {
    pageLoad: (duration: number, page: string) => recordMetric({
      name: 'page.load.duration',
      value: duration,
      unit: 'ms',
      tags: { page },
    }),
    
    apiCall: (duration: number, endpoint: string, status: string) => recordMetric({
      name: 'api.call.duration',
      value: duration,
      unit: 'ms',
      tags: { endpoint, status },
    }),
    
    renderTime: (duration: number, component: string) => recordMetric({
      name: 'component.render.duration',
      value: duration,
      unit: 'ms',
      tags: { component },
    }),
  },
  
  // Métricas de negócio
  business: {
    userAction: (action: string, userId?: string) => recordMetric({
      name: 'user.action',
      value: 1,
      tags: { action, userId: userId || 'anonymous' },
    }),
    
    contractCreated: (userId: string, contractType: string) => recordMetric({
      name: 'contract.created',
      value: 1,
      tags: { userId, contractType },
    }),
    
    calculationPerformed: (userId: string, calculationType: string) => recordMetric({
      name: 'calculation.performed',
      value: 1,
      tags: { userId, calculationType },
    }),
  },
  
  // Métricas de erro
  errors: {
    javascriptError: (error: string, page: string) => recordMetric({
      name: 'error.javascript',
      value: 1,
      tags: { error, page },
    }),
    
    apiError: (endpoint: string, status: number) => recordMetric({
      name: 'error.api',
      value: 1,
      tags: { endpoint, status: status.toString() },
    }),
    
    validationError: (field: string, rule: string) => recordMetric({
      name: 'error.validation',
      value: 1,
      tags: { field, rule },
    }),
  },
};
