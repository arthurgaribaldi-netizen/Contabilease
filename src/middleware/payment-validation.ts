/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export interface UserSubscription {
  plan: keyof typeof SUBSCRIPTION_PLANS;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodEnd: string;
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      plan: data.plan as keyof typeof SUBSCRIPTION_PLANS,
      status: data.status as UserSubscription['status'],
      currentPeriodEnd: data.current_period_end,
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Check if user can create a new contract based on their subscription
 */
export async function canCreateContract(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      // User has no active subscription, check if they can use free plan
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking contracts:', error);
        return false;
      }

      return contracts.length < SUBSCRIPTION_PLANS.FREE.maxContracts;
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan];
    
    // Check current contract count
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking contracts:', error);
      return false;
    }

    return contracts.length < plan.maxContracts;
  } catch (error) {
    console.error('Error checking contract creation permission:', error);
    return false;
  }
}

/**
 * Require paid subscription for access
 */
export async function requirePaidSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return false;
  }

  return subscription.plan !== 'FREE' && subscription.status === 'active';
}

/**
 * Validate user payment status
 */
export async function validateUserPayment(userId: string): Promise<{
  isValid: boolean;
  subscription?: UserSubscription;
  canCreateContract: boolean;
  requiresUpgrade?: boolean;
}> {
  try {
    const subscription = await getUserSubscription(userId);
    const canCreate = await canCreateContract(userId);
    
    if (!subscription) {
      return {
        isValid: false,
        canCreateContract: canCreate,
        requiresUpgrade: !canCreate,
      };
    }

    const isValid = subscription.status === 'active';
    const requiresUpgrade = !canCreate && subscription.plan === 'FREE';

    return {
      isValid,
      subscription,
      canCreateContract: canCreate,
      requiresUpgrade,
    };
  } catch (error) {
    console.error('Error validating user payment:', error);
    return {
      isValid: false,
      canCreateContract: false,
      requiresUpgrade: true,
    };
  }
}
