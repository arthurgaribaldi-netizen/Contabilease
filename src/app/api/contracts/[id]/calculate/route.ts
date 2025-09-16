/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { CACHE_TTL, ifrs16Cache } from '@/lib/cache/ifrs16-cache';
import { BasicIFRS16Calculator } from '@/lib/calculations/ifrs16-basic';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// POST /api/contracts/[id]/calculate - Calculate IFRS 16 values for a contract
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch contract data
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (contractError) {
      if (contractError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      logger.error('Error fetching contract:', {
      component: 'route',
      operation: 'operation'
    }, contractError as Error);
      return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
    }

    // Validate that contract has required financial data
    if (
      !contract.contract_value ||
      !contract.contract_term_months ||
      contract.implicit_interest_rate === null
    ) {
      return NextResponse.json(
        {
          error: 'Contract missing required financial data for IFRS 16 calculations',
          details:
            'Contract must have contract_value, contract_term_months, and implicit_interest_rate',
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResult = ifrs16Cache.get(params.id, contract);
    if (cachedResult) {
      return NextResponse.json({
        contract_id: params.id,
        calculation: cachedResult,
        cached: true,
        cache_stats: ifrs16Cache.getStats(),
      });
    }

    // Perform IFRS 16 calculations if not in cache
    const calculator = new BasicIFRS16Calculator(contract);

    // Validate contract data
    const validation = calculator.validateContractData();
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid contract data for IFRS 16 calculations',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Calculate all values
    const calculationResult = calculator.calculateAll();

    // Store result in cache
    ifrs16Cache.set(params.id, contract, calculationResult, CACHE_TTL.MEDIUM);

    return NextResponse.json({
      contract_id: params.id,
      calculation: calculationResult,
      cached: false,
      cache_stats: ifrs16Cache.getStats(),
    });
  } catch (error) {
    logger.error('Unexpected error:', {
      component: 'route',
      operation: 'operation'
    }, error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
