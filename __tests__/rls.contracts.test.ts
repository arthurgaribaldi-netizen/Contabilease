import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Prepare mocks for supabase module BEFORE importing the code under test
const eq = jest.fn();
const order = jest.fn();
const from = jest.fn().mockReturnValue({ select: () => ({ eq, order }) });
const authGetSession = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: authGetSession },
    from,
  },
}));

import { fetchContractsForCurrentUser } from '@/lib/contracts';

describe('RLS contracts - isolation by user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGetSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'userA' } } },
    });
    (eq as jest.Mock).mockReturnValue({ order });
    (order as jest.Mock).mockResolvedValue({ data: [{ id: 'c1', user_id: 'userA' }], error: null });
  });

  it('returns only current user contracts', async () => {
    const contracts = await fetchContractsForCurrentUser();
    expect(contracts.every(c => c.user_id === 'userA')).toBe(true);
    expect(from).toHaveBeenCalledWith('contracts');
  });
});
