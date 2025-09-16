/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { CONTRACT_LIMITS } from '@/lib/constants/validation-limits';
import { z } from 'zod';

export const contractSchema = z.object({
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
  // IFRS 16 Financial Fields
  contract_value: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Valor do contrato deve ser positivo')
    .optional(),
  contract_term_months: z
    .number()
    .int('Prazo deve ser um número inteiro')
    .min(CONTRACT_LIMITS.TERM_MIN_MONTHS, 'Prazo deve ser pelo menos 1 mês')
    .max(CONTRACT_LIMITS.TERM_MAX_MONTHS, 'Prazo máximo de 50 anos (600 meses)')
    .optional(),
  implicit_interest_rate: z
    .number()
    .min(CONTRACT_LIMITS.INTEREST_RATE_MIN, 'Taxa de juros deve ser positiva')
    .max(CONTRACT_LIMITS.INTEREST_RATE_MAX, 'Taxa de juros máxima de 100%')
    .optional(),
  guaranteed_residual_value: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Valor residual garantido deve ser positivo')
    .optional(),
  purchase_option_price: z
    .number()
    .min(CONTRACT_LIMITS.PAYMENT_MIN, 'Preço da opção de compra deve ser positivo')
    .optional(),
  purchase_option_exercise_date: z.string().optional().or(z.literal('')),
  lease_start_date: z.string().optional().or(z.literal('')),
  lease_end_date: z.string().optional().or(z.literal('')),
  payment_frequency: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']).optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;
