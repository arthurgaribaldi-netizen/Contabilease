'use client';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ROICalculator from './ROICalculator';

export default function DemoSection() {
  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Veja o Contabilease em ação
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Demonstração prática de como substituir sua planilha Excel em poucos minutos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Video Placeholder */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <PlayIcon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Demonstração Interativa
                  </h3>
                  <p className="text-gray-600">
                    Veja como criar um contrato de leasing em 3 minutos
                  </p>
                </div>
              </div>
              
              {/* Demo Steps */}
              <div className="p-6 bg-white">
                <h4 className="font-semibold text-gray-900 mb-4">
                  O que você verá na demonstração:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <span className="text-gray-700">Importação de dados do Excel</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">2</span>
                    </div>
                    <span className="text-gray-700">Cálculos automáticos de IFRS 16</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">3</span>
                    </div>
                    <span className="text-gray-700">Geração de relatórios profissionais</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                De planilha Excel para relatório profissional em 3 passos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Veja como é simples substituir suas planilhas Excel pelo Contabilease. 
                Em poucos minutos você terá cálculos precisos e relatórios que impressionam seus clientes.
              </p>
            </div>

            {/* Step by Step */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Importe seus dados
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Cole os dados do seu Excel ou importe o arquivo diretamente. 
                    Não precisa reformatar nada.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Cálculos automáticos
                  </h4>
                  <p className="text-gray-600 text-sm">
                    O sistema calcula automaticamente todos os valores de IFRS 16: 
                    valor presente, depreciação, juros e amortização.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Relatórios profissionais
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Gere PDFs e Excel com layout profissional, 
                    gráficos e análises prontas para apresentar aos clientes.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Link href="/pt-BR/auth/login">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold">
                  Teste Grátis por 30 dias
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  ✅ Sem cartão de crédito • ✅ Suporte incluído • ✅ Cancelamento fácil
                </p>
              </div>
            </div>

            {/* ROI Calculator */}
            <ROICalculator />
          </div>
        </div>
      </div>
    </section>
  );
}
