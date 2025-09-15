'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import {
    ArrowDownTrayIcon,
    CalculatorIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import DemoTour from './DemoTour';
import ROISimulator from './ROISimulator';

// Dados fictícios para demonstração
const DEMO_CONTRACTS = [
  {
    id: 'demo-1',
    title: 'Leasing de Equipamento Industrial',
    description: 'Contrato típico de leasing para equipamentos industriais',
    data: {
      title: 'Leasing de Equipamento Industrial',
      status: 'active' as const,
      currency_code: 'BRL',
      lease_start_date: '2024-01-01',
      lease_end_date: '2026-12-31',
      lease_term_months: 36,
      monthly_payment: 2500,
      payment_frequency: 'monthly' as const,
      discount_rate_annual: 8.5,
      payment_timing: 'end' as const,
      initial_payment: 5000,
      asset_fair_value: 85000,
      initial_direct_costs: 3000,
      lease_incentives: 2000,
      guaranteed_residual_value: 15000,
    }
  },
  {
    id: 'demo-2',
    title: 'Leasing de Veículos Corporativos',
    description: 'Contrato de leasing para frota de veículos',
    data: {
      title: 'Leasing de Veículos Corporativos',
      status: 'active' as const,
      currency_code: 'BRL',
      lease_start_date: '2024-03-01',
      lease_end_date: '2027-02-28',
      lease_term_months: 36,
      monthly_payment: 1800,
      payment_frequency: 'monthly' as const,
      discount_rate_annual: 7.2,
      payment_timing: 'end' as const,
      initial_payment: 3000,
      asset_fair_value: 65000,
      initial_direct_costs: 2500,
      lease_incentives: 1500,
      guaranteed_residual_value: 12000,
    }
  },
  {
    id: 'demo-3',
    title: 'Leasing de Imóveis Comerciais',
    description: 'Contrato de leasing para imóvel comercial',
    data: {
      title: 'Leasing de Imóveis Comerciais',
      status: 'active' as const,
      currency_code: 'BRL',
      lease_start_date: '2024-01-01',
      lease_end_date: '2029-12-31',
      lease_term_months: 72,
      monthly_payment: 12000,
      payment_frequency: 'monthly' as const,
      discount_rate_annual: 6.8,
      payment_timing: 'end' as const,
      initial_payment: 20000,
      asset_fair_value: 850000,
      initial_direct_costs: 15000,
      lease_incentives: 10000,
      guaranteed_residual_value: 100000,
    }
  }
];

interface CalculationResult {
  lease_liability_initial: number;
  right_of_use_asset_initial: number;
  monthly_interest_expense: number;
  monthly_amortization: number;
  total_payments: number;
  present_value: number;
  savings_vs_excel: {
    time_saved_hours: number;
    error_reduction_percent: number;
    professional_reports: boolean;
  };
}

export default function InteractiveDemo() {
  const [selectedContract, setSelectedContract] = useState(DEMO_CONTRACTS[0]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTour, setShowTour] = useState(false);

  // Calcular resultados em tempo real
  const engine = useMemo(() => {
    return new IFRS16CalculationEngine(selectedContract.data);
  }, [selectedContract]);

  const results = useMemo(() => {
    if (!engine) return null;
    return engine.calculateAll();
  }, [engine]);

  useEffect(() => {
    if (results) {
      setIsCalculating(true);
      // Simular delay de cálculo para UX
      setTimeout(() => {
        setCalculationResult({
          lease_liability_initial: results.lease_liability_initial,
          right_of_use_asset_initial: results.right_of_use_asset_initial,
          monthly_interest_expense: results.monthly_interest_expense,
          monthly_amortization: results.monthly_amortization,
          total_payments: selectedContract.data.monthly_payment * selectedContract.data.lease_term_months + selectedContract.data.initial_payment,
          present_value: results.lease_liability_initial,
          savings_vs_excel: {
            time_saved_hours: 2.5,
            error_reduction_percent: 100,
            professional_reports: true
          }
        });
        setIsCalculating(false);
        setCurrentStep(2);
      }, 1500);
    }
  }, [results, selectedContract]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleContractChange = (contract: typeof DEMO_CONTRACTS[0]) => {
    setSelectedContract(contract);
    setCalculationResult(null);
    setCurrentStep(1);
    setShowComparison(false);
  };

  const handleShowComparison = () => {
    setShowComparison(true);
    setCurrentStep(3);
  };

  const handleDownloadReport = () => {
    // Simular download de relatório
    const reportData = {
      contract: selectedContract.title,
      calculations: calculationResult,
      generated_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-ifrs16-${selectedContract.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              🚀 Demonstração Interativa IFRS 16
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Experimente o poder dos cálculos automáticos. Veja como é simples substituir suas planilhas Excel.
            </p>
            <Button
              onClick={() => setShowTour(true)}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              🎯 Tour Guiado
            </Button>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircleIcon className="h-6 w-6" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Panel - Contract Selection & Input */}
          <div className="space-y-6">
            <Card id="contract-selection">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalculatorIcon className="h-6 w-6 text-blue-600" />
                  <span>Selecione um Contrato de Exemplo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEMO_CONTRACTS.map((contract) => (
                    <button
                      key={contract.id}
                      onClick={() => handleContractChange(contract)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedContract.id === contract.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{contract.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle>Dados do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Pagamento Mensal:</span>
                    <p className="font-semibold">{formatCurrency(selectedContract.data.monthly_payment)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Prazo:</span>
                    <p className="font-semibold">{selectedContract.data.lease_term_months} meses</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Taxa de Desconto:</span>
                    <p className="font-semibold">{selectedContract.data.discount_rate_annual}% a.a.</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Valor Justo:</span>
                    <p className="font-semibold">{formatCurrency(selectedContract.data.asset_fair_value)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* Calculation Status */}
            <Card id="calculation-results">
              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  {isCalculating ? (
                    <motion.div
                      key="calculating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <div className="inline-flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-lg font-medium text-gray-700">
                          Calculando IFRS 16...
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Executando cálculos automáticos de valor presente e amortização
                      </p>
                    </motion.div>
                  ) : calculationResult ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="text-center mb-6">
                        <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          ✅ Cálculos Concluídos!
                        </h3>
                        <p className="text-gray-600">
                          Todos os valores IFRS 16 foram calculados automaticamente
                        </p>
                      </div>

                      {/* Key Results */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm text-blue-600 font-medium">Passivo de Arrendamento</div>
                          <div className="text-xl font-bold text-blue-900">
                            {formatCurrency(calculationResult.lease_liability_initial)}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-sm text-green-600 font-medium">Ativo de Direito de Uso</div>
                          <div className="text-xl font-bold text-green-900">
                            {formatCurrency(calculationResult.right_of_use_asset_initial)}
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="text-sm text-purple-600 font-medium">Juros Mensais</div>
                          <div className="text-xl font-bold text-purple-900">
                            {formatCurrency(calculationResult.monthly_interest_expense)}
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="text-sm text-orange-600 font-medium">Amortização Mensal</div>
                          <div className="text-xl font-bold text-orange-900">
                            {formatCurrency(calculationResult.monthly_amortization)}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={handleShowComparison}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <ChartBarIcon className="h-5 w-5 mr-2" />
                          Ver Comparação com Excel
                        </Button>
                        <Button
                          onClick={handleDownloadReport}
                          variant="outline"
                          className="w-full"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                          Baixar Relatório de Exemplo
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="initial"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Selecione um contrato para ver os cálculos
                      </h3>
                      <p className="text-sm text-gray-500">
                        Os cálculos IFRS 16 serão executados automaticamente
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Comparison Panel */}
            <AnimatePresence>
              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card id="comparison-panel">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ChartBarIcon className="h-6 w-6 text-green-600" />
                        <span>Contabilease vs Excel</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Excel Side */}
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            Planilha Excel
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Tempo de cálculo:</span>
                              <span className="font-semibold text-red-700">2-3 horas</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Risco de erro:</span>
                              <span className="font-semibold text-red-700">Alto</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Backup:</span>
                              <span className="font-semibold text-red-700">Manual</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Relatórios:</span>
                              <span className="font-semibold text-red-700">Básicos</span>
                            </div>
                          </div>
                        </div>

                        {/* Contabilease Side */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Contabilease
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Tempo de cálculo:</span>
                              <span className="font-semibold text-green-700">15 minutos</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Risco de erro:</span>
                              <span className="font-semibold text-green-700">Zero</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Backup:</span>
                              <span className="font-semibold text-green-700">Automático</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Relatórios:</span>
                              <span className="font-semibold text-green-700">Profissionais</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Savings Summary */}
                      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-2">💰 Economia Real</h5>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-900">
                              {calculationResult.savings_vs_excel.time_saved_hours}h
                            </div>
                            <div className="text-blue-700">economizadas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-900">
                              {calculationResult.savings_vs_excel.error_reduction_percent}%
                            </div>
                            <div className="text-blue-700">menos erros</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-900">∞</div>
                            <div className="text-blue-700">mais profissional</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ROI Simulator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💰 Calcule seu ROI Personalizado
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubra exatamente quanto você pode economizar com base no seu volume de contratos
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto" id="roi-simulator">
            <ROISimulator />
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pronto para economizar tempo e eliminar erros?
            </h3>
            <p className="text-gray-600 mb-6">
              Teste grátis por 30 dias. Sem cartão de crédito, sem compromisso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4">
                🚀 Começar Teste Grátis
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4">
                📞 Falar com Especialista
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              ✅ Suporte especializado • ✅ Backup automático • ✅ Cancelamento fácil
            </div>
          </div>
        </motion.div>

        {/* Demo Tour */}
        {showTour && (
          <DemoTour onClose={() => setShowTour(false)} />
        )}
      </div>
    </div>
  );
}
