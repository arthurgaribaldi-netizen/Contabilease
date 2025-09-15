import Stripe from 'stripe';

if (!process.env['STRIPE_SECRET_KEY']) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

// Server-side Stripe instance
export const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Client-side Stripe instance
export const getStripe = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return import('@stripe/stripe-js').then(({ loadStripe }) => 
    loadStripe(process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']!)
  );
};

// Subscription plan configurations
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Gratuito',
    priceId: null,
    price: 0,
    maxContracts: 3,
    maxUsers: 1,
    features: ['basic_calculations', 'export_pdf']
  },
  BASIC: {
    name: 'Básico',
    priceId: process.env['STRIPE_BASIC_PRICE_ID'],
    price: 29,
    maxContracts: 25,
    maxUsers: 1,
    features: ['advanced_calculations', 'export_pdf', 'export_excel', 'modifications']
  },
  PROFESSIONAL: {
    name: 'Profissional',
    priceId: process.env['STRIPE_PROFESSIONAL_PRICE_ID'],
    price: 79,
    maxContracts: 100,
    maxUsers: 5,
    features: ['advanced_calculations', 'export_pdf', 'export_excel', 'modifications', 'api_access', 'custom_reports']
  },
  OFFICE: {
    name: 'Escritório',
    priceId: process.env['STRIPE_OFFICE_PRICE_ID'],
    price: 199,
    maxContracts: 500,
    maxUsers: 20,
    features: ['advanced_calculations', 'export_pdf', 'export_excel', 'modifications', 'api_access', 'custom_reports', 'white_label', 'priority_support']
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// Helper function to get plan by name
export function getPlanByName(planName: string): typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS] | null {
  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.name === planName);
  return plan || null;
}

// Helper function to check if user can perform action based on plan
export function canPerformAction(
  userPlan: typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS],
  action: string,
  currentUsage: { contracts: number; users: number }
): boolean {
  switch (action) {
    case 'create_contract':
      return currentUsage.contracts < userPlan.maxContracts;
    case 'add_user':
      return currentUsage.users < userPlan.maxUsers;
    case 'export_excel':
      return (userPlan.features as readonly string[]).includes('export_excel');
    case 'api_access':
      return (userPlan.features as readonly string[]).includes('api_access');
    case 'custom_reports':
      return (userPlan.features as readonly string[]).includes('custom_reports');
    case 'white_label':
      return (userPlan.features as readonly string[]).includes('white_label');
    default:
      return true;
  }
}
