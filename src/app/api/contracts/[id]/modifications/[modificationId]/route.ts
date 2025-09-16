/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { activateModification, approveModification } from '@/lib/contracts';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// PUT /api/contracts/[id]/modifications/[modificationId] - Aprovar ou ativar modificação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; modificationId: string } }
) {
  try {
    const { modificationId } = params;
    const body = await request.json();
    const { action } = body;

    if (!modificationId) {
      return NextResponse.json({ error: 'Modification ID is required' }, { status: 400 });
    }

    if (!action || !['approve', 'activate'].includes(action)) {
      return NextResponse.json(
        {
          error: 'Invalid action. Must be "approve" or "activate"',
        },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      await approveModification(modificationId);
    } else if (action === 'activate') {
      await activateModification(modificationId);
    }

    return NextResponse.json({
      success: true,
      action,
      message: `Modification ${action}d successfully`,
    });
  } catch (error) {
    logger.error('Error updating modification:', {
      component: 'route',
      operation: 'operation'
    }, error as Error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'Modification not found' }, { status: 404 });
      }
      if (error.message.includes('must be approved')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Failed to update modification' }, { status: 500 });
  }
}
