'use client';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon, CalculatorIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section 
      className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4"
      role="banner"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Message */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 
                id="hero-heading"
                className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                <span className="text-green-600 font-extrabold">2h economizadas</span>{' '}
                por contrato com IFRS 16 automático
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Substitua planilhas Excel por cálculos precisos em{' '}
                <strong className="text-blue-600">15 minutos</strong>. 
                Relatórios profissionais e backup seguro.{' '}
                <span className="text-green-600 font-semibold">Teste grátis por 30 dias.</span>
              </p>
            </div>

            {/* Value Proposition */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Por que contadores escolhem o Contabilease?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CalculatorIcon className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Cálculos automáticos sem erros</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Economize 2 horas por contrato</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Conformidade IFRS 16 garantida</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/pt-BR/auth/login">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-bold focus:ring-4 focus:ring-green-200 focus:outline-none shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse"
                  aria-describedby="cta-description"
                >
                  🚀 Começar Teste Grátis Agora
                  <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg font-semibold focus:ring-4 focus:ring-gray-200 focus:outline-none"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="Ver demonstração do produto"
              >
                Ver Demonstração
              </Button>
            </div>
            
            <div id="cta-description" className="sr-only">
              Inicie seu teste gratuito de 30 dias sem cartão de crédito
            </div>

            {/* Urgency Banner */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">⚡ Oferta Especial de Lançamento</span>
              </div>
              <p className="text-sm">
                <strong>Teste grátis de 30 dias</strong> disponível • 
                Sem compromisso
              </p>
              <div className="mt-2 text-xs opacity-90">
                🔥 Contadores profissionais já economizam tempo com o Contabilease
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Suporte especializado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Backup automático</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Antes vs Depois
                  </h3>
                  <p className="text-gray-600">
                    Veja a diferença entre planilha Excel e Contabilease
                  </p>
                </div>

                {/* Before/After Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">❌ Excel</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Cálculos manuais</li>
                      <li>• Risco de erros</li>
                      <li>• Sem backup</li>
                      <li>• 2+ horas por contrato</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Contabilease</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Cálculos automáticos</li>
                      <li>• Zero erros</li>
                      <li>• Backup na nuvem</li>
                      <li>• 15 minutos por contrato</li>
                    </ul>
                  </div>
                </div>

                {/* ROI Calculator */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💰 Benefícios Reais</h4>
                  <div className="text-sm text-blue-700">
                    <p><strong>Economia:</strong> Tempo significativo por contrato</p>
                    <p><strong>Precisão:</strong> Cálculos automáticos sem erros</p>
                    <p><strong>Profissionalismo:</strong> Relatórios de qualidade</p>
                    <p><strong>Conformidade:</strong> IFRS 16 sempre atualizado</p>
                    <p className="text-green-600 font-bold">Teste grátis por 30 dias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
