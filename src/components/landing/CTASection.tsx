'use client';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <div className="space-y-8">
          {/* Main CTA */}
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              ✅ Teste profissional gratuito
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Experimente o Contabilease por 30 dias e comprove os benefícios reais 
              para seus processos de IFRS 16. <strong className="text-yellow-300">Sem compromisso!</strong>
            </p>
          </div>

          {/* Value Proposition */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              Benefícios comprovados
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">⚡</div>
                <div className="text-blue-100 text-sm">Eficiência operacional</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">✅</div>
                <div className="text-blue-100 text-sm">Conformidade IFRS 16</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">📊</div>
                <div className="text-blue-100 text-sm">Relatórios padronizados</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 text-white">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <span className="text-lg">Teste grátis por 30 dias</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-white">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <span className="text-lg">Sem cartão de crédito</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-white">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <span className="text-lg">Suporte especializado incluído</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link href="/pt-BR/auth/login">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-12 py-4 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-200 animate-pulse"
              >
                🚀 Começar Teste Grátis Agora
                <ArrowRightIcon className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            
            <div className="text-blue-100">
              <p className="text-sm">
                ✅ Configuração rápida • ✅ Importação de dados • ✅ Suporte especializado
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-8 border-t border-white/20">
            <p className="text-blue-100 text-sm mb-4">
              Ferramenta profissional para cálculos IFRS 16
            </p>
            <div className="flex justify-center space-x-8 text-blue-200 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Teste grátis por 30 dias</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Conformidade normativa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
