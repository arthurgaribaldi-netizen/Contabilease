/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { POST } from '@/app/api/contracts/[id]/calculate/route';
import { ifrs16Cache } from '@/lib/cache/ifrs16-cache';
import { BasicIFRS16Calculator } from '@/lib/calculations/ifrs16-basic';
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

jest.mock('@/lib/calculations/ifrs16-basic', () => ({
  BasicIFRS16Calculator: jest.fn(),
}));

jest.mock('@/lib/cache/ifrs16-cache', () => ({
  ifrs16Cache: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockCalculator = BasicIFRS16Calculator as jest.MockedClass<typeof BasicIFRS16Calculator>;
const mockCache = ifrs16Cache as jest.Mocked<typeof ifrs16Cache>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('/api/contracts/[id]/calculate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate IFRS 16 values successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const contractId = 'contract-123';
    const mockContract = {
      id: contractId,
      title: 'Test Contract',
      contract_value: 100000,
      contract_term_months: 12,
      implicit_interest_rate: 0.05,
      user_id: 'user-123',
    };

    const mockCalculationResult = {
      leaseLiability: 100000,
      rightOfUseAsset: 100000,
      monthlyPayment: 8333.33,
      totalInterest: 0,
      amortizationSchedule: [],
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    const mockCalculatorInstance = {
      calculate: jest.fn().mockReturnValue(mockCalculationResult),
    };

    mockCalculator.mockImplementation(() => mockCalculatorInstance as any);

    const request = new NextRequest(`http://localhost:3000/api/contracts/${contractId}/calculate`, {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: contractId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.calculation).toEqual(mockCalculationResult);
    expect(mockCalculatorInstance.calculate).toHaveBeenCalledWith(mockContract);
  });

  it('should return 401 for unauthenticated user', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/contracts/contract-123/calculate', {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: 'contract-123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 for non-existent contract', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const contractId = 'non-existent';

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    const request = new NextRequest(`http://localhost:3000/api/contracts/${contractId}/calculate`, {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: contractId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Contract not found');
  });

  it('should return 400 for contract missing financial data', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const contractId = 'contract-123';
    const mockContract = {
      id: contractId,
      title: 'Test Contract',
      contract_value: null, // Missing required field
      contract_term_months: null,
      implicit_interest_rate: null,
      user_id: 'user-123',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    const request = new NextRequest(`http://localhost:3000/api/contracts/${contractId}/calculate`, {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: contractId } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Contract missing required financial data for IFRS 16 calculations');
  });

  it('should handle database error', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const contractId = 'contract-123';

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    const request = new NextRequest(`http://localhost:3000/api/contracts/${contractId}/calculate`, {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: contractId } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch contract');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle calculation error', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const contractId = 'contract-123';
    const mockContract = {
      id: contractId,
      title: 'Test Contract',
      contract_value: 100000,
      contract_term_months: 12,
      implicit_interest_rate: 0.05,
      user_id: 'user-123',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    const mockCalculatorInstance = {
      calculate: jest.fn().mockImplementation(() => {
        throw new Error('Calculation error');
      }),
    };

    mockCalculator.mockImplementation(() => mockCalculatorInstance as any);

    const request = new NextRequest(`http://localhost:3000/api/contracts/${contractId}/calculate`, {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: contractId } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to calculate IFRS 16 values');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should use cache when available', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const contractId = 'contract-123';
    const mockContract = {
      id: contractId,
      title: 'Test Contract',
      contract_value: 100000,
      contract_term_months: 12,
      implicit_interest_rate: 0.05,
      user_id: 'user-123',
    };

    const cachedResult = {
      leaseLiability: 100000,
      rightOfUseAsset: 100000,
      monthlyPayment: 8333.33,
      totalInterest: 0,
      amortizationSchedule: [],
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    mockCache.get.mockReturnValue(cachedResult);

    const request = new NextRequest(`http://localhost:3000/api/contracts/${contractId}/calculate`, {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: contractId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.calculation).toEqual(cachedResult);
    expect(mockCache.get).toHaveBeenCalledWith(contractId);
  });

  it('should cache calculation result', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const contractId = 'contract-123';
    const mockContract = {
      id: contractId,
      title: 'Test Contract',
      contract_value: 100000,
      contract_term_months: 12,
      implicit_interest_rate: 0.05,
      user_id: 'user-123',
    };

    const mockCalculationResult = {
      leaseLiability: 100000,
      rightOfUseAsset: 100000,
      monthlyPayment: 8333.33,
      totalInterest: 0,
      amortizationSchedule: [],
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockContract,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    const mockCalculatorInstance = {
      calculate: jest.fn().mockReturnValue(mockCalculationResult),
    };

    mockCalculator.mockImplementation(() => mockCalculatorInstance as any);

    mockCache.get.mockReturnValue(null); // No cache

    const request = new NextRequest(`http://localhost:3000/api/contracts/${contractId}/calculate`, {
      method: 'POST',
    });

    const response = await POST(request, { params: { id: contractId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.calculation).toEqual(mockCalculationResult);
    expect(mockCache.set).toHaveBeenCalledWith(contractId, mockCalculationResult);
  });
});
