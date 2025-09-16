/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { z } from 'zod';

// Constants for contract modification limits
const CONTRACT_MODIFICATION_LIMITS = {
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PAYMENT_CHANGE_PERCENT: -100,
  MAX_PAYMENT_CHANGE_PERCENT: 100,
} as const;

// Schema for contract modifications
export const contractModificationSchema = z.object({
  // Basic modification information
  id: z.string().optional(),
  modification_date: z.string().min(1, 'Data da modificação é obrigatória'),
  modification_type: z.enum([
    'term_extension', // Extensão de prazo
    'term_reduction', // Redução de prazo
    'payment_change', // Mudança no valor do pagamento
    'rate_change', // Mudança na taxa de desconto
    'asset_change', // Mudança no ativo
    'termination', // Rescisão antecipada
    'renewal', // Renovação
    'other', // Outras modificações
  ]),
  description: z
    .string()
    .min(1, 'Descrição da modificação é obrigatória')
    .max(CONTRACT_MODIFICATION_LIMITS.MAX_DESCRIPTION_LENGTH),

  // Modification details
  effective_date: z.string().min(1, 'Data de vigência é obrigatória'),

  // Term modifications
  new_term_months: z.number().int().min(1).optional(),
  term_change_months: z.number().int().optional(), // Positive for extension, negative for reduction

  // Payment modifications
  new_monthly_payment: z.number().min(0).optional(),
  payment_change_amount: z.number().optional(), // Positive for increase, negative for decrease
  payment_change_percentage: z
    .number()
    .min(CONTRACT_MODIFICATION_LIMITS.MIN_PAYMENT_CHANGE_PERCENT)
    .max(CONTRACT_MODIFICATION_LIMITS.MAX_PAYMENT_CHANGE_PERCENT)
    .optional(), // Percentage change

  // Rate modifications
  new_discount_rate_annual: z.number().min(0).max(100).optional(),
  rate_change_amount: z.number().optional(), // Absolute change
  rate_change_percentage: z.number().min(-100).max(100).optional(), // Percentage change

  // Asset modifications
  new_asset_fair_value: z.number().min(0).optional(),
  asset_change_amount: z.number().optional(),

  // Termination details
  termination_date: z.string().optional(),
  termination_fee: z.number().min(0).optional(),
  termination_reason: z.string().optional(),

  // Renewal details
  renewal_term_months: z.number().int().min(1).optional(),
  renewal_monthly_payment: z.number().min(0).optional(),
  renewal_discount_rate: z.number().min(0).max(100).optional(),

  // Financial impact
  modification_fee: z.number().min(0).optional(),
  additional_costs: z.number().min(0).optional(),
  incentives_received: z.number().min(0).optional(),

  // Approval and documentation
  approved_by: z.string().optional(),
  approval_date: z.string().optional(),
  supporting_documents: z.array(z.string()).optional(),

  // Status
  status: z.enum(['pending', 'approved', 'rejected', 'effective', 'cancelled']).default('pending'),

  // Notes
  notes: z.string().max(1000).optional(),
});

export type ContractModificationFormData = z.infer<typeof contractModificationSchema>;

// Schema for modification calculation results
export const modificationCalculationResultSchema = z.object({
  // Before modification values
  before_modification: z.object({
    lease_liability: z.number(),
    right_of_use_asset: z.number(),
    remaining_term_months: z.number(),
    monthly_payment: z.number(),
    discount_rate_annual: z.number(),
  }),

  // After modification values
  after_modification: z.object({
    lease_liability: z.number(),
    right_of_use_asset: z.number(),
    remaining_term_months: z.number(),
    monthly_payment: z.number(),
    discount_rate_annual: z.number(),
  }),

  // Impact analysis
  impact: z.object({
    liability_change: z.number(),
    asset_change: z.number(),
    payment_change: z.number(),
    rate_change: z.number(),
    term_change: z.number(),
    net_impact: z.number(),
  }),

  // New amortization schedule
  new_amortization_schedule: z.array(
    z.object({
      period: z.number().int(),
      date: z.string(),
      beginning_liability: z.number(),
      interest_expense: z.number(),
      principal_payment: z.number(),
      ending_liability: z.number(),
      beginning_asset: z.number(),
      amortization: z.number(),
      ending_asset: z.number(),
    })
  ),

  // Summary
  summary: z.object({
    modification_type: z.string(),
    effective_date: z.string(),
    total_impact: z.number(),
    new_total_payments: z.number(),
    new_total_interest: z.number(),
    new_effective_rate: z.number(),
  }),
});

export type ModificationCalculationResult = z.infer<typeof modificationCalculationResultSchema>;

// Extended contract type with modification history
export type ContractWithModifications = {
  id: string;
  user_id: string;
  title: string;
  status: string;
  currency_code: string | null;
  created_at: string;
  updated_at: string;
  modifications: ContractModificationFormData[];
  current_calculation: ModificationCalculationResult | null;
};
