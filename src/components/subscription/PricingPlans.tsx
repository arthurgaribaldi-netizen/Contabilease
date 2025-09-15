'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency_code: string;
  max_contracts: number;
  max_users: number;
  features: {
    [key: string]: any;
  };
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}

interface PricingPlansProps {
  currentPlan?: string;
  onPlanSelect?: (plan: SubscriptionPlan) => void;
}

export default function PricingPlans({ currentPlan, onPlanSelect }: PricingPlansProps) {
  const t = useTranslations('pricing');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
    
    if (onPlanSelect) {
      onPlanSelect(plan);
      return;
    }

    // Default behavior: redirect to checkout
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: billingCycle === 'monthly' 
            ? plan.stripe_price_id_monthly 
            : plan.stripe_price_id_yearly,
          planName: plan.name,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getFeatureList = (features: any) => {
    const featureList = [];
    
    if (features.contracts) {
      featureList.push(`${features.contracts} contratos`);
    }
    if (features.users) {
      featureList.push(`${features.users} usuário${features.users > 1 ? 's' : ''}`);
    }
    if (features.support) {
      featureList.push(`Suporte ${features.support}`);
    }
    if (features.features) {
      featureList.push(...features.features);
    }
    
    return featureList;
  };

  const isCurrentPlan = (planName: string) => {
    return currentPlan === planName;
  };

  const isPopular = (planName: string) => {
    return planName === 'Profissional';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Escolha o plano ideal para você
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Economize tempo e garanta conformidade com IFRS 16
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Mensal
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Anual
            <Badge variant="secondary" className="ml-2">-20%</Badge>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const featureList = getFeatureList(plan.features);
          const popular = isPopular(plan.name);
          const current = isCurrentPlan(plan.name);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${current ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Mais Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(price, plan.currency_code)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {featureList.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full"
                  variant={current ? "secondary" : popular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan)}
                  disabled={current || selectedPlan === plan.id}
                >
                  {current ? 'Plano Atual' : selectedPlan === plan.id ? 'Processando...' : 'Escolher Plano'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-12">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Todos os planos incluem suporte por email e atualizações automáticas.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Cancele a qualquer momento. Sem taxas de cancelamento.
        </p>
      </div>
    </div>
  );
}
