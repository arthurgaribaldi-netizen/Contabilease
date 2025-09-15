'use client';

import { Contract } from '@/lib/contracts';
import { useState } from 'react';

interface IFRS16CalculationResult {
  lease_liability_initial: number;
  right_of_use_asset_initial: number;
  lease_liability_current: number;
  right_of_use_asset_current: number;
  monthly_interest_expense: number;
  monthly_principal_payment: number;
  monthly_amortization: number;
  total_interest_expense: number;
  total_principal_payments: number;
  total_lease_payments: number;
  effective_interest_rate_annual: number;
  effective_interest_rate_monthly: number;
  amortization_schedule: AmortizationPeriod[];
}

interface AmortizationPeriod {
  period: number;
  date: string;
  beginning_liability: number;
  interest_expense: number;
  principal_payment: number;
  ending_liability: number;
  beginning_asset: number;
  amortization: number;
  ending_asset: number;
}

interface IFRS16CalculationResultsProps {
  contract?: Contract;
  calculation?: IFRS16CalculationResult;
  currency?: string;
}

export default function IFRS16CalculationResults({
  contract,
  calculation: propCalculation,
  currency: _currency = 'BRL',
}: IFRS16CalculationResultsProps) {
  const [calculation, setCalculation] = useState<IFRS16CalculationResult | null>(
    propCalculation || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contracts/${contract.id}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate IFRS 16 values');
      }

      const data = await response.json();
      setCalculation(data.calculation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className='bg-white shadow rounded-lg p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-medium text-gray-900'>Cálculos IFRS 16</h3>
        <button
          onClick={handleCalculate}
          disabled={loading}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-800'>{error}</p>
        </div>
      )}

      {calculation && (
        <div className='space-y-6'>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-blue-800'>Passivo de Leasing Inicial</h4>
              <p className='text-2xl font-bold text-blue-900'>
                {formatCurrency(calculation.lease_liability_initial)}
              </p>
            </div>

            <div className='bg-green-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-green-800'>
                Ativo de Direito de Uso Inicial
              </h4>
              <p className='text-2xl font-bold text-green-900'>
                {formatCurrency(calculation.right_of_use_asset_initial)}
              </p>
            </div>

            <div className='bg-purple-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-purple-800'>Taxa de Juros Efetiva</h4>
              <p className='text-2xl font-bold text-purple-900'>
                {formatPercentage(calculation.effective_interest_rate_annual)}
              </p>
            </div>

            <div className='bg-orange-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-orange-800'>Total de Pagamentos</h4>
              <p className='text-2xl font-bold text-orange-900'>
                {formatCurrency(calculation.total_lease_payments)}
              </p>
            </div>
          </div>

          {/* Monthly Details */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-gray-700'>Juros Mensais</h4>
              <p className='text-lg font-semibold text-gray-900'>
                {formatCurrency(calculation.monthly_interest_expense)}
              </p>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-gray-700'>Principal Mensal</h4>
              <p className='text-lg font-semibold text-gray-900'>
                {formatCurrency(calculation.monthly_principal_payment)}
              </p>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-gray-700'>Amortização Mensal</h4>
              <p className='text-lg font-semibold text-gray-900'>
                {formatCurrency(calculation.monthly_amortization)}
              </p>
            </div>
          </div>

          {/* Amortization Schedule Preview */}
          <div>
            <h4 className='text-lg font-medium text-gray-900 mb-4'>
              Cronograma de Amortização (Primeiros 12 Períodos)
            </h4>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Período
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Data
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Passivo Inicial
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Juros
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Principal
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Passivo Final
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {calculation.amortization_schedule.slice(0, 12).map(period => (
                    <tr key={period.period}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {period.period}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {new Date(period.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatCurrency(period.beginning_liability)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatCurrency(period.interest_expense)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatCurrency(period.principal_payment)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatCurrency(period.ending_liability)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {calculation.amortization_schedule.length > 12 && (
              <p className='mt-2 text-sm text-gray-500'>
                Mostrando os primeiros 12 períodos de {calculation.amortization_schedule.length}{' '}
                períodos totais
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
