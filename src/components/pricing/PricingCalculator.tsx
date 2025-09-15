'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalculatorIcon, ClockIcon, TrendingUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ROICalculatorData {
  currentTimePerContract: number;
  contractsPerMonth: number;
  hourlyRate: number;
  errorRate: number;
  currentToolCost: number;
}

interface CalculatedSavings {
  timeSaved: number;
  errorReduction: number;
  monthlyValue: number;
  annualValue: number;
  paybackPeriod: number;
  roi: number;
}

export default function PricingCalculator() {
  const [inputs, setInputs] = useState<ROICalculatorData>({
    currentTimePerContract: 2,
    contractsPerMonth: 10,
    hourlyRate: 50,
    errorRate: 15,
    currentToolCost: 0
  });

  const [savings, setSavings] = useState<CalculatedSavings>({
    timeSaved: 0,
    errorReduction: 0,
    monthlyValue: 0,
    annualValue: 0,
    paybackPeriod: 0,
    roi: 0
  });

  const calculateSavings = (data: ROICalculatorData): CalculatedSavings => {
    // Tempo economizado por contrato (redução de 80% no tempo)
    const timeSavedPerContract = data.currentTimePerContract * 0.8;
    
    // Tempo total economizado por mês
    const timeSaved = timeSavedPerContract * data.contractsPerMonth;
    
    // Redução de erros (de 15% para 2%)
    const errorReduction = data.errorRate - 2;
    
    // Valor mensal economizado
    const monthlyValue = timeSaved * data.hourlyRate;
    
    // Valor anual
    const annualValue = monthlyValue * 12;
    
    // Custo do Contabilease (plano Professional)
    const contabileaseCost = 97;
    
    // Payback period em meses
    const paybackPeriod = contabileaseCost / monthlyValue;
    
    // ROI anual
    const roi = ((annualValue - (contabileaseCost * 12)) / (contabileaseCost * 12)) * 100;
    
    return {
      timeSaved,
      errorReduction,
      monthlyValue,
      annualValue,
      paybackPeriod,
      roi
    };
  };

  useEffect(() => {
    const calculatedSavings = calculateSavings(inputs);
    setSavings(calculatedSavings);
  }, [inputs]);

  const handleInputChange = (field: keyof ROICalculatorData, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          💰 Calcule sua economia com o Contabilease
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubra quanto tempo e dinheiro você pode economizar substituindo suas planilhas Excel 
          por nossa solução automatizada de cálculos IFRS 16.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5 text-blue-600" />
              Sua Situação Atual
            </CardTitle>
            <CardDescription>
              Preencha os dados para calcular sua economia potencial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timePerContract">Horas por contrato atual</Label>
              <Input
                id="timePerContract"
                type="number"
                value={inputs.currentTimePerContract}
                onChange={(e) => handleInputChange('currentTimePerContract', Number(e.target.value))}
                min="0.5"
                max="10"
                step="0.5"
              />
              <p className="text-sm text-gray-500">
                Tempo médio para calcular um contrato IFRS 16
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractsPerMonth">Contratos por mês</Label>
              <Input
                id="contractsPerMonth"
                type="number"
                value={inputs.contractsPerMonth}
                onChange={(e) => handleInputChange('contractsPerMonth', Number(e.target.value))}
                min="1"
                max="100"
              />
              <p className="text-sm text-gray-500">
                Quantidade de contratos que você processa mensalmente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Valor da sua hora (R$)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={inputs.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                min="20"
                max="500"
              />
              <p className="text-sm text-gray-500">
                Valor que você cobra por hora de trabalho
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorRate">Taxa de erro atual (%)</Label>
              <Input
                id="errorRate"
                type="number"
                value={inputs.errorRate}
                onChange={(e) => handleInputChange('errorRate', Number(e.target.value))}
                min="0"
                max="50"
              />
              <p className="text-sm text-gray-500">
                Percentual de contratos que precisam ser recalculados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
              Sua Economia Potencial
            </CardTitle>
            <CardDescription>
              Resultados baseados nos dados inseridos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Saved */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Tempo Economizado</h3>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {savings.timeSaved.toFixed(1)}h por mês
              </div>
              <p className="text-sm text-blue-700">
                Redução de 80% no tempo de cálculo
              </p>
            </div>

            {/* Error Reduction */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Redução de Erros</h3>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {savings.errorReduction.toFixed(0)}%
              </div>
              <p className="text-sm text-green-700">
                De {inputs.errorRate}% para apenas 2%
              </p>
            </div>

            {/* Financial Value */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Valor Financeiro</h3>
              </div>
              <div className="space-y-2">
                <div className="text-xl font-bold text-purple-900">
                  R$ {savings.monthlyValue.toLocaleString('pt-BR')}/mês
                </div>
                <div className="text-lg font-semibold text-purple-800">
                  R$ {savings.annualValue.toLocaleString('pt-BR')}/ano
                </div>
              </div>
            </div>

            {/* ROI */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalculatorIcon className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Retorno do Investimento</h3>
              </div>
              <div className="space-y-2">
                <div className="text-xl font-bold text-yellow-900">
                  {savings.roi.toFixed(0)}% ROI anual
                </div>
                <div className="text-sm text-yellow-700">
                  Payback em {savings.paybackPeriod.toFixed(1)} meses
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t">
              <Button className="w-full" size="lg">
                Começar Teste Grátis
              </Button>
              <p className="text-center text-sm text-gray-500 mt-2">
                30 dias grátis • Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação: Excel vs. Contabilease</CardTitle>
          <CardDescription>
            Veja a diferença entre usar planilhas Excel e nossa solução automatizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Aspecto</th>
                  <th className="text-center py-3 px-4 font-semibold">Excel</th>
                  <th className="text-center py-3 px-4 font-semibold">Contabilease</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Tempo por contrato</td>
                  <td className="py-3 px-4 text-center text-red-600">{inputs.currentTimePerContract}h</td>
                  <td className="py-3 px-4 text-center text-green-600">{(inputs.currentTimePerContract * 0.2).toFixed(1)}h</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Taxa de erro</td>
                  <td className="py-3 px-4 text-center text-red-600">{inputs.errorRate}%</td>
                  <td className="py-3 px-4 text-center text-green-600">2%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Conformidade IFRS 16</td>
                  <td className="py-3 px-4 text-center text-red-600">Manual</td>
                  <td className="py-3 px-4 text-center text-green-600">100% Automática</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Auditoria</td>
                  <td className="py-3 px-4 text-center text-red-600">Difícil</td>
                  <td className="py-3 px-4 text-center text-green-600">Rastreável</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Custo mensal</td>
                  <td className="py-3 px-4 text-center text-gray-600">R$ 0</td>
                  <td className="py-3 px-4 text-center text-blue-600">R$ 97</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Economia mensal</td>
                  <td className="py-3 px-4 text-center text-gray-600">-</td>
                  <td className="py-3 px-4 text-center text-green-600 font-bold">
                    R$ {savings.monthlyValue.toLocaleString('pt-BR')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
