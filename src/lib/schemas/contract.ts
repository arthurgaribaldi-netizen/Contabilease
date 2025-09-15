/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { z } from 'zod';

export const contractSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled', 'modified']),
  currency_code: z
    .string()
    .length(3, 'Código da moeda deve ter exatamente 3 caracteres')
    .optional()
    .or(z.literal('')),
  // IFRS 16 Financial Fields
  contract_value: z.number().min(0, 'Valor do contrato deve ser positivo').optional(),
  contract_term_months: z
    .number()
    .int('Prazo deve ser um número inteiro')
    .min(1, 'Prazo deve ser pelo menos 1 mês')
    .max(600, 'Prazo máximo de 50 anos (600 meses)')
    .optional(),
  implicit_interest_rate: z
    .number()
    .min(0, 'Taxa de juros deve ser positiva')
    .max(100, 'Taxa de juros máxima de 100%')
    .optional(),
  guaranteed_residual_value: z
    .number()
    .min(0, 'Valor residual garantido deve ser positivo')
    .optional(),
  purchase_option_price: z.number().min(0, 'Preço da opção de compra deve ser positivo').optional(),
  purchase_option_exercise_date: z.string().optional().or(z.literal('')),
  lease_start_date: z.string().optional().or(z.literal('')),
  lease_end_date: z.string().optional().or(z.literal('')),
  payment_frequency: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']).optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;
