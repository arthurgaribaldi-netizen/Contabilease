import { z } from 'zod';

// Schema de validação para contratos
const contractSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']),
  currency_code: z
    .string()
    .length(3, 'Código da moeda deve ter exatamente 3 caracteres')
    .optional()
    .or(z.literal('')),
});

describe('Contract Schema', () => {
  it('should validate correct contract data', () => {
    const validData = {
      title: 'Test Contract',
      status: 'draft' as const,
      currency_code: 'BRL',
    };

    const result = contractSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidData = {
      title: '',
      status: 'draft' as const,
    };

    const result = contractSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Título é obrigatório');
    }
  });

  it('should reject title longer than 200 characters', () => {
    const invalidData = {
      title: 'a'.repeat(201),
      status: 'draft' as const,
    };

    const result = contractSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Título deve ter no máximo 200 caracteres');
    }
  });

  it('should reject invalid status', () => {
    const invalidData = {
      title: 'Test Contract',
      status: 'invalid' as any,
    };

    const result = contractSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject currency_code with wrong length', () => {
    const invalidData = {
      title: 'Test Contract',
      status: 'draft' as const,
      currency_code: 'BR',
    };

    const result = contractSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Código da moeda deve ter exatamente 3 caracteres'
      );
    }
  });

  it('should accept empty currency_code', () => {
    const validData = {
      title: 'Test Contract',
      status: 'draft' as const,
      currency_code: '',
    };

    const result = contractSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept undefined currency_code', () => {
    const validData = {
      title: 'Test Contract',
      status: 'draft' as const,
    };

    const result = contractSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
