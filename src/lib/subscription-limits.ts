import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export interface SubscriptionLimits {
  maxContracts: number;
  maxUsers: number;
  currentContracts: number;
  currentUsers: number;
  planName: string;
  canCreateContract: boolean;
  canAddUser: boolean;
}

export interface SubscriptionFeatures {
  exportExcel: boolean;
  apiAccess: boolean;
  customReports: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

/**
 * Get user's current subscription limits and usage
 */
export async function getUserSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  try {
    // Get user's current subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(
        `
        subscription_plans!inner (
          name,
          max_contracts,
          max_users,
          features
        ),
        status
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      // Fallback to free plan if no active subscription
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuito')
        .single();

      if (!freePlan) {
        throw new Error('Free plan not found');
      }

      const { data: usage } = await supabase
        .from('subscription_usage')
        .select('contracts_count')
        .eq('user_id', userId)
        .single();

      return {
        maxContracts: freePlan.max_contracts,
        maxUsers: freePlan.max_users,
        currentContracts: usage?.contracts_count || 0,
        currentUsers: 1,
        planName: freePlan.name,
        canCreateContract: (usage?.contracts_count || 0) < freePlan.max_contracts,
        canAddUser: false, // Free plan doesn't support multiple users
      };
    }

    // Get current usage
    const { data: usage } = await supabase
      .from('subscription_usage')
      .select('contracts_count, users_count')
      .eq('user_id', userId)
      .single();

    const plan = subscription.subscription_plans as any;
    const currentContracts = usage?.contracts_count || 0;
    const currentUsers = usage?.users_count || 1;

    return {
      maxContracts: plan.max_contracts,
      maxUsers: plan.max_users,
      currentContracts,
      currentUsers,
      planName: plan.name,
      canCreateContract: currentContracts < plan.max_contracts,
      canAddUser: currentUsers < plan.max_users,
    };
  } catch (error) {
    logger.error('Error getting subscription limits:', { error: String(error) });
    throw error;
  }
}

/**
 * Get user's subscription features
 */
export async function getUserSubscriptionFeatures(userId: string): Promise<SubscriptionFeatures> {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(
        `
        subscription_plans!inner (
          features
        ),
        status
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      // Fallback to free plan features
      return {
        exportExcel: false,
        apiAccess: false,
        customReports: false,
        whiteLabel: false,
        prioritySupport: false,
      };
    }

    const features = (subscription.subscription_plans as any).features || {};

    return {
      exportExcel: features.export_excel || false,
      apiAccess: features.api_access || false,
      customReports: features.custom_reports || false,
      whiteLabel: features.white_label || false,
      prioritySupport: features.priority_support || false,
    };
  } catch (error) {
    logger.error('Error getting subscription features:', { error: String(error) });
    return {
      exportExcel: false,
      apiAccess: false,
      customReports: false,
      whiteLabel: false,
      prioritySupport: false,
    };
  }
}

/**
 * Check if user can perform a specific action
 */
export async function canUserPerformAction(
  userId: string,
  action:
    | 'create_contract'
    | 'add_user'
    | 'export_excel'
    | 'api_access'
    | 'custom_reports'
    | 'white_label'
): Promise<boolean> {
  try {
    const limits = await getUserSubscriptionLimits(userId);
    const features = await getUserSubscriptionFeatures(userId);

    switch (action) {
      case 'create_contract':
        return limits.canCreateContract;
      case 'add_user':
        return limits.canAddUser;
      case 'export_excel':
        return features.exportExcel;
      case 'api_access':
        return features.apiAccess;
      case 'custom_reports':
        return features.customReports;
      case 'white_label':
        return features.whiteLabel;
      default:
        return false;
    }
  } catch (error) {
    logger.error('Error checking user permissions:', { error: String(error) });
    return false;
  }
}

/**
 * Update subscription usage when contracts are created/deleted
 */
export async function updateSubscriptionUsage(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_subscription_usage', {
      user_uuid: userId,
    });

    if (error) {
      logger.error('Error updating subscription usage:', { error: String(error) });
    }
  } catch (error) {
    logger.error('Error updating subscription usage:', { error: String(error) });
  }
}
