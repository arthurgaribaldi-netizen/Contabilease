/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary IFRS 16 schema definitions and validation rules.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { CONTRACT_LIMITS } from '@/lib/constants/validation-limits';
import { z } from 'zod';

// Base lease contract schema for IFRS 16 calculations
export const ifrs16LeaseSchema = z.object({
  // Basic contract information
  title: z
    .string()
    .min(CONTRACT_LIMITS.TITLE_MIN_LENGTH, 'Título é obrigatório')
    .max(CONTRACT_LIMITS.TITLE_MAX_LENGTH, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled', 'modified']),
  currency_code: z
    .string()
    .length(
      CONTRACT_LIMITS.CURRENCY_CODE_LENGTH,
      'Código da moeda deve ter exatamente 3 caracteres'
    )
    .optional()
    .or(z.literal('')),

  // Lease terms and dates
  lease_start_date: z
    .string()
    .min(CONTRACT_LIMITS.TITLE_MIN_LENGTH, 'Data de início do contrato é obrigatória'),
  lease_end_date: z
    .string()
    .min(CONTRACT_LIMITS.TITLE_MIN_LENGTH, 'Data de fim do contrato é obrigatória'),
  lease_term_months: z
    .number()
    .int()
    .min(CONTRACT_LIMITS.TERM_MIN_MONTHS, 'Prazo do contrato deve ser pelo menos 1 mês'),

  // Financial terms
  initial_payment: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Pagamento inicial não pode ser negativo')
    .optional(),
  monthly_payment: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Pagamento mensal não pode ser negativo'),
  annual_payment: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Pagamento anual não pode ser negativo')
    .optional(),
  payment_frequency: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']),

  // Discount rate and calculations
  discount_rate_annual: z
    .number()
    .min(CONTRACT_LIMITS.INTEREST_RATE_MIN, 'Taxa de desconto não pode ser negativa')
    .max(CONTRACT_LIMITS.INTEREST_RATE_MAX, 'Taxa de desconto não pode ser maior que 100%'),
  discount_rate_monthly: z
    .number()
    .min(CONTRACT_LIMITS.INTEREST_RATE_MIN)
    .max(CONTRACT_LIMITS.INTEREST_RATE_MAX)
    .optional(),

  // Asset information
  asset_fair_value: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Valor justo do ativo não pode ser negativo')
    .optional(),
  asset_residual_value: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Valor residual não pode ser negativo')
    .optional(),

  // Additional costs and fees
  initial_direct_costs: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Custos diretos iniciais não podem ser negativos')
    .optional(),
  lease_incentives: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Incentivos de leasing não podem ser negativos')
    .optional(),

  // Payment timing
  payment_timing: z.enum(['beginning', 'end']), // Beginning or end of period

  // Lease classification
  lease_classification: z.enum(['operating', 'finance']).optional(),

  // Optional fields for complex scenarios
  escalation_rate: z
    .number()
    .min(CONTRACT_LIMITS.INTEREST_RATE_MIN)
    .max(CONTRACT_LIMITS.INTEREST_RATE_MAX)
    .optional(), // Annual escalation rate
  variable_payments: z
    .array(
      z.object({
        date: z.string(),
        amount: z.number().min(CONTRACT_LIMITS.PAYMENT_MIN),
        description: z.string().optional(),
      })
    )
    .optional(),

  // Guaranteed residual value
  guaranteed_residual_value: z.number().min(CONTRACT_LIMITS.PAYMENT_MIN).optional(),

  // Purchase option
  purchase_option_price: z.number().min(CONTRACT_LIMITS.PAYMENT_MIN).optional(),
  purchase_option_exercisable: z.boolean().optional(),

  // Renewal options
  renewal_options: z
    .array(
      z.object({
        term_months: z.number().int().min(CONTRACT_LIMITS.TERM_MIN_MONTHS),
        monthly_payment: z.number().min(CONTRACT_LIMITS.PAYMENT_MIN),
        probability: z
          .number()
          .min(CONTRACT_LIMITS.INTEREST_RATE_MIN)
          .max(CONTRACT_LIMITS.INTEREST_RATE_MAX)
          .optional(), // Probability of renewal
      })
    )
    .optional(),
});

export type IFRS16LeaseFormData = z.infer<typeof ifrs16LeaseSchema>;

// Schema for calculation results
export const ifrs16CalculationResultSchema = z.object({
  // Lease Liability calculations
  lease_liability_initial: z.number(),
  lease_liability_current: z.number(),

  // Right-of-use Asset calculations
  right_of_use_asset_initial: z.number(),
  right_of_use_asset_current: z.number(),

  // Monthly calculations
  monthly_interest_expense: z.number(),
  monthly_principal_payment: z.number(),
  monthly_amortization: z.number(),

  // Amortization schedule
  amortization_schedule: z.array(
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

  // Summary totals
  total_interest_expense: z.number(),
  total_principal_payments: z.number(),
  total_lease_payments: z.number(),

  // Effective interest rate
  effective_interest_rate_annual: z.number(),
  effective_interest_rate_monthly: z.number(),
});

export type IFRS16CalculationResult = z.infer<typeof ifrs16CalculationResultSchema>;

// Extended contract type that includes IFRS 16 fields
export type IFRS16LeaseContract = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
} & IFRS16LeaseFormData;
