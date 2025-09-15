'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ROICalculation {
  contracts_per_month: number;
  hours_per_contract: number;
  hourly_rate: number;
  monthly_savings: number;
  annual_savings: number;
  roi_percentage: number;
  payback_months: number;
}

export default function ROISimulator() {
  const [contractsPerMonth, setContractsPerMonth] = useState([5]);
  const [hourlyRate, setHourlyRate] = useState([150]);
  const [hoursPerContract, setHoursPerContract] = useState([2.5]);
  
  const [roiCalculation, setROICalculation] = useState<ROICalculation>({
    contracts_per_month: 5,
    hours_per_contract: 2.5,
    hourly_rate: 150,
    monthly_savings: 0,
    annual_savings: 0,
    roi_percentage: 0,
    payback_months: 0
  });

  const contabileasePrice = 29; // R$ 29/mês

  useEffect(() => {
    const contracts = contractsPerMonth[0];
    const hours = hoursPerContract[0];
    const rate = hourlyRate[0];
    
    const monthlySavings = contracts * hours * rate;
    const annualSavings = monthlySavings * 12;
    const roiPercentage = ((annualSavings - (contabileasePrice * 12)) / (contabileasePrice * 12)) * 100;
    const paybackMonths = contabileasePrice / (monthlySavings / 30); // Aproximação
    
    setROICalculation({
      contracts_per_month: contracts,
      hours_per_contract: hours,
      hourly_rate: rate,
      monthly_savings: monthlySavings,
      annual_savings: annualSavings,
      roi_percentage: Math.max(0, roiPercentage),
      payback_months: Math.max(0.1, paybackMonths)
    });
  }, [contractsPerMonth, hourlyRate, hoursPerContract]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChartBarIcon className="h-6 w-6 text-green-600" />
          <span>Simulador de ROI</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Calcule quanto você pode economizar com o Contabilease
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="space-y-6">
          {/* Contracts per Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contratos por mês: {contractsPerMonth[0]}
            </label>
            <Slider
              value={contractsPerMonth}
              onValueChange={setContractsPerMonth}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 contrato</span>
              <span>50 contratos</span>
            </div>
          </div>

          {/* Hours per Contract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horas economizadas por contrato: {hoursPerContract[0]}h
            </label>
            <Slider
              value={hoursPerContract}
              onValueChange={setHoursPerContract}
              max={8}
              min={0.5}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da sua hora: {formatCurrency(hourlyRate[0])}
            </label>
            <Slider
              value={hourlyRate}
              onValueChange={setHourlyRate}
              max={500}
              min={50}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatCurrency(50)}</span>
              <span>{formatCurrency(500)}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Monthly Savings */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Economia Mensal</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {formatCurrency(roiCalculation.monthly_savings)}
              </Badge>
            </div>
          </div>

          {/* Annual Savings */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Economia Anual</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {formatCurrency(roiCalculation.annual_savings)}
              </Badge>
            </div>
          </div>

          {/* ROI Percentage */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">ROI</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`${
                  roiCalculation.roi_percentage > 1000 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {roiCalculation.roi_percentage.toFixed(0)}%
              </Badge>
            </div>
          </div>

          {/* Payback Period */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Payback</span>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {roiCalculation.payback_months < 1 
                  ? '< 1 mês' 
                  : `${roiCalculation.payback_months.toFixed(1)} meses`
                }
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">📊 Resumo</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              Com <strong>{roiCalculation.contracts_per_month} contratos/mês</strong> e 
              economizando <strong>{roiCalculation.hours_per_contract}h por contrato</strong>, você:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Economiza <strong>{formatCurrency(roiCalculation.monthly_savings)} por mês</strong></li>
              <li>Paga o Contabilease em <strong>{roiCalculation.payback_months < 1 ? 'menos de 1 mês' : `${roiCalculation.payback_months.toFixed(1)} meses`}</strong></li>
              <li>Gera um ROI de <strong>{roiCalculation.roi_percentage.toFixed(0)}% ao ano</strong></li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 mb-2">
            💡 <strong>Dica:</strong> Muitos contadores economizam mais de R$ 2.000/mês
          </p>
          <div className="text-xs text-gray-500">
            Cálculo baseado em economia de tempo vs. custo do Contabilease (R$ 29/mês)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
