/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import {
  calculateModificationImpact,
  createContractModification,
  fetchContractModifications,
} from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { contractModificationSchema } from '@/lib/schemas/contract-modification';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/contracts/[id]/modifications - Criar modificação de contrato
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contractId = params.id;

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { calculate_impact = false } = body;

    // Validate modification data
    const validationResult = contractModificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid modification data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Create modification
    const modification = await createContractModification(contractId, validationResult.data);

    let impact = null;

    // Calculate impact if requested
    if (calculate_impact) {
      try {
        impact = await calculateModificationImpact(contractId, validationResult.data);
      } catch (error) {
        logger.error(
          'Error calculating impact:',
          {
            component: 'route',
            operation: 'calculateImpact',
          },
          error as Error
        );
        // Don't fail the request if impact calculation fails
      }
    }

    return NextResponse.json(
      {
        modification,
        impact,
        message: 'Modification created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(
      'Error creating modification:',
      {
        component: 'route',
        operation: 'operation',
      },
      error as Error
    );

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      if (error.message.includes('Invalid modification data')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Failed to create modification' }, { status: 500 });
  }
}

// GET /api/contracts/[id]/modifications - Listar modificações do contrato
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contractId = params.id;

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    // Fetch modifications
    const modifications = await fetchContractModifications(contractId);

    return NextResponse.json({
      modifications,
      count: modifications.length,
    });
  } catch (error) {
    logger.error(
      'Error fetching modifications:',
      {
        component: 'route',
        operation: 'operation',
      },
      error as Error
    );

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to fetch modifications' }, { status: 500 });
  }
}
