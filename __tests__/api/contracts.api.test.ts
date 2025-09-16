/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { GET, POST } from '@/app/api/contracts/route';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('@/lib/subscription-limits', () => ({
  canUserPerformAction: jest.fn().mockResolvedValue(true),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('/api/contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/contracts', () => {
    it('should return contracts for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockContracts = [
        {
          id: 'contract-1',
          title: 'Test Contract',
          status: 'active',
          user_id: 'user-123',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 'contract-2',
          title: 'Another Contract',
          status: 'draft',
          user_id: 'user-123',
          created_at: '2023-01-02T00:00:00Z',
        },
      ];

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockContracts,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const request = new NextRequest('http://localhost:3000/api/contracts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.contracts).toEqual(mockContracts);
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return 401 for unauthenticated user', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/contracts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database error', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const request = new NextRequest('http://localhost:3000/api/contracts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch contracts');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/contracts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/contracts', () => {
    it('should create contract for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const contractData = {
        title: 'New Contract',
        status: 'draft',
        currency_code: 'BRL',
        contract_value: 100000,
        contract_term_months: 12,
        implicit_interest_rate: 0.05,
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const mockQuery = {
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'contract-123', ...contractData }],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(contractData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.contract).toBeDefined();
      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...contractData,
        user_id: 'user-123',
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const contractData = {
        title: 'New Contract',
        status: 'draft',
      };

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(contractData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate contract data', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const invalidData = {
        title: '', // Invalid: empty title
        status: 'invalid_status', // Invalid: not in enum
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid contract data');
      expect(data.details).toBeDefined();
    });

    it('should handle database error on creation', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const contractData = {
        title: 'New Contract',
        status: 'draft',
        currency_code: 'BRL',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const mockQuery = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(contractData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create contract');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle subscription limits', async () => {
      const { canUserPerformAction } = require('@/lib/subscription-limits');
      canUserPerformAction.mockResolvedValue(false);

      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const contractData = {
        title: 'New Contract',
        status: 'draft',
        currency_code: 'BRL',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(contractData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Subscription limit exceeded');
    });

    it('should handle malformed JSON', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: 'invalid json',
      });

      // Mock request.json() to throw error
      jest.spyOn(request, 'json').mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });
  });
});
