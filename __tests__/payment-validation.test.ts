import { supabase } from '../src/lib/supabase';
import {
  canCreateContract,
  requirePaidSubscription,
  validateUserPayment,
} from '../src/middleware/payment-validation';

// Mock do Supabase
jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

// Mock do logger
jest.mock('../src/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock do Stripe plans
jest.mock('../src/lib/stripe', () => ({
  SUBSCRIPTION_PLANS: {
    FREE: { maxContracts: 1 },
    BASIC: { maxContracts: 5 },
    PREMIUM: { maxContracts: 50 },
  },
}));

describe('Payment Validation', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserPayment', () => {
    it('should allow access for free plan users', async () => {
      // Mock para usuário sem assinatura (plano gratuito)
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No subscription
          error: { code: 'PGRST116' },
        }),
      };

      const mockContractsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [], // No contracts yet
          error: null,
        }),
      };

      // Mock multiple calls - validateUserPayment calls getUserSubscription and canCreateContract
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockQuery) // First call for subscription in getUserSubscription
        .mockReturnValueOnce(mockQuery) // Second call for subscription in canCreateContract
        .mockReturnValueOnce(mockContractsQuery); // Third call for contracts in canCreateContract

      const result = await validateUserPayment(mockUserId);

      expect(result.isValid).toBe(false); // Free plan users don't have active subscription
      expect(result.canCreateContract).toBe(true);
      expect(result.requiresUpgrade).toBe(false);
    });

    it('should deny access for expired subscription', async () => {
      // Mock para assinatura expirada
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No active subscription
          error: { code: 'PGRST116' },
        }),
      };

      const mockContractsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ id: 'contract-1' }, { id: 'contract-2' }], // 2 contracts (over free limit)
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockQuery) // First call for subscription
        .mockReturnValueOnce(mockContractsQuery); // Second call for contracts

      const result = await validateUserPayment(mockUserId);

      expect(result.isValid).toBe(false);
      expect(result.canCreateContract).toBe(false);
      expect(result.requiresUpgrade).toBe(true);
    });

    it('should deny access when contract limit is reached', async () => {
      // Mock para usuário sem assinatura com limite atingido
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No subscription
          error: { code: 'PGRST116' },
        }),
      };

      const mockContractsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ id: 'contract-1' }], // 1 contract (at free limit)
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockQuery) // First call for subscription
        .mockReturnValueOnce(mockContractsQuery); // Second call for contracts

      const result = await validateUserPayment(mockUserId);

      expect(result.isValid).toBe(false);
      expect(result.canCreateContract).toBe(false);
      expect(result.requiresUpgrade).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      // Mock para erro de banco de dados
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await validateUserPayment(mockUserId);

      expect(result.isValid).toBe(false);
      expect(result.canCreateContract).toBe(false);
      expect(result.requiresUpgrade).toBe(true);
    });
  });

  describe('canCreateContract', () => {
    it('should allow contract creation when under limit', async () => {
      // Mock para usuário sem assinatura (plano gratuito) com menos contratos que o limite
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No subscription
          error: { code: 'PGRST116' },
        }),
      };

      const mockContractsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [], // No contracts yet (under free limit of 1)
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockQuery) // First call for subscription
        .mockReturnValueOnce(mockContractsQuery); // Second call for contracts

      const result = await canCreateContract(mockUserId);

      expect(result).toBe(true);
    });

    it('should deny contract creation when at limit', async () => {
      // Mock para usuário sem assinatura com limite atingido
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No subscription
          error: { code: 'PGRST116' },
        }),
      };

      const mockContractsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ id: 'contract-1' }], // 1 contract (at free limit)
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockQuery) // First call for subscription
        .mockReturnValueOnce(mockContractsQuery); // Second call for contracts

      const result = await canCreateContract(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('requirePaidSubscription', () => {
    it('should return true for valid paid subscription', async () => {
      // Mock para assinatura paga ativa
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: {
                  plan: 'BASIC',
                  status: 'active',
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
                error: null,
              }),
            })),
          })),
        })),
      });

      const result = await requirePaidSubscription(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false for inactive subscription', async () => {
      // Mock para assinatura inativa
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            })),
          })),
        })),
      });

      const result = await requirePaidSubscription(mockUserId);

      expect(result).toBe(false);
    });
  });
});

describe('Subscription Limits Integration', () => {
  const mockUserId = 'test-user-id';

  it('should enforce contract limits correctly', async () => {
    // Teste de integração com limites de contratos
    const testCases = [
      { plan: 'FREE', maxContracts: 1, currentContracts: 0, expected: true },
      { plan: 'FREE', maxContracts: 1, currentContracts: 1, expected: false },
      { plan: 'BASIC', maxContracts: 5, currentContracts: 4, expected: true },
      { plan: 'BASIC', maxContracts: 5, currentContracts: 5, expected: false },
    ];

    for (const testCase of testCases) {
      // Mock subscription data
      const mockSubscriptionQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data:
            testCase.plan !== 'FREE'
              ? {
                  plan: testCase.plan,
                  status: 'active',
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                }
              : null,
          error: testCase.plan === 'FREE' ? { code: 'PGRST116' } : null,
        }),
      };

      // Mock contracts count
      const mockContractsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: Array(testCase.currentContracts).fill({ id: 'contract-id' }),
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockSubscriptionQuery) // First call for subscription
        .mockReturnValueOnce(mockContractsQuery); // Second call for contracts

      const result = await canCreateContract(mockUserId);
      expect(result).toBe(testCase.expected);
    }
  });
});
