import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Telemetry Metrics API Endpoint
 * POST /api/telemetry/metrics - Recebe métricas de telemetria
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events must be an array' },
        { status: 400 }
      );
    }

    // Processa eventos de métricas
    const metrics = events.filter(event => event.type === 'metric');
    
    for (const metric of metrics) {
      logger.info('Metric received', {
        name: metric.name,
        value: metric.data.value,
        unit: metric.data.unit,
        tags: metric.tags,
        timestamp: metric.timestamp,
      });
    }

    // Aqui você pode integrar com serviços como:
    // - DataDog
    // - New Relic
    // - Prometheus
    // - CloudWatch
    // - InfluxDB

    return NextResponse.json({
      success: true,
      processed: metrics.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Telemetry metrics API error', { error });
    
    return NextResponse.json(
      {
        error: 'Failed to process metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
