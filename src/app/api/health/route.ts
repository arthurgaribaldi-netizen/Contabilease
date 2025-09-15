import { quickHealthCheck, runHealthCheck } from '@/lib/health/health-check';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Health Check API Endpoint
 * GET /api/health - Health check completo
 * GET /api/health/live - Health check rápido (liveness probe)
 */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const isLiveCheck = url.pathname.endsWith('/live');

    if (isLiveCheck) {
      // Liveness probe - verificação rápida
      const result = await quickHealthCheck();
      
      return NextResponse.json(result, {
        status: result.status === 'ok' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    } else {
      // Health check completo
      const result = await runHealthCheck();
      
      const statusCode = result.status === 'healthy' ? 200 : 
                        result.status === 'degraded' ? 200 : 503;
      
      return NextResponse.json(result, {
        status: statusCode,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
  } catch (error) {
    logger.error('Health check API error', { error });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}