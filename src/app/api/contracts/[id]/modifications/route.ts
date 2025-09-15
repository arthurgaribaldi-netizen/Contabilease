import {
    calculateModificationImpact,
    createContractModification,
    fetchContractModifications,
} from '@/lib/contracts';
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
        console.error('Error calculating impact:', error);
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
    console.error('Error creating modification:', error);

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
    console.error('Error fetching modifications:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to fetch modifications' }, { status: 500 });
  }
}
