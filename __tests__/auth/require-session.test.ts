/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { getSessionOrRedirect } from '@/lib/auth/requireSession';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Supabase auth helpers
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: jest.fn(),
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockCreateServerComponentClient = createServerComponentClient as jest.MockedFunction<
  typeof createServerComponentClient
>;

describe('getSessionOrRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return session when user is authenticated', async () => {
    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_at: Date.now() + 3600000,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
      },
    };

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    const result = await getSessionOrRedirect('pt-BR');

    expect(result).toEqual(mockSession);
    expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
  });

  it('should redirect when user is not authenticated', async () => {
    const { redirect } = require('next/navigation');

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    await getSessionOrRedirect('pt-BR');

    expect(redirect).toHaveBeenCalledWith('/pt-BR/auth/login');
  });

  it('should redirect with correct locale', async () => {
    const { redirect } = require('next/navigation');

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    await getSessionOrRedirect('en');

    expect(redirect).toHaveBeenCalledWith('/en/auth/login');
  });

  it('should redirect with Spanish locale', async () => {
    const { redirect } = require('next/navigation');

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    await getSessionOrRedirect('es');

    expect(redirect).toHaveBeenCalledWith('/es/auth/login');
  });

  it('should handle session error gracefully', async () => {
    const { redirect } = require('next/navigation');

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: { message: 'Session error' },
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    await getSessionOrRedirect('pt-BR');

    expect(redirect).toHaveBeenCalledWith('/pt-BR/auth/login');
  });

  it('should create client with cookies', async () => {
    const { cookies } = require('next/headers');
    const mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    cookies.mockReturnValue(mockCookies);

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    await getSessionOrRedirect('pt-BR');

    expect(mockCreateServerComponentClient).toHaveBeenCalledWith({
      cookies: expect.any(Function),
    });
  });

  it('should handle expired session', async () => {
    const { redirect } = require('next/navigation');

    const expiredSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_at: Date.now() - 3600000, // Expired 1 hour ago
      user: {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
      },
    };

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: expiredSession },
          error: null,
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    await getSessionOrRedirect('pt-BR');

    expect(redirect).toHaveBeenCalledWith('/pt-BR/auth/login');
  });

  it('should handle invalid session data', async () => {
    const { redirect } = require('next/navigation');

    const invalidSession = {
      access_token: null,
      refresh_token: null,
      expires_at: null,
      user: null,
    };

    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: invalidSession },
          error: null,
        }),
      },
    };

    mockCreateServerComponentClient.mockReturnValue(mockSupabaseClient as any);

    await getSessionOrRedirect('pt-BR');

    expect(redirect).toHaveBeenCalledWith('/pt-BR/auth/login');
  });
});
