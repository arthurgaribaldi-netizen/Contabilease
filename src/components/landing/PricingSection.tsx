'use client';

import { Button } from '@/components/ui/button';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Substitua sua planilha Excel",
    features: [
      "1 contrato ativo",
      "Cálculos básicos IFRS 16", 
      "Relatório simples em PDF",
      "Suporte por email",
      "Backup básico"
    ],
    cta: "Começar Grátis",
    ctaLink: "/pt-BR/auth/login",
    popular: false,
    highlight: "Sempre gratuito"
  },
  {
    name: "Básico",
    price: "R$ 29",
    period: "/mês",
    description: "Para contador individual",
    features: [
      "5 contratos ativos",
      "Todos os cálculos IFRS 16",
      "Relatórios completos PDF/Excel",
      "Backup automático",
      "Suporte prioritário",
      "Importação de Excel"
    ],
    cta: "Teste Grátis",
    ctaLink: "/pt-BR/auth/login", 
    popular: true,
    highlight: "Mais popular"
  },
  {
    name: "Profissional",
    price: "R$ 59",
    period: "/mês",
    description: "Para escritório pequeno",
    features: [
      "20 contratos ativos",
      "Multi-usuário (até 3 usuários)",
      "Relatórios customizados",
      "Integração básica",
      "Suporte telefônico",
      "API básica"
    ],
    cta: "Teste Grátis",
    ctaLink: "/pt-BR/auth/login",
    popular: false,
    highlight: "Para equipes"
  },
  {
    name: "Escritório",
    price: "R$ 99",
    period: "/mês", 
    description: "Para escritório médio",
    features: [
      "100 contratos ativos",
      "Multi-usuário ilimitado",
      "API para integrações",
      "Relatórios white-label",
      "Suporte dedicado",
      "Treinamento incluído"
    ],
    cta: "Falar com Vendas",
    ctaLink: "/pt-BR/auth/login",
    popular: false,
    highlight: "Para empresas"
  }
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Planos transparentes e sem surpresas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano que melhor se adequa ao seu volume de contratos. 
            Todos os planos incluem teste grátis de 30 dias, sem cartão de crédito.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <StarIcon className="h-4 w-4" />
                    <span>Mais Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {plan.description}
                </p>
                {plan.highlight && (
                  <div className="mt-2">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {plan.highlight}
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href={plan.ctaLink} className="block">
                <Button 
                  className={`w-full py-3 font-semibold ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              💡 Nossa filosofia de preços
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <strong className="text-gray-900">Especialização focada:</strong><br />
                Desenvolvimento específico para cálculos IFRS 16, sem complexidade desnecessária
              </div>
              <div>
                <strong className="text-gray-900">Eficiência operacional:</strong><br />
                Tecnologia otimizada para reduzir custos e manter preços acessíveis
              </div>
              <div>
                <strong className="text-gray-900">Mercado brasileiro:</strong><br />
                Preços alinhados com a realidade do mercado contábil nacional
              </div>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 rounded-xl p-8 max-w-2xl mx-auto border border-green-200">
            <h3 className="text-xl font-semibold text-green-900 mb-4">
              📊 Análise de valor
            </h3>
            <div className="text-green-800 space-y-2">
              <p><strong>Redução de tempo:</strong> Significativa por contrato</p>
              <p><strong>Valor da hora profissional:</strong> Varia conforme mercado</p>
              <p><strong>Volume típico:</strong> 3-5 contratos por mês</p>
              <div className="border-t border-green-300 pt-2 mt-4">
                <p className="text-lg font-bold">
                  <strong>Benefício principal:</strong> Eficiência operacional
                </p>
                <p className="text-sm">
                  <strong>Investimento:</strong> A partir de R$ 29/mês
                </p>
                <p className="text-xl font-bold text-green-600">
                  Valor: Tempo para análise estratégica
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
