'use client';

import { CalculatorIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ROICalculator() {
  const [contractsPerMonth, setContractsPerMonth] = useState(4);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [timePerContract, setTimePerContract] = useState(2);

  const timeSavedPerContract = timePerContract - 0.25; // 15 minutes
  const monthlyTimeSaved = contractsPerMonth * timeSavedPerContract;
  const monthlySavings = monthlyTimeSaved * hourlyRate;
  const contabileaseCost = 29;
  const roi = ((monthlySavings - contabileaseCost) / contabileaseCost) * 100;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <CalculatorIcon className="h-8 w-8 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900">
          Calcule Seu ROI em Tempo Real
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contratos por mês
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={contractsPerMonth}
              onChange={(e) => setContractsPerMonth(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1</span>
              <span className="font-semibold text-blue-600">{contractsPerMonth}</span>
              <span>20</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da sua hora (R$)
            </label>
            <input
              type="range"
              min="30"
              max="150"
              step="10"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>R$ 30</span>
              <span className="font-semibold text-blue-600">R$ {hourlyRate}</span>
              <span>R$ 150</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo por contrato (horas)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={timePerContract}
              onChange={(e) => setTimePerContract(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1h</span>
              <span className="font-semibold text-blue-600">{timePerContract}h</span>
              <span>5h</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-4">Seus Resultados</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">Tempo economizado:</span>
                <span className="font-bold text-green-800">
                  {monthlyTimeSaved.toFixed(1)}h/mês
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Economia mensal:</span>
                <span className="font-bold text-green-800">
                  R$ {monthlySavings.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Custo Contabilease:</span>
                <span className="font-bold text-green-800">
                  R$ {contabileaseCost}
                </span>
              </div>
              <div className="border-t border-green-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-green-700 font-semibold">ROI mensal:</span>
                  <span className="font-bold text-green-600 text-xl">
                    {roi.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Comparação</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Com Excel:</span>
                <span className="text-blue-800">
                  {contractsPerMonth * timePerContract}h/mês
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Com Contabilease:</span>
                <span className="text-blue-800">
                  {contractsPerMonth * 0.25}h/mês
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-blue-700">Economia:</span>
                <span className="text-green-600">
                  {monthlyTimeSaved.toFixed(1)}h/mês
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <p className="font-semibold">
            💰 Você economizaria R$ {monthlySavings.toFixed(0)} por mês
          </p>
          <p className="text-sm text-green-100">
            ROI de {roi.toFixed(0)}% no primeiro mês
          </p>
        </div>
      </div>
    </div>
  );
}
