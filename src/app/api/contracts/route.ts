/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { logger } from '@/lib/logger';
import { contractSchema } from '@/lib/schemas/contract';
import { canUserPerformAction } from '@/lib/subscription-limits';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/contracts - Listar contratos do usuário atual
export async function GET(_request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching contracts:', error);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }

    return NextResponse.json({ contracts: data ?? [] });
  } catch (error) {
    logger.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to validate contract data
function validateContractData(body: unknown) {
  const validationResult = contractSchema.safeParse(body);

  if (!validationResult.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid contract data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: validationResult.data };
}

// Helper function to extract basic contract fields
function extractBasicFields(contractData: Record<string, unknown>) {
  return {
    title: contractData['title'],
    status: contractData['status'],
    currency_code: contractData['currency_code'] ?? null,
    contract_value: contractData['contract_value'] ?? null,
  };
}

// Helper function to extract financial fields
function extractFinancialFields(contractData: Record<string, unknown>) {
  return {
    contract_term_months: contractData['contract_term_months'] ?? null,
    implicit_interest_rate: contractData['implicit_interest_rate'] ?? null,
    guaranteed_residual_value: contractData['guaranteed_residual_value'] ?? null,
    purchase_option_price: contractData['purchase_option_price'] ?? null,
    purchase_option_exercise_date: contractData['purchase_option_exercise_date'] ?? null,
  };
}

// Helper function to extract lease fields
function extractLeaseFields(contractData: Record<string, unknown>) {
  return {
    lease_start_date: contractData['lease_start_date'] ?? null,
    lease_end_date: contractData['lease_end_date'] ?? null,
    payment_frequency: contractData['payment_frequency'] ?? null,
  };
}

// Helper function to prepare contract data for insertion
function prepareContractData(userId: string, contractData: Record<string, unknown>) {
  return {
    user_id: userId,
    ...extractBasicFields(contractData),
    ...extractFinancialFields(contractData),
    ...extractLeaseFields(contractData),
  };
}

// Helper function to create contract in database
async function createContract(userId: string, contractData: Record<string, unknown>) {
  const insertData = prepareContractData(userId, contractData);

  const { data, error } = await supabase.from('contracts').insert(insertData).select().single();

  if (error) {
    logger.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }

  return NextResponse.json({ contract: data }, { status: 201 });
}

// POST /api/contracts - Criar novo contrato (suporta contratos IFRS 16)
export async function POST(request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can create more contracts
    const canCreate = await canUserPerformAction(userId, 'create_contract');
    if (!canCreate) {
      return NextResponse.json({ 
        error: 'Subscription limit reached. Please upgrade your plan to create more contracts.',
        code: 'SUBSCRIPTION_LIMIT_REACHED'
      }, { status: 403 });
    }

    const body = await request.json();
    const validation = validateContractData(body);

    if (!validation.success) {
      return validation.error;
    }

    return await createContract(userId, validation.data as Record<string, unknown>);
  } catch (error) {
    logger.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
