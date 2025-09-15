/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { amortizationCache } from '@/lib/cache/amortization-cache';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// interface AmortizationQueryParams {
//   page?: string;
//   limit?: string;
//   contractId: string;
// }

// GET /api/contracts/[id]/amortization - Get paginated amortization schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Check cache first
    const cacheKey = amortizationCache.generateAmortizationKey(contractId, page, limit);
    const cachedData = amortizationCache.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Validate contract ownership
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Get the latest calculation for this contract
    const { data: calculation, error: calculationError } = await supabase
      .from('ifrs16_calculations')
      .select('id, amortization_schedule')
      .eq('contract_id', contractId)
      .order('calculation_date', { ascending: false })
      .limit(1)
      .single();

    if (calculationError || !calculation) {
      return NextResponse.json(
        { error: 'No amortization schedule found for this contract' },
        { status: 404 }
      );
    }

    const amortizationSchedule = calculation.amortization_schedule as any[];
    const totalItems = amortizationSchedule.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated data
    const paginatedData = amortizationSchedule.slice(offset, offset + limit);

    // Calculate summary data for the current page
    const pageSummary = {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    const responseData = {
      data: paginatedData,
      pagination: pageSummary,
    };

    // Cache the response
    amortizationCache.set(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Error fetching amortization schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/contracts/[id]/amortization/summary - Get amortization summary data
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;

    // Check cache first
    const cacheKey = amortizationCache.generateSummaryKey(contractId);
    const cachedData = amortizationCache.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Validate contract ownership
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Get the latest calculation with summary data
    const { data: calculation, error: calculationError } = await supabase
      .from('ifrs16_calculations')
      .select(`
        id,
        lease_liability_initial,
        right_of_use_asset_initial,
        total_interest_expense,
        total_principal_payments,
        total_lease_payments,
        effective_interest_rate_annual,
        effective_interest_rate_monthly
      `)
      .eq('contract_id', contractId)
      .order('calculation_date', { ascending: false })
      .limit(1)
      .single();

    if (calculationError || !calculation) {
      return NextResponse.json(
        { error: 'No calculation found for this contract' },
        { status: 404 }
      );
    }

    const responseData = {
      summary: calculation,
    };

    // Cache the response
    amortizationCache.set(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Error fetching amortization summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
