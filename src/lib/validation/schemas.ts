/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Schemas de Validação Robustos com Zod
 * Validação de entrada para APIs e formulários
 */

import { z } from 'zod';

// Schemas base
export const baseSchemas = {
  id: z.string().uuid('ID deve ser um UUID válido'),
  email: z.string().email('Email deve ter formato válido').max(255, 'Email muito longo'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Telefone deve ter formato válido'),
  currency: z.number().min(0, 'Valor deve ser positivo').max(999999999.99, 'Valor muito alto'),
  percentage: z.number().min(0, 'Percentual deve ser positivo').max(100, 'Percentual não pode ser maior que 100%'),
  date: z.string().datetime('Data deve estar no formato ISO 8601'),
  url: z.string().url('URL deve ter formato válido'),
};

// Schemas de autenticação
export const authSchemas = {
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, 'Senha é obrigatória'),
    rememberMe: z.boolean().optional(),
    captcha: z.string().optional(),
  }),

  register: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
    phone: baseSchemas.phone.optional(),
    acceptTerms: z.boolean().refine(val => val === true, 'Deve aceitar os termos de uso'),
    captcha: z.string().optional(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  }),

  resetPassword: z.object({
    email: baseSchemas.email,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: baseSchemas.password,
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  }),

  magicLink: z.object({
    email: baseSchemas.email,
  }),

  verifyEmail: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
  }),

  mfaSetup: z.object({
    secret: z.string().min(1, 'Secret é obrigatório'),
    code: z.string().length(6, 'Código deve ter 6 dígitos'),
  }),

  mfaVerify: z.object({
    code: z.string().length(6, 'Código deve ter 6 dígitos'),
    backupCode: z.string().optional(),
  }),
};

// Schemas de contrato IFRS 16
export const contractSchemas = {
  create: z.object({
    contractNumber: z.string().min(1, 'Número do contrato é obrigatório').max(50, 'Número muito longo'),
    description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
    lessor: z.string().min(1, 'Arrendador é obrigatório').max(200, 'Nome muito longo'),
    lessee: z.string().min(1, 'Arrendatário é obrigatório').max(200, 'Nome muito longo'),
    startDate: baseSchemas.date,
    endDate: baseSchemas.date,
    leaseTerm: z.number().min(1, 'Prazo deve ser maior que 0').max(999, 'Prazo muito longo'),
    paymentFrequency: z.enum(['monthly', 'quarterly', 'semi-annually', 'annually']).refine(
      (val) => ['monthly', 'quarterly', 'semi-annually', 'annually'].includes(val),
      { message: 'Frequência de pagamento inválida' }
    ),
    initialPayment: baseSchemas.currency,
    monthlyPayment: baseSchemas.currency,
    interestRate: baseSchemas.percentage,
    residualValue: baseSchemas.currency.optional(),
    purchaseOption: z.boolean().optional(),
    purchasePrice: baseSchemas.currency.optional(),
    escalationClause: z.boolean().optional(),
    escalationRate: baseSchemas.percentage.optional(),
    inflationIndex: z.string().optional(),
    contractType: z.enum(['operating', 'finance']).refine(
      (val) => ['operating', 'finance'].includes(val),
      { message: 'Tipo de contrato inválido' }
    ),
    assetCategory: z.string().min(1, 'Categoria do ativo é obrigatória').max(100, 'Categoria muito longa'),
    usefulLife: z.number().min(1, 'Vida útil deve ser maior que 0').max(999, 'Vida útil muito longa').optional(),
  }).refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['endDate'],
  }).refine(data => {
    if (data.purchaseOption && !data.purchasePrice) {
      return false;
    }
    return true;
  }, {
    message: 'Preço de compra é obrigatório quando há opção de compra',
    path: ['purchasePrice'],
  }),

  update: z.object({
    id: baseSchemas.id,
    contractNumber: z.string().min(1, 'Número do contrato é obrigatório').max(50, 'Número muito longo').optional(),
    description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa').optional(),
    lessor: z.string().min(1, 'Arrendador é obrigatório').max(200, 'Nome muito longo').optional(),
    lessee: z.string().min(1, 'Arrendatário é obrigatório').max(200, 'Nome muito longo').optional(),
    startDate: baseSchemas.date.optional(),
    endDate: baseSchemas.date.optional(),
    leaseTerm: z.number().min(1, 'Prazo deve ser maior que 0').max(999, 'Prazo muito longo').optional(),
    paymentFrequency: z.enum(['monthly', 'quarterly', 'semi-annually', 'annually']).optional(),
    initialPayment: baseSchemas.currency.optional(),
    monthlyPayment: baseSchemas.currency.optional(),
    interestRate: baseSchemas.percentage.optional(),
    residualValue: baseSchemas.currency.optional(),
    purchaseOption: z.boolean().optional(),
    purchasePrice: baseSchemas.currency.optional(),
    escalationClause: z.boolean().optional(),
    escalationRate: baseSchemas.percentage.optional(),
    inflationIndex: z.string().optional(),
    contractType: z.enum(['operating', 'finance']).optional(),
    assetCategory: z.string().min(1, 'Categoria do ativo é obrigatória').max(100, 'Categoria muito longa').optional(),
    usefulLife: z.number().min(1, 'Vida útil deve ser maior que 0').max(999, 'Vida útil muito longa').optional(),
  }),

  delete: z.object({
    id: baseSchemas.id,
    confirm: z.boolean().refine(val => val === true, 'Confirmação é obrigatória para deletar'),
  }),

  calculate: z.object({
    contractId: baseSchemas.id,
    calculationDate: baseSchemas.date.optional(),
    includeModifications: z.boolean().optional(),
  }),

  export: z.object({
    contractId: baseSchemas.id,
    format: z.enum(['pdf', 'excel', 'csv']).refine(
      (val) => ['pdf', 'excel', 'csv'].includes(val),
      { message: 'Formato de exportação inválido' }
    ),
    includeAmortization: z.boolean().optional(),
    includeModifications: z.boolean().optional(),
    language: z.enum(['pt-BR', 'en', 'es']).optional(),
  }),
};

// Schemas de modificação de contrato
export const modificationSchemas = {
  create: z.object({
    contractId: baseSchemas.id,
    modificationDate: baseSchemas.date,
    modificationType: z.enum(['payment_change', 'term_extension', 'rate_change', 'other']).refine(
      (val) => ['payment_change', 'term_extension', 'rate_change', 'other'].includes(val),
      { message: 'Tipo de modificação inválido' }
    ),
    description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
    newMonthlyPayment: baseSchemas.currency.optional(),
    newInterestRate: baseSchemas.percentage.optional(),
    newEndDate: baseSchemas.date.optional(),
    additionalPayments: z.array(z.object({
      date: baseSchemas.date,
      amount: baseSchemas.currency,
      description: z.string().max(200, 'Descrição muito longa'),
    })).optional(),
    documents: z.array(z.object({
      name: z.string().min(1, 'Nome do documento é obrigatório').max(200, 'Nome muito longo'),
      url: baseSchemas.url,
      type: z.string().max(50, 'Tipo muito longo'),
    })).optional(),
  }),

  update: z.object({
    id: baseSchemas.id,
    modificationDate: baseSchemas.date.optional(),
    modificationType: z.enum(['payment_change', 'term_extension', 'rate_change', 'other']).optional(),
    description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa').optional(),
    newMonthlyPayment: baseSchemas.currency.optional(),
    newInterestRate: baseSchemas.percentage.optional(),
    newEndDate: baseSchemas.date.optional(),
    additionalPayments: z.array(z.object({
      date: baseSchemas.date,
      amount: baseSchemas.currency,
      description: z.string().max(200, 'Descrição muito longa'),
    })).optional(),
    documents: z.array(z.object({
      name: z.string().min(1, 'Nome do documento é obrigatório').max(200, 'Nome muito longo'),
      url: baseSchemas.url,
      type: z.string().max(50, 'Tipo muito longo'),
    })).optional(),
  }),
};

// Schemas de API
export const apiSchemas = {
  pagination: z.object({
    page: z.number().int().min(1, 'Página deve ser maior que 0').max(1000, 'Página muito alta'),
    limit: z.number().int().min(1, 'Limite deve ser maior que 0').max(100, 'Limite muito alto'),
    sortBy: z.string().max(50, 'Campo de ordenação muito longo').optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  search: z.object({
    query: z.string().min(1, 'Query é obrigatória').max(200, 'Query muito longa'),
    filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  }),

  health: z.object({
    timestamp: z.string().datetime(),
    service: z.string().min(1, 'Nome do serviço é obrigatório'),
    version: z.string().min(1, 'Versão é obrigatória'),
    status: z.enum(['healthy', 'degraded', 'unhealthy']).refine(
      (val) => ['healthy', 'degraded', 'unhealthy'].includes(val),
      { message: 'Status inválido' }
    ),
    dependencies: z.array(z.object({
      name: z.string(),
      status: z.enum(['up', 'down', 'degraded']),
      responseTime: z.number().optional(),
      lastCheck: z.string().datetime(),
    })).optional(),
  }),
};

// Schemas de webhook
export const webhookSchemas = {
  stripe: z.object({
    id: z.string(),
    object: z.string(),
    type: z.string(),
    data: z.object({
      object: z.record(z.string(), z.any()),
    }),
    created: z.number(),
    livemode: z.boolean(),
    pending_webhooks: z.number(),
    request: z.object({
      id: z.string().nullable(),
      idempotency_key: z.string().nullable(),
    }).nullable(),
  }),

  supabase: z.object({
    type: z.string(),
    table: z.string(),
    schema: z.string(),
    record: z.record(z.string(), z.any()),
    old_record: z.record(z.string(), z.any()).optional(),
    commit_timestamp: z.string().datetime(),
  }),
};

// Schemas de configuração
export const configSchemas = {
  user: z.object({
    id: baseSchemas.id,
    email: baseSchemas.email,
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
    phone: baseSchemas.phone.optional(),
    locale: z.enum(['pt-BR', 'en', 'es']).optional(),
    timezone: z.string().max(50, 'Timezone muito longo').optional(),
    currency: z.string().length(3, 'Código da moeda deve ter 3 caracteres').optional(),
    dateFormat: z.string().max(20, 'Formato de data muito longo').optional(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }).optional(),
  }),

  company: z.object({
    id: baseSchemas.id,
    name: z.string().min(1, 'Nome da empresa é obrigatório').max(200, 'Nome muito longo'),
    cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve ter formato válido'),
    address: z.object({
      street: z.string().max(200, 'Rua muito longa'),
      number: z.string().max(20, 'Número muito longo'),
      complement: z.string().max(100, 'Complemento muito longo').optional(),
      neighborhood: z.string().max(100, 'Bairro muito longo'),
      city: z.string().max(100, 'Cidade muito longa'),
      state: z.string().length(2, 'Estado deve ter 2 caracteres'),
      zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve ter formato válido'),
      country: z.string().length(2, 'País deve ter 2 caracteres'),
    }),
    contact: z.object({
      phone: baseSchemas.phone,
      email: baseSchemas.email,
      website: baseSchemas.url.optional(),
    }),
  }),
};

// Função para validação com mensagens customizadas
export function validateWithCustomMessages<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  customMessages?: Record<string, string>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => {
        const path = err.path.join('.');
        const customMessage = customMessages?.[path];
        return customMessage || err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

// Função para validação assíncrona
export async function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

// Middleware de validação para API routes
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const validation = await validateAsync(schema, body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: validation.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      return handler(validation.data, request);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

// Exportar todos os schemas
export const schemas = {
  base: baseSchemas,
  auth: authSchemas,
  contract: contractSchemas,
  modification: modificationSchemas,
  api: apiSchemas,
  webhook: webhookSchemas,
  config: configSchemas,
};
