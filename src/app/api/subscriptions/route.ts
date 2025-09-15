import { logger } from '@/lib/logger';
import { getUserSubscriptionFeatures, getUserSubscriptionLimits } from '@/lib/subscription-limits';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/subscriptions - Get user's current subscription
export async function GET(request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription details
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        subscription_plans!inner (
          id,
          name,
          description,
          price_monthly,
          price_yearly,
          max_contracts,
          max_users,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      // Return free plan if no active subscription
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuito')
        .single();

      if (!freePlan) {
        return NextResponse.json({ error: 'No subscription plan found' }, { status: 404 });
      }

      const limits = await getUserSubscriptionLimits(userId);
      const features = await getUserSubscriptionFeatures(userId);

      return NextResponse.json({
        subscription: {
          id: null,
          status: 'active',
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          subscription_plans: freePlan,
        },
        limits,
        features,
      });
    }

    const limits = await getUserSubscriptionLimits(userId);
    const features = await getUserSubscriptionFeatures(userId);

    return NextResponse.json({
      subscription,
      limits,
      features,
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
