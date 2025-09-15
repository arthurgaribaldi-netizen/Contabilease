import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Telemetry Traces API Endpoint
 * POST /api/telemetry/traces - Recebe traces distribuídos
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

    // Processa eventos de traces e spans
    const traces = events.filter(event => event.type === 'trace' || event.type === 'span');
    
    // Agrupa por traceId
    const traceGroups = new Map<string, any[]>();
    
    for (const trace of traces) {
      const traceId = trace.traceId || 'unknown';
      if (!traceGroups.has(traceId)) {
        traceGroups.set(traceId, []);
      }
      traceGroups.get(traceId)!.push(trace);
    }

    // Processa cada trace
    for (const [traceId, traceEvents] of traceGroups) {
      logger.info('Trace received', {
        traceId,
        eventCount: traceEvents.length,
        operations: traceEvents.map(e => e.name),
        duration: this.calculateTraceDuration(traceEvents),
      });

      // Aqui você pode integrar com serviços como:
      // - Jaeger
      // - Zipkin
      // - DataDog APM
      // - New Relic APM
      // - AWS X-Ray
    }

    return NextResponse.json({
      success: true,
      processed: traces.length,
      traceGroups: traceGroups.size,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Telemetry traces API error', { error });
    
    return NextResponse.json(
      {
        error: 'Failed to process traces',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Calcula duração total do trace
 */
function calculateTraceDuration(traceEvents: any[]): number | null {
  const startEvents = traceEvents.filter(e => e.data.startTime);
  const endEvents = traceEvents.filter(e => e.data.endTime);
  
  if (startEvents.length === 0 || endEvents.length === 0) {
    return null;
  }
  
  const startTime = Math.min(...startEvents.map(e => e.data.startTime));
  const endTime = Math.max(...endEvents.map(e => e.data.endTime));
  
  return endTime - startTime;
}
