/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary copyright monitoring API endpoints.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { getSessionOrRedirect } from '@/lib/auth/requireSession';
import { logger } from '@/lib/logger';
import { getCopyrightViolations, reportManualViolation } from '@/lib/security/copyright-monitoring';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/copyright-violations
 * Get all copyright violations (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const session = await getSessionOrRedirect('pt-BR');
    if (!session || session.user?.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const violations = getCopyrightViolations();
    
    return NextResponse.json({
      violations,
      total: violations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching copyright violations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/copyright-violations
 * Report a manual copyright violation
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const session = await getSessionOrRedirect('pt-BR');
    if (!session || session.user?.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, severity, source, description, evidence } = body;

    // Validate required fields
    if (!type || !severity || !source || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, severity, source, description' },
        { status: 400 }
      );
    }

    // Report the violation
    reportManualViolation({
      type,
      severity,
      source,
      description,
      evidence: evidence || [],
      status: 'detected'
    });

    logger.info('Manual copyright violation reported', {
      reportedBy: session.user.id,
      type,
      severity,
      source
    });

    return NextResponse.json({
      message: 'Copyright violation reported successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error reporting copyright violation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
