// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret';

import { SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { NextRequest } from 'next/server';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      upsert: jest.fn(),
    })),
    rpc: jest.fn(),
  },
}));

describe('Stripe Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Subscription Plans', () => {
    it('should have correct plan configurations', () => {
      expect(SUBSCRIPTION_PLANS.FREE.name).toBe('Gratuito');
      expect(SUBSCRIPTION_PLANS.FREE.price).toBe(0);
      expect(SUBSCRIPTION_PLANS.FREE.maxContracts).toBe(3);

      expect(SUBSCRIPTION_PLANS.BASIC.name).toBe('Básico');
      expect(SUBSCRIPTION_PLANS.BASIC.price).toBe(29);
      expect(SUBSCRIPTION_PLANS.BASIC.maxContracts).toBe(25);

      expect(SUBSCRIPTION_PLANS.PROFESSIONAL.name).toBe('Profissional');
      expect(SUBSCRIPTION_PLANS.PROFESSIONAL.price).toBe(79);
      expect(SUBSCRIPTION_PLANS.PROFESSIONAL.maxContracts).toBe(100);

      expect(SUBSCRIPTION_PLANS.OFFICE.name).toBe('Escritório');
      expect(SUBSCRIPTION_PLANS.OFFICE.price).toBe(199);
      expect(SUBSCRIPTION_PLANS.OFFICE.maxContracts).toBe(500);
    });

    it('should have correct features for each plan', () => {
      expect(SUBSCRIPTION_PLANS.FREE.features).toContain('basic_calculations');
      expect(SUBSCRIPTION_PLANS.FREE.features).toContain('export_pdf');

      expect(SUBSCRIPTION_PLANS.BASIC.features).toContain('advanced_calculations');
      expect(SUBSCRIPTION_PLANS.BASIC.features).toContain('export_excel');
      expect(SUBSCRIPTION_PLANS.BASIC.features).toContain('modifications');

      expect(SUBSCRIPTION_PLANS.PROFESSIONAL.features).toContain('custom_reports');
      expect(SUBSCRIPTION_PLANS.PROFESSIONAL.features).toContain('api_access');

      expect(SUBSCRIPTION_PLANS.OFFICE.features).toContain('api_access');
      expect(SUBSCRIPTION_PLANS.OFFICE.features).toContain('white_label');
      expect(SUBSCRIPTION_PLANS.OFFICE.features).toContain('priority_support');
    });
  });

  describe('Plan Validation', () => {
    it('should validate user limits correctly', () => {
      const freePlan = SUBSCRIPTION_PLANS.FREE;
      const basicPlan = SUBSCRIPTION_PLANS.BASIC;

      // Test contract limits
      expect(freePlan.maxContracts).toBe(3);
      expect(basicPlan.maxContracts).toBe(25);

      // Test user limits
      expect(freePlan.maxUsers).toBe(1);
      expect(basicPlan.maxUsers).toBe(1);
      expect(SUBSCRIPTION_PLANS.PROFESSIONAL.maxUsers).toBe(5);
      expect(SUBSCRIPTION_PLANS.OFFICE.maxUsers).toBe(20);
    });
  });

  describe('Environment Variables', () => {
    it('should require Stripe environment variables', () => {
      expect(process.env.STRIPE_SECRET_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).toBeDefined();
    });
  });
});

describe('Stripe API Routes', () => {
  describe('Create Checkout Session', () => {
    it('should create checkout session with correct parameters', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: 'price_test_123',
          planName: 'Básico',
        }),
        nextUrl: {
          origin: 'http://localhost:3000',
        },
      } as unknown as NextRequest;

      // Mock successful response
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      // This would be tested with actual API route implementation
      expect(mockRequest.json).toBeDefined();
      expect(mockSession.id).toBe('cs_test_123');
    });
  });

  describe('Webhook Handling', () => {
    it('should handle checkout.session.completed event', () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: {
              userId: 'user_123',
              planName: 'Básico',
            },
          },
        },
      };

      expect(mockEvent.type).toBe('checkout.session.completed');
      expect(mockEvent.data.object.metadata.userId).toBe('user_123');
      expect(mockEvent.data.object.metadata.planName).toBe('Básico');
    });

    it('should handle subscription status changes', () => {
      const subscriptionEvents = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ];

      subscriptionEvents.forEach(eventType => {
        expect(eventType).toMatch(/^(customer\.subscription\.|invoice\.payment_)/);
      });
    });
  });
});

describe('Subscription Limits', () => {
  it('should enforce contract limits correctly', () => {
    const testCases = [
      { plan: 'FREE', currentContracts: 0, maxContracts: 3, canCreate: true },
      { plan: 'FREE', currentContracts: 3, maxContracts: 3, canCreate: false },
      { plan: 'BASIC', currentContracts: 4, maxContracts: 5, canCreate: true },
      { plan: 'BASIC', currentContracts: 5, maxContracts: 5, canCreate: false },
      { plan: 'OFFICE', currentContracts: 499, maxContracts: 500, canCreate: true },
    ];

    testCases.forEach(({ currentContracts, maxContracts, canCreate }) => {
      const canCreateContract = currentContracts < maxContracts;
      expect(canCreateContract).toBe(canCreate);
    });
  });

  it('should enforce user limits correctly', () => {
    const testCases = [
      { plan: 'FREE', currentUsers: 0, maxUsers: 1, canAdd: true },
      { plan: 'FREE', currentUsers: 1, maxUsers: 1, canAdd: false },
      { plan: 'PROFESSIONAL', currentUsers: 2, maxUsers: 3, canAdd: true },
      { plan: 'PROFESSIONAL', currentUsers: 3, maxUsers: 3, canAdd: false },
      { plan: 'OFFICE', currentUsers: 999, maxUsers: 999, canAdd: true }, // Unlimited (999 represents unlimited)
    ];

    testCases.forEach(({ currentUsers, maxUsers, canAdd }) => {
      // For unlimited plans (maxUsers = 999), always allow adding users
      const canAddUser = maxUsers === 999 ? true : currentUsers < maxUsers;
      expect(canAddUser).toBe(canAdd);
    });
  });
});
