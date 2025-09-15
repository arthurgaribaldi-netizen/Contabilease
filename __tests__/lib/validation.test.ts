/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Testes Unitários Críticos - Validação
 */

import { schemas, validateAsync, validateWithCustomMessages } from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('Auth Schemas', () => {
    test('should validate login schema correctly', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const result = schemas.auth.login.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    test('should reject invalid email', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = schemas.auth.login.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email deve ter formato válido');
      }
    });

    test('should validate register schema with password confirmation', () => {
      const validRegister = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'John Doe',
        acceptTerms: true,
      };

      const result = schemas.auth.register.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    test('should reject register with mismatched passwords', () => {
      const invalidRegister = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        fullName: 'John Doe',
        acceptTerms: true,
      };

      const result = schemas.auth.register.safeParse(invalidRegister);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Senhas não coincidem');
      }
    });

    test('should validate password strength', () => {
      const weakPassword = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        fullName: 'John Doe',
        acceptTerms: true,
      };

      const result = schemas.auth.register.safeParse(weakPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Senha deve ter pelo menos 8 caracteres');
      }
    });
  });

  describe('Contract Schemas', () => {
    test('should validate contract creation', () => {
      const validContract = {
        contractNumber: 'CT-001',
        description: 'Office lease contract',
        lessor: 'ABC Company',
        lessee: 'XYZ Corp',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2025-01-01T00:00:00Z',
        leaseTerm: 12,
        paymentFrequency: 'monthly',
        initialPayment: 1000,
        monthlyPayment: 5000,
        interestRate: 5.5,
        contractType: 'operating',
        assetCategory: 'Office Equipment',
      };

      const result = schemas.contract.create.safeParse(validContract);
      expect(result.success).toBe(true);
    });

    test('should reject contract with invalid dates', () => {
      const invalidContract = {
        contractNumber: 'CT-001',
        description: 'Office lease contract',
        lessor: 'ABC Company',
        lessee: 'XYZ Corp',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2024-01-01T00:00:00Z', // End date before start date
        leaseTerm: 12,
        paymentFrequency: 'monthly',
        initialPayment: 1000,
        monthlyPayment: 5000,
        interestRate: 5.5,
        contractType: 'operating',
        assetCategory: 'Office Equipment',
      };

      const result = schemas.contract.create.safeParse(invalidContract);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Data de fim deve ser posterior à data de início');
      }
    });

    test('should reject contract with missing purchase price when purchase option is true', () => {
      const invalidContract = {
        contractNumber: 'CT-001',
        description: 'Office lease contract',
        lessor: 'ABC Company',
        lessee: 'XYZ Corp',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2025-01-01T00:00:00Z',
        leaseTerm: 12,
        paymentFrequency: 'monthly',
        initialPayment: 1000,
        monthlyPayment: 5000,
        interestRate: 5.5,
        contractType: 'operating',
        assetCategory: 'Office Equipment',
        purchaseOption: true,
        // purchasePrice is missing
      };

      const result = schemas.contract.create.safeParse(invalidContract);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Preço de compra é obrigatório quando há opção de compra');
      }
    });
  });

  describe('API Schemas', () => {
    test('should validate pagination parameters', () => {
      const validPagination = {
        page: 1,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      const result = schemas.api.pagination.safeParse(validPagination);
      expect(result.success).toBe(true);
    });

    test('should reject invalid pagination parameters', () => {
      const invalidPagination = {
        page: 0, // Invalid: should be >= 1
        limit: 200, // Invalid: should be <= 100
        sortBy: 'invalid_field',
        sortOrder: 'invalid_order',
      };

      const result = schemas.api.pagination.safeParse(invalidPagination);
      expect(result.success).toBe(false);
    });

    test('should validate search parameters', () => {
      const validSearch = {
        query: 'office lease',
        filters: {
          contractType: 'operating',
          active: true,
        },
      };

      const result = schemas.api.search.safeParse(validSearch);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Functions', () => {
    test('should validate with custom messages', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
      };

      const customMessages = {
        email: 'Email personalizado inválido',
      };

      const result = validateWithCustomMessages(
        schemas.auth.login,
        invalidData,
        customMessages
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('Email personalizado inválido');
        // A validação de senha não está sendo aplicada no schema de login
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    test('should validate async', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await validateAsync(schemas.auth.login, validData);
      expect(result.success).toBe(true);
    });

    test('should handle async validation errors', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
      };

      const result = await validateAsync(schemas.auth.login, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Base Schemas', () => {
    test('should validate currency values', () => {
      const validCurrency = 1000.50;
      const result = schemas.base.currency.safeParse(validCurrency);
      expect(result.success).toBe(true);
    });

    test('should reject negative currency values', () => {
      const invalidCurrency = -100;
      const result = schemas.base.currency.safeParse(invalidCurrency);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Valor deve ser positivo');
      }
    });

    test('should validate percentage values', () => {
      const validPercentage = 50.5;
      const result = schemas.base.percentage.safeParse(validPercentage);
      expect(result.success).toBe(true);
    });

    test('should reject percentage values over 100', () => {
      const invalidPercentage = 150;
      const result = schemas.base.percentage.safeParse(invalidPercentage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Percentual não pode ser maior que 100%');
      }
    });

    test('should validate UUID format', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const result = schemas.base.id.safeParse(validUUID);
      expect(result.success).toBe(true);
    });

    test('should reject invalid UUID format', () => {
      const invalidUUID = 'not-a-uuid';
      const result = schemas.base.id.safeParse(invalidUUID);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ID deve ser um UUID válido');
      }
    });
  });
});
