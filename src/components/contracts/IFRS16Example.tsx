'use client';

import { useState } from 'react';
import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { IFRS16LeaseFormData, IFRS16CalculationResult } from '@/lib/schemas/ifrs16-lease';
import IFRS16CalculationResults from './IFRS16CalculationResults';

export default function IFRS16Example() {
  const [calculation, setCalculation] = useState<IFRS16CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exampleData: IFRS16LeaseFormData = {
    title: 'Leasing de Equipamento Industrial - Exemplo',
    status: 'active',
    currency_code: 'BRL',
    lease_start_date: '2024-01-01',
    lease_end_date: '2026-12-31',
    lease_term_months: 36,
    monthly_payment: 1500,
    payment_frequency: 'monthly',
    discount_rate_annual: 8.5,
    payment_timing: 'end',
    initial_payment: 5000,
    asset_fair_value: 60000,
    initial_direct_costs: 2000,
    lease_incentives: 1000,
    guaranteed_residual_value: 10000,
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validate the example data
      const engine = new IFRS16CalculationEngine(exampleData);
      const validation = engine.validateLeaseData();

      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      // Perform calculation
      const result = engine.calculateAll();
      setCalculation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Engine de Cálculos IFRS 16 - Demonstração
        </h1>
        <p className='text-lg text-gray-600 mb-6'>
          Esta demonstração mostra como o engine de cálculos IFRS 16 funciona com um exemplo prático
          de contrato de leasing. Clique no botão abaixo para executar os cálculos automaticamente.
        </p>

        {/* Example Contract Details */}
        <div className='bg-blue-50 p-6 rounded-lg mb-6'>
          <h2 className='text-xl font-semibold text-blue-900 mb-4'>
            Exemplo de Contrato de Leasing
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='font-medium text-blue-800'>Título:</span>
              <p className='text-blue-700'>{exampleData.title}</p>
            </div>
            <div>
              <span className='font-medium text-blue-800'>Prazo:</span>
              <p className='text-blue-700'>{exampleData.lease_term_months} meses</p>
            </div>
            <div>
              <span className='font-medium text-blue-800'>Pagamento Mensal:</span>
              <p className='text-blue-700'>
                R$ {exampleData.monthly_payment.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <span className='font-medium text-blue-800'>Taxa de Desconto:</span>
              <p className='text-blue-700'>{exampleData.discount_rate_annual}% a.a.</p>
            </div>
            <div>
              <span className='font-medium text-blue-800'>Pagamento Inicial:</span>
              <p className='text-blue-700'>
                R$ {exampleData.initial_payment?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <span className='font-medium text-blue-800'>Valor Residual:</span>
              <p className='text-blue-700'>
                R$ {exampleData.guaranteed_residual_value?.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className='text-center mb-8'>
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className='px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium'
          >
            {isCalculating ? 'Calculando...' : 'Executar Cálculos IFRS 16'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>Erro no Cálculo</h3>
                <div className='mt-2 text-sm text-red-700'>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Results */}
        {calculation && (
          <div className='space-y-6'>
            {/* Quick Summary */}
            <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-green-800 mb-4'>
                ✅ Cálculos Concluídos com Sucesso!
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <span className='font-medium text-green-700'>Lease Liability:</span>
                  <p className='text-green-600 font-semibold'>
                    R${' '}
                    {calculation.lease_liability_initial.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <span className='font-medium text-green-700'>Right-of-use Asset:</span>
                  <p className='text-green-600 font-semibold'>
                    R${' '}
                    {calculation.right_of_use_asset_initial.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <span className='font-medium text-green-700'>Juros Mensais:</span>
                  <p className='text-green-600 font-semibold'>
                    R${' '}
                    {calculation.monthly_interest_expense.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <span className='font-medium text-green-700'>Amortização Mensal:</span>
                  <p className='text-green-600 font-semibold'>
                    R${' '}
                    {calculation.monthly_amortization.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <IFRS16CalculationResults calculation={calculation} currency='BRL' />
          </div>
        )}

        {/* Technical Information */}
        <div className='mt-12 bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Informações Técnicas do Engine
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Cálculos Implementados:</h4>
              <ul className='space-y-1 list-disc list-inside'>
                <li>Lease Liability (Valor Presente)</li>
                <li>Right-of-use Asset</li>
                <li>Amortização Linear</li>
                <li>Despesa de Juros</li>
                <li>Cronograma Completo</li>
                <li>Taxa Efetiva de Juros</li>
              </ul>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Recursos Suportados:</h4>
              <ul className='space-y-1 list-disc list-inside'>
                <li>Pagamentos no início/fim do período</li>
                <li>Pagamento inicial</li>
                <li>Valor residual garantido</li>
                <li>Custos diretos iniciais</li>
                <li>Incentivos de leasing</li>
                <li>Pagamentos variáveis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
