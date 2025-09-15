/**
 * Sistema de Validação Robusto para Contabilease
 * Implementa validação com Zod, sanitização e transformação de dados
 */

import { logger } from '@/lib/logger';
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationConfig {
  strict: boolean; // Se deve falhar em campos extras
  sanitize: boolean; // Se deve sanitizar dados
  transform: boolean; // Se deve transformar dados
}

/**
 * Classe principal de validação
 */
class SchemaValidator {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      strict: true,
      sanitize: true,
      transform: true,
      ...config,
    };
  }

  /**
   * Valida dados contra schema Zod
   */
  validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<T> {
    try {
      // Sanitização básica se habilitada
      const sanitizedData = this.config.sanitize ? this.sanitizeData(data) : data;

      // Validação com Zod
      const result = schema.safeParse(sanitizedData);

      if (result.success) {
        logger.debug(`Validation successful${context ? ` for ${context}` : ''}`);
        return {
          success: true,
          data: result.data,
        };
      } else {
        const errors = this.formatZodErrors(result.error.issues);
        logger.warn(`Validation failed${context ? ` for ${context}` : ''}`, { errors });
        
        return {
          success: false,
          errors,
        };
      }
    } catch (error) {
      logger.error(`Validation error${context ? ` for ${context}` : ''}`, { error });
      
      return {
        success: false,
        errors: [{
          field: 'unknown',
          message: 'Validation system error',
          code: 'VALIDATION_ERROR',
          value: error instanceof Error ? error.message : 'Unknown error',
        }],
      };
    }
  }

  /**
   * Valida dados de forma assíncrona
   */
  async validateAsync<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): Promise<ValidationResult<T>> {
    // Para schemas síncronos, usa validação normal
    if (!(schema as any)._def.async) {
      return this.validate(schema, data, context);
    }

    try {
      const sanitizedData = this.config.sanitize ? this.sanitizeData(data) : data;
      const result = await schema.safeParseAsync(sanitizedData);

      if (result.success) {
        logger.debug(`Async validation successful${context ? ` for ${context}` : ''}`);
        return {
          success: true,
          data: result.data,
        };
      } else {
        const errors = this.formatZodErrors(result.error.issues);
        logger.warn(`Async validation failed${context ? ` for ${context}` : ''}`, { errors });
        
        return {
          success: false,
          errors,
        };
      }
    } catch (error) {
      logger.error(`Async validation error${context ? ` for ${context}` : ''}`, { error });
      
      return {
        success: false,
        errors: [{
          field: 'unknown',
          message: 'Async validation system error',
          code: 'ASYNC_VALIDATION_ERROR',
          value: error instanceof Error ? error.message : 'Unknown error',
        }],
      };
    }
  }

  /**
   * Sanitiza dados de entrada
   */
  private sanitizeData(data: unknown): unknown {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Remove campos potencialmente perigosos
        if (this.isDangerousField(key)) {
          continue;
        }
        
        sanitized[key] = this.sanitizeData(value);
      }
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Sanitiza string removendo caracteres perigosos
   */
  private sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Verifica se campo é perigoso
   */
  private isDangerousField(field: string): boolean {
    const dangerousFields = [
      '__proto__',
      'constructor',
      'prototype',
      'eval',
      'function',
      'script',
    ];
    
    return dangerousFields.some(dangerous => 
      field.toLowerCase().includes(dangerous)
    );
  }

  /**
   * Formata erros do Zod para formato padronizado
   */
  private formatZodErrors(zodErrors: z.ZodIssue[]): ValidationError[] {
    return zodErrors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code,
      value: error.input,
    }));
  }
}

// Instância singleton
const validator = new SchemaValidator();

/**
 * Schemas de validação comuns
 */
export const commonSchemas = {
  // Validação de email
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .max(255, 'Email muito longo'),

  // Validação de senha
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),

  // Validação de CPF
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
    .refine(validateCPF, 'CPF inválido'),

  // Validação de CNPJ
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato 00.000.000/0000-00')
    .refine(validateCNPJ, 'CNPJ inválido'),

  // Validação de telefone
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 0000-0000'),

  // Validação de CEP
  cep: z.string()
    .regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),

  // Validação de moeda
  currency: z.number()
    .min(0, 'Valor deve ser positivo')
    .max(999999999.99, 'Valor muito alto'),

  // Validação de data
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine(date => !isNaN(Date.parse(date)), 'Data inválida'),

  // Validação de URL
  url: z.string()
    .url('URL inválida')
    .max(2048, 'URL muito longa'),
};

/**
 * Valida CPF
 */
function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11 || /^(\d)\1{10}$/.test(numbers)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  return digit1 === parseInt(numbers[9]) && digit2 === parseInt(numbers[10]);
}

/**
 * Valida CNPJ
 */
function validateCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14 || /^(\d)\1{13}$/.test(numbers)) {
    return false;
  }
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return digit1 === parseInt(numbers[12]) && digit2 === parseInt(numbers[13]);
}

/**
 * Funções de validação exportadas
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> {
  return validator.validate(schema, data, context);
}

export async function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): Promise<ValidationResult<T>> {
  return validator.validateAsync(schema, data, context);
}

/**
 * Middleware para validação em API routes
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  context?: string
) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (request: Request) {
      try {
        const body = await request.json();
        const result = await validator.validateAsync(schema, body, context);
        
        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              details: result.errors,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Adiciona dados validados ao request
        (request as any).validatedData = result.data;
        
        return originalMethod.call(this, request);
      } catch (error) {
        logger.error('Validation middleware error', { error });
        
        return new Response(
          JSON.stringify({
            error: 'Invalid request format',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    };

    return descriptor;
  };
}

/**
 * Hook para validação em componentes React
 */
export function useValidation<T>(schema: z.ZodSchema<T>) {
  const validateField = (field: string, value: unknown): ValidationError[] => {
    const fieldSchema = (schema as any).shape?.[field];
    if (!fieldSchema) return [];
    
    const result = validator.validate(fieldSchema, value, field);
    return result.errors || [];
  };

  const validateForm = (data: unknown): ValidationResult<T> => {
    return validator.validate(schema, data, 'form');
  };

  return {
    validateField,
    validateForm,
  };
}
