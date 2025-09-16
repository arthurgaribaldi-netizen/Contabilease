import { ContractFormData } from '@/lib/schemas/contract';
import { supabase } from '@/lib/supabase';

export type Contract = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: string;
  currency_code: string | null;
  // IFRS 16 Financial Fields
  contract_value: number | null;
  contract_term_months: number | null;
  implicit_interest_rate: number | null;
  guaranteed_residual_value: number | null;
  purchase_option_price: number | null;
  purchase_option_exercise_date: string | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  payment_frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | null;
  // Additional fields for AI automation and ESG
  monthly_payment?: number | null;
  discount_rate_annual?: number | null;
  lease_classification?: 'operating' | 'finance' | null;
  lessor_name?: string | null;
  lessee_name?: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchContractsForCurrentUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return [] as Contract[];

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Contract[];
}

export async function createContract(data: ContractFormData) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase.from('contracts').insert({
    user_id: userId,
    title: data.title,
    status: data.status,
    currency_code: data.currency_code || null,
    contract_value: data.contract_value || null,
    contract_term_months: data.contract_term_months || null,
    implicit_interest_rate: data.implicit_interest_rate || null,
    guaranteed_residual_value: data.guaranteed_residual_value || null,
    purchase_option_price: data.purchase_option_price || null,
    purchase_option_exercise_date: data.purchase_option_exercise_date || null,
    lease_start_date: data.lease_start_date || null,
    lease_end_date: data.lease_end_date || null,
    payment_frequency: data.payment_frequency || null,
  });

  if (error) throw error;
}

export async function fetchContractById(contractId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Contract not found');
    }
    throw error;
  }

  return data as Contract;
}

export async function updateContract(
  contractId: string,
  data: {
    title?: string;
    status?: string;
    currency_code?: string;
    contract_value?: number;
    contract_term_months?: number;
    implicit_interest_rate?: number;
    guaranteed_residual_value?: number;
    purchase_option_price?: number;
    purchase_option_exercise_date?: string;
    lease_start_date?: string;
    lease_end_date?: string;
    payment_frequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  }
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('contracts')
    .update({
      ...(data.title && { title: data.title }),
      ...(data.status && { status: data.status }),
      ...(data.currency_code !== undefined && { currency_code: data.currency_code || null }),
      ...(data.contract_value !== undefined && { contract_value: data.contract_value || null }),
      ...(data.contract_term_months !== undefined && {
        contract_term_months: data.contract_term_months || null,
      }),
      ...(data.implicit_interest_rate !== undefined && {
        implicit_interest_rate: data.implicit_interest_rate || null,
      }),
      ...(data.guaranteed_residual_value !== undefined && {
        guaranteed_residual_value: data.guaranteed_residual_value || null,
      }),
      ...(data.purchase_option_price !== undefined && {
        purchase_option_price: data.purchase_option_price || null,
      }),
      ...(data.purchase_option_exercise_date !== undefined && {
        purchase_option_exercise_date: data.purchase_option_exercise_date || null,
      }),
      ...(data.lease_start_date !== undefined && {
        lease_start_date: data.lease_start_date || null,
      }),
      ...(data.lease_end_date !== undefined && { lease_end_date: data.lease_end_date || null }),
      ...(data.payment_frequency !== undefined && {
        payment_frequency: data.payment_frequency || null,
      }),
    })
    .eq('id', contractId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function deleteContract(contractId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', contractId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Contract modification functions
export async function createContractModification(contractId: string, modificationData: any) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('contract_modifications')
    .insert({
      contract_id: contractId,
      user_id: userId,
      ...modificationData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchContractModifications(contractId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('contract_modifications')
    .select('*')
    .eq('contract_id', contractId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function approveModification(modificationId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('contract_modifications')
    .update({
      status: 'approved',
      approved_by: userId,
      approval_date: new Date().toISOString(),
    })
    .eq('id', modificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Modification not found');
  return data;
}

export async function activateModification(modificationId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('contract_modifications')
    .update({
      status: 'effective',
      activated_by: userId,
      activation_date: new Date().toISOString(),
    })
    .eq('id', modificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Modification not found');
  return data;
}

export async function calculateModificationImpact(contractId: string, modificationData: any) {
  // Placeholder for modification impact calculation
  return {
    liability_change: 0,
    asset_change: 0,
    payment_change: 0,
  };
}

// IFRS 16 specific contract creation function
export async function createIFRS16LeaseContract(data: any) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase.from('contracts').insert({
    user_id: userId,
    title: data.title,
    status: data.status || 'active',
    currency_code: data.currency_code || 'BRL',
    contract_value: data.monthly_payment || null,
    contract_term_months: data.lease_term_months || null,
    implicit_interest_rate: data.discount_rate_annual || null,
    guaranteed_residual_value: data.guaranteed_residual_value || null,
    lease_start_date: data.lease_start_date || null,
    lease_end_date: data.lease_end_date || null,
    payment_frequency: data.payment_frequency || 'monthly',
  });

  if (error) throw error;
}
