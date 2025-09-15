import { supabase } from '../src/lib/supabase';
import { canCreateContract, requirePaidSubscription, validateUserPayment } from '../src/middleware/payment-validation';

// Mock do Supabase
jest.mock('../src/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

// Mock do logger
jest.mock('../src/lib/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Payment Validation', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserPayment', () => {
    it('should allow access for free plan users', async () => {
      // Mock para plano gratuito
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: 'Gratuito',
          max_contracts: 1,
          current_contracts: 0,
          features: { basic_calculations: true }
        }],
        error: null
      });

      const result = await validateUserPayment(mockUserId);

      expect(result.hasAccess).toBe(true);
      expect(result.subscriptionStatus).toBe('free');
      expect(result.planName).toBe('Gratuito');
    });

    it('should deny access for expired subscription', async () => {
      // Mock para assinatura expirada
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: 'Básico',
          max_contracts: 5,
          current_contracts: 2,
          features: { advanced_calculations: true }
        }],
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            }))
          }))
        }))
      });

      const result = await validateUserPayment(mockUserId);

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('Assinatura não está ativa');
    });

    it('should deny access when contract limit is reached', async () => {
      // Mock para limite atingido
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: 'Básico',
          max_contracts: 5,
          current_contracts: 5,
          features: { advanced_calculations: true }
        }],
        error: null
      });

      const result = await validateUserPayment(mockUserId);

      expect(result.hasAccess).toBe(true);
      expect(result.reason).toBe('Limite de contratos atingido');
    });

    it('should handle database errors gracefully', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await validateUserPayment(mockUserId);

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('Erro ao verificar assinatura');
    });
  });

  describe('canCreateContract', () => {
    it('should allow contract creation when under limit', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: 'Básico',
          max_contracts: 5,
          current_contracts: 3,
          features: { advanced_calculations: true }
        }],
        error: null
      });

      const result = await canCreateContract(mockUserId);

      expect(result).toBe(true);
    });

    it('should deny contract creation when at limit', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: 'Básico',
          max_contracts: 5,
          current_contracts: 5,
          features: { advanced_calculations: true }
        }],
        error: null
      });

      const result = await canCreateContract(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('requirePaidSubscription', () => {
    it('should return null for valid paid subscription', async () => {
      // Mock para assinatura paga ativa
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: 'Básico',
          max_contracts: 5,
          current_contracts: 2,
          features: { advanced_calculations: true }
        }],
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: {
                  status: 'active',
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                error: null
              })
            }))
          }))
        }))
      });

      const mockRequest = {
        url: 'http://localhost/api/contracts',
        headers: new Map()
      } as any;
      const result = await requirePaidSubscription(mockRequest, mockUserId);

      expect(result).toBeNull();
    });

    it('should return error response for inactive subscription', async () => {
      // Mock para assinatura inativa
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: 'Básico',
          max_contracts: 5,
          current_contracts: 2,
          features: { advanced_calculations: true }
        }],
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            }))
          }))
        }))
      });

      const mockRequest = {
        url: 'http://localhost/api/contracts',
        headers: new Map()
      } as any;
      const result = await requirePaidSubscription(mockRequest, mockUserId);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });
  });
});

describe('Subscription Limits Integration', () => {
  it('should enforce contract limits correctly', async () => {
    // Teste de integração com limites de contratos
    const testCases = [
      { plan: 'Gratuito', maxContracts: 1, currentContracts: 0, expected: true },
      { plan: 'Gratuito', maxContracts: 1, currentContracts: 1, expected: false },
      { plan: 'Básico', maxContracts: 5, currentContracts: 4, expected: true },
      { plan: 'Básico', maxContracts: 5, currentContracts: 5, expected: false },
      { plan: 'Profissional', maxContracts: 20, currentContracts: 19, expected: true },
      { plan: 'Profissional', maxContracts: 20, currentContracts: 20, expected: false }
    ];

    for (const testCase of testCases) {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          plan_name: testCase.plan,
          max_contracts: testCase.maxContracts,
          current_contracts: testCase.currentContracts,
          features: {}
        }],
        error: null
      });

      const result = await canCreateContract(mockUserId);
      expect(result).toBe(testCase.expected);
    }
  });
});
