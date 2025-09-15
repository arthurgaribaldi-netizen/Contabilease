import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/subscriptions/plans - Get available subscription plans
export async function GET(_request: NextRequest) {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      logger.error('Error fetching subscription plans:', error);
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (error) {
    logger.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
