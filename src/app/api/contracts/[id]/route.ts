/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { invalidateContractCache } from '@/lib/cache/ifrs16-cache';
import { logger } from '@/lib/logger';
import { contractSchema } from '@/lib/schemas/contract';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/contracts/[id] - Obter contrato específico
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      logger.error(
        'Error fetching contract:',
        {
          component: 'route',
          operation: 'fetchContract',
        },
        error as Error
      );
      return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
    }

    return NextResponse.json({ contract: data });
  } catch (error) {
    logger.error(
      'Unexpected error:',
      {
        component: 'route',
        operation: 'handleRequest',
      },
      error as Error
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/contracts/[id] - Atualizar contrato
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate contract data using the schema
    const validationResult = contractSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid contract data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const contractData = validationResult.data;

    const updateData: any = {};
    if (contractData.title !== undefined) updateData.title = contractData.title;
    if (contractData.status !== undefined) updateData.status = contractData.status;
    if (contractData.currency_code !== undefined)
      updateData.currency_code = contractData.currency_code || null;
    if (contractData.contract_value !== undefined)
      updateData.contract_value = contractData.contract_value || null;
    if (contractData.contract_term_months !== undefined)
      updateData.contract_term_months = contractData.contract_term_months || null;
    if (contractData.implicit_interest_rate !== undefined)
      updateData.implicit_interest_rate = contractData.implicit_interest_rate || null;
    if (contractData.guaranteed_residual_value !== undefined)
      updateData.guaranteed_residual_value = contractData.guaranteed_residual_value || null;
    if (contractData.purchase_option_price !== undefined)
      updateData.purchase_option_price = contractData.purchase_option_price || null;
    if (contractData.purchase_option_exercise_date !== undefined)
      updateData.purchase_option_exercise_date = contractData.purchase_option_exercise_date || null;
    if (contractData.lease_start_date !== undefined)
      updateData.lease_start_date = contractData.lease_start_date || null;
    if (contractData.lease_end_date !== undefined)
      updateData.lease_end_date = contractData.lease_end_date || null;
    if (contractData.payment_frequency !== undefined)
      updateData.payment_frequency = contractData.payment_frequency || null;

    const { data, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      logger.error(
        'Error updating contract:',
        {
          component: 'route',
          operation: 'updateContract',
        },
        error as Error
      );
      return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }

    // Invalidate cache for this contract since data has changed
    invalidateContractCache(params.id, data);

    return NextResponse.json({ contract: data });
  } catch (error) {
    logger.error(
      'Unexpected error:',
      {
        component: 'route',
        operation: 'handleRequest',
      },
      error as Error
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/contracts/[id] - Excluir contrato
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      logger.error(
        'Error deleting contract:',
        {
          component: 'route',
          operation: 'deleteContract',
        },
        error as Error
      );
      return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    logger.error(
      'Unexpected error:',
      {
        component: 'route',
        operation: 'handleRequest',
      },
      error as Error
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
