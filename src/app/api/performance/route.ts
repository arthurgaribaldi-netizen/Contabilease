/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number | string;
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
}

interface PerformancePayload {
  metrics: PerformanceMetric[];
  sessionId: string;
  timestamp: number;
}

/**
 * Endpoint para receber métricas de performance do cliente
 * POST /api/performance
 */
export async function POST(request: NextRequest) {
  try {
    const payload: PerformancePayload = await request.json();

    // Validação básica
    if (!payload.metrics || !Array.isArray(payload.metrics)) {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    // Processa métricas
    const processedMetrics = payload.metrics.map(metric => ({
      ...metric,
      receivedAt: new Date().toISOString(),
      serverTimestamp: Date.now(),
    }));

    // Log das métricas (em produção, enviar para serviço de monitoramento)
    await logger.info(
      'Performance metrics received',
      {
        component: 'performance-api',
        operation: 'POST',
        sessionId: payload.sessionId,
        metricCount: processedMetrics.length,
      },
      undefined,
      {
        metrics: processedMetrics,
      }
    );

    // Em produção, aqui você integraria com serviços como:
    // - Google Analytics 4
    // - Mixpanel
    // - PostHog
    // - DataDog
    // - New Relic
    // - Sentry Performance Monitoring

    // Exemplo de integração com Google Analytics 4
    if (process.env['GOOGLE_ANALYTICS_ID']) {
      await sendToGoogleAnalytics(processedMetrics, payload.sessionId);
    }

    // Exemplo de integração com serviço customizado
    if (process.env['PERFORMANCE_WEBHOOK_URL']) {
      await sendToWebhook(processedMetrics, payload.sessionId);
    }

    // Armazena métricas críticas para análise
    await storeCriticalMetrics(processedMetrics);

    return NextResponse.json({
      success: true,
      processed: processedMetrics.length,
    });
  } catch (error) {
    await logger.error(
      'Error processing performance metrics',
      {
        component: 'performance-api',
        operation: 'POST',
      },
      error as Error
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Envia métricas para Google Analytics 4
 */
async function sendToGoogleAnalytics(_metrics: PerformanceMetric[], _sessionId: string) {
  try {
    // Implementar envio para GA4
    // const ga4Payload = {
    //   client_id: sessionId,
    //   events: metrics.map(metric => ({
    //     name: 'web_vitals',
    //     parameters: {
    //       metric_name: metric.name,
    //       metric_value: typeof metric.value === 'number' ? metric.value : 0,
    //       metric_delta: metric.delta,
    //       page_url: metric.url,
    //       user_agent: metric.userAgent,
    //     },
    //   })),
    // };
    // await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env['GOOGLE_ANALYTICS_ID']}&api_secret=${process.env['GOOGLE_ANALYTICS_SECRET']}`, {
    //   method: 'POST',
    //   body: JSON.stringify(ga4Payload)
    // });
  } catch (error) {
    await logger.error(
      'Error sending metrics to GA4',
      {
        component: 'performance-api',
        operation: 'sendToGoogleAnalytics',
      },
      error as Error
    );
  }
}

/**
 * Envia métricas para webhook customizado
 */
async function sendToWebhook(metrics: PerformanceMetric[], sessionId: string) {
  try {
    const webhookPayload = {
      sessionId,
      timestamp: new Date().toISOString(),
      metrics: metrics.map(metric => ({
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        url: metric.url,
        userAgent: metric.userAgent,
        connection: metric.connection,
      })),
    };

    await fetch(process.env['PERFORMANCE_WEBHOOK_URL']!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env['PERFORMANCE_WEBHOOK_TOKEN']}`,
      },
      body: JSON.stringify(webhookPayload),
    });
  } catch (error) {
    await logger.error(
      'Error sending metrics to webhook',
      {
        component: 'performance-api',
        operation: 'sendToWebhook',
      },
      error as Error
    );
  }
}

/**
 * Armazena métricas críticas para análise posterior
 */
async function storeCriticalMetrics(metrics: PerformanceMetric[]) {
  try {
    // Filtra apenas métricas críticas
    const criticalMetrics = metrics.filter(metric =>
      ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(metric.name)
    );

    if (criticalMetrics.length === 0) return;

    // Aqui você integraria com seu banco de dados
    // Exemplo com Supabase:
    // const { data, error } = await supabase
    //   .from('performance_metrics')
    //   .insert(criticalMetrics.map(metric => ({
    //     name: metric.name,
    //     value: metric.value,
    //     delta: metric.delta,
    //     url: metric.url,
    //     user_agent: metric.userAgent,
    //     connection: metric.connection,
    //     timestamp: new Date(metric.timestamp).toISOString()
    //   })));

    // Log para desenvolvimento
    await logger.debug(
      'Storing critical performance metrics',
      {
        component: 'performance-api',
        operation: 'storeCriticalMetrics',
      },
      undefined,
      {
        criticalMetrics,
      }
    );
  } catch (error) {
    await logger.error(
      'Error storing performance metrics',
      {
        component: 'performance-api',
        operation: 'storeCriticalMetrics',
      },
      error as Error
    );
  }
}

/**
 * Endpoint para obter estatísticas de performance
 * GET /api/performance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const metric = searchParams.get('metric') || 'all';

    // Aqui você consultaria seu banco de dados para obter estatísticas
    // Exemplo de resposta:
    const stats = {
      timeframe,
      metric,
      data: {
        LCP: { p50: 2500, p75: 3000, p95: 4000 },
        FID: { p50: 50, p75: 100, p95: 200 },
        CLS: { p50: 0.05, p75: 0.1, p95: 0.2 },
        FCP: { p50: 1500, p75: 2000, p95: 3000 },
        TTFB: { p50: 500, p75: 800, p95: 1500 },
      },
      totalSessions: 1250,
      avgSessionDuration: 180000, // 3 minutos
      bounceRate: 0.35,
    };

    return NextResponse.json(stats);
  } catch (error) {
    await logger.error(
      'Error getting performance stats',
      {
        component: 'performance-api',
        operation: 'GET',
      },
      error as Error
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
