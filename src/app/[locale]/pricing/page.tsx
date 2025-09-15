import PricingPlans from '@/components/subscription/PricingPlans';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços - Contabilease',
  description: 'Escolha o plano ideal para sua empresa. Economize tempo e garanta conformidade com IFRS 16.',
  keywords: 'planos, preços, assinatura, IFRS 16, contabilidade, leasing',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PricingPlans />
      </div>
    </div>
  );
}
