/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { IFRS16ModificationEngine } from '@/lib/calculations/ifrs16-modification-engine';
import { logger } from '@/lib/logger';
import {
  ContractModificationFormData,
  ModificationCalculationResult,
} from '@/lib/schemas/contract-modification';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { useState } from 'react';

export default function ContractModificationExample() {
  const [modifications, setModifications] = useState<ContractModificationFormData[]>([]);
  const [currentCalculation, setCurrentCalculation] = useState<any>(null);
  const [selectedModification, setSelectedModification] =
    useState<ModificationCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const baseLeaseData: IFRS16LeaseFormData = {
    title: 'Leasing de Equipamento Industrial - Exemplo com Modificações',
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

  const exampleModifications: ContractModificationFormData[] = [
    {
      modification_date: '2024-06-01',
      modification_type: 'payment_change',
      description: 'Aumento de 10% no pagamento mensal devido à inflação',
      effective_date: '2024-06-01',
      payment_change_percentage: 10,
      modification_fee: 500,
      status: 'effective',
    },
    {
      modification_date: '2024-12-01',
      modification_type: 'term_extension',
      description: 'Extensão do contrato por mais 12 meses',
      effective_date: '2024-12-01',
      term_change_months: 12,
      modification_fee: 1000,
      status: 'effective',
    },
    {
      modification_date: '2025-06-01',
      modification_type: 'rate_change',
      description: 'Ajuste da taxa de desconto devido à mudança nas condições de mercado',
      effective_date: '2025-06-01',
      new_discount_rate_annual: 9.0,
      modification_fee: 300,
      status: 'effective',
    },
  ];

  const handleAddModification = async (modification: ContractModificationFormData) => {
    setIsCalculating(true);

    try {
      const newModifications = [...modifications, modification];
      setModifications(newModifications);

      // Recalculate current state
      const engine = new IFRS16ModificationEngine(baseLeaseData, newModifications);
      const currentState = engine.getCurrentContractState();
      setCurrentCalculation(currentState);

      // Calculate impact of the new modification
      const impact = engine.calculateModificationImpact(modification);
      setSelectedModification(impact);
    } catch (error) {
      logger.error(
        'Error adding modification:',
        {
          component: 'contractmodificationexample',
          operation: 'addModification',
        },
        error as Error
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLoadExample = () => {
    setModifications(exampleModifications);

    const engine = new IFRS16ModificationEngine(baseLeaseData, exampleModifications);
    const currentState = engine.getCurrentContractState();
    setCurrentCalculation(currentState);
    setSelectedModification(null);
  };

  const handleClearModifications = () => {
    setModifications([]);
    setCurrentCalculation(null);
    setSelectedModification(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Engine de Modificações IFRS 16 - Demonstração
        </h1>
        <p className='text-lg text-gray-600 mb-6'>
          Esta demonstração mostra como o engine de modificações IFRS 16 funciona com exemplos
          práticos de mudanças em contratos de leasing. Veja como as modificações afetam os cálculos
          automaticamente.
        </p>

        {/* Example Controls */}
        <div className='bg-blue-50 p-6 rounded-lg mb-6'>
          <h2 className='text-xl font-semibold text-blue-900 mb-4'>Controles de Demonstração</h2>
          <div className='flex space-x-4'>
            <button
              onClick={handleLoadExample}
              disabled={isCalculating}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
            >
              Carregar Exemplo Completo
            </button>
            <button
              onClick={handleClearModifications}
              disabled={isCalculating}
              className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50'
            >
              Limpar Modificações
            </button>
          </div>
          <p className='text-sm text-blue-700 mt-2'>
            O exemplo inclui: aumento de pagamento, extensão de prazo e mudança de taxa de desconto
          </p>
        </div>

        {/* Current Contract State */}
        {currentCalculation && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-6 mb-6'>
            <h3 className='text-lg font-semibold text-green-800 mb-4'>
              ✅ Estado Atual do Contrato (com {modifications.length} modificações aplicadas)
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='font-medium text-green-700'>Lease Liability:</span>
                <p className='text-green-600 font-semibold'>
                  {formatCurrency(currentCalculation.lease_liability_initial)}
                </p>
              </div>
              <div>
                <span className='font-medium text-green-700'>Right-of-use Asset:</span>
                <p className='text-green-600 font-semibold'>
                  {formatCurrency(currentCalculation.right_of_use_asset_initial)}
                </p>
              </div>
              <div>
                <span className='font-medium text-green-700'>Pagamento Mensal:</span>
                <p className='text-green-600 font-semibold'>
                  {formatCurrency(currentCalculation.monthly_payment)}
                </p>
              </div>
              <div>
                <span className='font-medium text-green-700'>Prazo Total:</span>
                <p className='text-green-600 font-semibold'>
                  {currentCalculation.amortization_schedule.length} meses
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modifications List */}
        {modifications.length > 0 && (
          <div className='bg-white rounded-lg shadow mb-6'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Modificações Aplicadas ({modifications.length})
              </h3>
            </div>
            <div className='divide-y divide-gray-200'>
              {modifications.map((modification, index) => (
                <div key={index} className='p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h4 className='text-sm font-medium text-gray-900'>
                          {modification.modification_type === 'payment_change' &&
                            'Mudança no Pagamento'}
                          {modification.modification_type === 'term_extension' &&
                            'Extensão de Prazo'}
                          {modification.modification_type === 'rate_change' && 'Mudança na Taxa'}
                        </h4>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          Efetivo
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 mb-3'>{modification.description}</p>
                      <div className='text-xs text-gray-500'>
                        Vigente desde:{' '}
                        {new Date(modification.effective_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const engine = new IFRS16ModificationEngine(baseLeaseData, modifications);
                        const impact = engine.calculateModificationImpact(modification);
                        setSelectedModification(impact);
                      }}
                      className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700'
                    >
                      Ver Impacto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Analysis */}
        {selectedModification && (
          <div className='bg-white rounded-lg shadow mb-6'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Análise de Impacto da Modificação
              </h3>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='text-sm font-medium text-gray-900 mb-3'>Antes da Modificação</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Lease Liability:</span>
                      <span className='font-semibold'>
                        {formatCurrency(selectedModification.before_modification.lease_liability)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Right-of-use Asset:</span>
                      <span className='font-semibold'>
                        {formatCurrency(
                          selectedModification.before_modification.right_of_use_asset
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Pagamento Mensal:</span>
                      <span className='font-semibold'>
                        {formatCurrency(selectedModification.before_modification.monthly_payment)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Prazo Restante:</span>
                      <span className='font-semibold'>
                        {selectedModification.before_modification.remaining_term_months} meses
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-gray-900 mb-3'>Após a Modificação</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Lease Liability:</span>
                      <span className='font-semibold'>
                        {formatCurrency(selectedModification.after_modification.lease_liability)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Right-of-use Asset:</span>
                      <span className='font-semibold'>
                        {formatCurrency(selectedModification.after_modification.right_of_use_asset)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Pagamento Mensal:</span>
                      <span className='font-semibold'>
                        {formatCurrency(selectedModification.after_modification.monthly_payment)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Prazo Total:</span>
                      <span className='font-semibold'>
                        {selectedModification.after_modification.remaining_term_months} meses
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 pt-6 border-t border-gray-200'>
                <h4 className='text-sm font-medium text-gray-900 mb-3'>Impacto Financeiro</h4>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-600'>Mudança no Liability:</span>
                    <p
                      className={`font-semibold ${selectedModification.impact.liability_change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {selectedModification.impact.liability_change >= 0 ? '+' : ''}
                      {formatCurrency(selectedModification.impact.liability_change)}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Mudança no Asset:</span>
                    <p
                      className={`font-semibold ${selectedModification.impact.asset_change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {selectedModification.impact.asset_change >= 0 ? '+' : ''}
                      {formatCurrency(selectedModification.impact.asset_change)}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Mudança no Pagamento:</span>
                    <p
                      className={`font-semibold ${selectedModification.impact.payment_change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {selectedModification.impact.payment_change >= 0 ? '+' : ''}
                      {formatCurrency(selectedModification.impact.payment_change)}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Impacto Líquido:</span>
                    <p
                      className={`font-semibold ${selectedModification.impact.net_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {selectedModification.impact.net_impact >= 0 ? '+' : ''}
                      {formatCurrency(selectedModification.impact.net_impact)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technical Information */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recursos de Modificação Implementados
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Tipos de Modificação Suportados:</h4>
              <ul className='space-y-1 list-disc list-inside'>
                <li>Extensão de prazo</li>
                <li>Redução de prazo</li>
                <li>Mudança no valor do pagamento</li>
                <li>Mudança na taxa de desconto</li>
                <li>Mudança no ativo</li>
                <li>Rescisão antecipada</li>
                <li>Renovação do contrato</li>
              </ul>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Cálculos Automáticos:</h4>
              <ul className='space-y-1 list-disc list-inside'>
                <li>Impacto no Lease Liability</li>
                <li>Impacto no Right-of-use Asset</li>
                <li>Novo cronograma de amortização</li>
                <li>Análise de impacto financeiro</li>
                <li>Rastreamento de histórico</li>
                <li>Validação de dados</li>
                <li>Auditoria completa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
