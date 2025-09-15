/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { z } from 'zod';

/**
 * Schema completo para contratos IFRS 16 com todos os campos obrigatórios
 * e suporte a modificações contratuais
 */

// Enum para tipos de ativo
export const AssetTypeEnum = z.enum([
  'real_estate', // Imóvel
  'equipment', // Equipamento
  'vehicle', // Veículo
  'machinery', // Maquinário
  'technology', // Tecnologia
  'other', // Outro
]);

// Enum para tipos de modificação
export const ModificationTypeEnum = z.enum([
  'term_extension', // Extensão de prazo
  'term_reduction', // Redução de prazo
  'payment_increase', // Aumento de pagamento
  'payment_decrease', // Redução de pagamento
  'rate_change', // Alteração de taxa
  'asset_change', // Alteração de ativo
  'classification_change', // Alteração de classificação
  'other', // Outro
]);

// Schema para informações das partes contratuais
export const ContractPartiesSchema = z.object({
  lessee: z.object({
    name: z.string().min(1, 'Nome do arrendatário é obrigatório'),
    tax_id: z.string().optional(), // CNPJ/CPF
    address: z.string().optional(),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
  }),
  lessor: z.object({
    name: z.string().min(1, 'Nome do arrendador é obrigatório'),
    tax_id: z.string().optional(), // CNPJ/CPF
    address: z.string().optional(),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
  }),
});

// Schema para informações do ativo
export const AssetInformationSchema = z.object({
  asset_type: AssetTypeEnum,
  asset_description: z.string().min(1, 'Descrição do ativo é obrigatória'),
  asset_identification: z.string().optional(), // Número de série, placa, etc.
  asset_location: z.string().optional(),
  asset_condition: z.enum(['new', 'used', 'refurbished']).optional(),
  asset_useful_life_years: z.number().min(1).max(100).optional(),
});

// Schema para modificações contratuais
export const ContractModificationSchema = z.object({
  id: z.string(),
  modification_date: z.string(),
  modification_type: ModificationTypeEnum,
  effective_date: z.string(),
  description: z.string().min(1, 'Descrição da modificação é obrigatória'),
  justification: z.string().optional(),

  // Campos alterados
  old_values: z.record(z.string(), z.any()).optional(),
  new_values: z.record(z.string(), z.any()).optional(),

  // Aprovação
  approved_by: z.string().optional(),
  approval_date: z.string().optional(),

  // Impacto financeiro
  financial_impact: z
    .object({
      liability_change: z.number().optional(),
      asset_change: z.number().optional(),
      payment_change: z.number().optional(),
    })
    .optional(),
});

// Schema para opções contratuais
export const ContractOptionsSchema = z.object({
  // Opções de renovação
  renewal_options: z
    .array(
      z.object({
        id: z.string(),
        renewal_date: z.string(),
        new_term_months: z.number().int().min(1),
        new_monthly_payment: z.number().min(0),
        probability_percentage: z.number().min(0).max(100).optional(),
        conditions: z.string().optional(),
      })
    )
    .optional(),

  // Opções de rescisão antecipada
  early_termination_options: z
    .array(
      z.object({
        id: z.string(),
        termination_date: z.string(),
        penalty_amount: z.number().min(0),
        conditions: z.string().optional(),
      })
    )
    .optional(),

  // Opções de compra
  purchase_options: z
    .array(
      z.object({
        id: z.string(),
        exercise_date: z.string(),
        purchase_price: z.number().min(0),
        exercisable: z.boolean(),
        conditions: z.string().optional(),
      })
    )
    .optional(),
});

// Schema principal expandido do IFRS 16
export const IFRS16CompleteSchema = z.object({
  // Identificação do contrato
  contract_id: z.string().min(1, 'ID do contrato é obrigatório'),
  contract_number: z.string().optional(),
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled', 'modified']),

  // Informações das partes
  parties: ContractPartiesSchema,

  // Informações do ativo
  asset: AssetInformationSchema,

  // Datas e termos
  lease_start_date: z.string().min(1, 'Data de início do contrato é obrigatória'),
  lease_end_date: z.string().min(1, 'Data de fim do contrato é obrigatória'),
  lease_term_months: z.number().int().min(1, 'Prazo do contrato deve ser pelo menos 1 mês'),

  // Termos financeiros
  currency_code: z.string().length(3, 'Código da moeda deve ter exatamente 3 caracteres'),

  // Pagamentos
  initial_payment: z.number().min(0, 'Pagamento inicial não pode ser negativo').optional(),
  monthly_payment: z.number().min(0, 'Pagamento mensal não pode ser negativo'),
  payment_frequency: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']),
  payment_timing: z.enum(['beginning', 'end']),

  // Taxas e cálculos
  discount_rate_annual: z
    .number()
    .min(0, 'Taxa de desconto não pode ser negativa')
    .max(100, 'Taxa de desconto não pode ser maior que 100%'),
  discount_rate_monthly: z.number().min(0).max(100).optional(),

  // Valores do ativo
  asset_fair_value: z.number().min(0, 'Valor justo do ativo não pode ser negativo').optional(),
  asset_residual_value: z.number().min(0, 'Valor residual não pode ser negativo').optional(),
  guaranteed_residual_value: z.number().min(0).optional(),

  // Custos e incentivos
  initial_direct_costs: z
    .number()
    .min(0, 'Custos diretos iniciais não podem ser negativos')
    .optional(),
  lease_incentives: z.number().min(0, 'Incentivos de leasing não podem ser negativos').optional(),

  // Classificação do contrato
  lease_classification: z.enum(['operating', 'finance']),
  classification_justification: z.string().optional(),

  // Opções contratuais
  contract_options: ContractOptionsSchema.optional(),

  // Pagamentos variáveis
  variable_payments: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        amount: z.number().min(0),
        description: z.string().optional(),
        index_type: z.enum(['inflation', 'interest_rate', 'market_rate', 'fixed']).optional(),
      })
    )
    .optional(),

  // Taxa de reajuste
  escalation_rate: z.number().min(0).max(100).optional(),
  escalation_type: z.enum(['fixed', 'inflation', 'market_rate']).optional(),

  // Modificações contratuais
  modifications: z.array(ContractModificationSchema).optional(),

  // Metadados
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string(),
  last_modified_by: z.string().optional(),

  // Auditoria e compliance
  audit_trail: z
    .object({
      last_calculation_date: z.string().optional(),
      last_review_date: z.string().optional(),
      reviewer: z.string().optional(),
      compliance_status: z.enum(['compliant', 'non_compliant', 'under_review']).optional(),
    })
    .optional(),
});

export type IFRS16CompleteData = z.infer<typeof IFRS16CompleteSchema>;
export type ContractParties = z.infer<typeof ContractPartiesSchema>;
export type AssetInformation = z.infer<typeof AssetInformationSchema>;
export type ContractModification = z.infer<typeof ContractModificationSchema>;
export type ContractOptions = z.infer<typeof ContractOptionsSchema>;

// Schema para validação de modificações
export const ContractModificationValidationSchema = z.object({
  modification_type: ModificationTypeEnum,
  effective_date: z.string().min(1, 'Data efetiva é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),

  // Validações específicas por tipo de modificação
  term_changes: z
    .object({
      new_term_months: z.number().int().min(1),
      new_end_date: z.string().optional(),
    })
    .optional(),

  payment_changes: z
    .object({
      new_monthly_payment: z.number().min(0),
      new_frequency: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']).optional(),
    })
    .optional(),

  rate_changes: z
    .object({
      new_discount_rate: z.number().min(0).max(100),
      effective_date: z.string(),
    })
    .optional(),
});

export type ContractModificationValidation = z.infer<typeof ContractModificationValidationSchema>;

// Schema para histórico de cálculos
export const CalculationHistorySchema = z.object({
  calculation_date: z.string(),
  calculation_type: z.enum(['initial', 'modification', 'revaluation', 'year_end']),
  lease_liability: z.number(),
  right_of_use_asset: z.number(),
  monthly_payment: z.number(),
  discount_rate: z.number(),
  modification_id: z.string().optional(),
});

export type CalculationHistory = z.infer<typeof CalculationHistorySchema>;
