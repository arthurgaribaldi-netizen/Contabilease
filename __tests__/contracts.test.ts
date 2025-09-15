import { fetchContractsForCurrentUser, createContract, fetchContractById } from '@/lib/contracts';
import { supabase } from '@/lib/supabase';

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  },
}));

describe('Contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchContractsForCurrentUser', () => {
    it('should return empty array when no user session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const result = await fetchContractsForCurrentUser();
      expect(result).toEqual([]);
    });

    it('should fetch contracts for authenticated user', async () => {
      const mockContracts = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Test Contract',
          status: 'draft',
          currency_code: 'BRL',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockContracts,
              error: null,
            })),
          })),
        })),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await fetchContractsForCurrentUser();
      expect(result).toEqual(mockContracts);
      expect(supabase.from).toHaveBeenCalledWith('contracts');
    });

    it('should throw error when database query fails', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: new Error('Database error'),
            })),
          })),
        })),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(fetchContractsForCurrentUser()).rejects.toThrow('Database error');
    });
  });

  describe('createContract', () => {
    it('should create contract successfully', async () => {
      const contractData = {
        title: 'Test Contract',
        status: 'draft',
        currency_code: 'BRL',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const mockInsert = {
        data: null,
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn(() => mockInsert),
      });

      await expect(createContract(contractData)).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('contracts');
    });

    it('should throw error when user not authenticated', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const contractData = {
        title: 'Test Contract',
        status: 'draft',
      };

      await expect(createContract(contractData)).rejects.toThrow('User not authenticated');
    });

    it('should throw error when database insert fails', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const mockInsert = {
        data: null,
        error: new Error('Insert failed'),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn(() => mockInsert),
      });

      const contractData = {
        title: 'Test Contract',
        status: 'draft',
      };

      await expect(createContract(contractData)).rejects.toThrow('Insert failed');
    });
  });

  describe('fetchContractById', () => {
    it('should fetch contract by id successfully', async () => {
      const mockContract = {
        id: 'contract-1',
        user_id: 'user-1',
        title: 'Test Contract',
        status: 'draft',
        currency_code: 'BRL',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockContract,
                error: null,
              })),
            })),
          })),
        })),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await fetchContractById('contract-1');
      expect(result).toEqual(mockContract);
      expect(supabase.from).toHaveBeenCalledWith('contracts');
    });

    it('should throw error when user not authenticated', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      await expect(fetchContractById('contract-1')).rejects.toThrow('Unauthorized');
    });

    it('should throw error when contract not found', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: { code: 'PGRST116' },
              })),
            })),
          })),
        })),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(fetchContractById('contract-1')).rejects.toThrow('Contract not found');
    });
  });
});
