/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  IFRS16AdvancedDisclosuresEngine,
  AdvancedDisclosures,
} from '@/lib/calculations/ifrs16-advanced-disclosures';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';

interface IFRS16AdvancedDisclosuresProps {
  contractData: IFRS16CompleteData;
  currencyCode?: string;
}

export default function IFRS16AdvancedDisclosures({
  contractData,
  currencyCode = 'BRL',
}: IFRS16AdvancedDisclosuresProps) {
  const [disclosures, setDisclosures] = useState<AdvancedDisclosures | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'maturity' | 'options' | 'restrictions' | 'qualitative'
  >('maturity');

  useEffect(() => {
    const generateDisclosures = async () => {
      try {
        setLoading(true);
        const engine = new IFRS16AdvancedDisclosuresEngine(contractData);
        const result = engine.generateAdvancedDisclosures();
        setDisclosures(result);
      } catch (error) {
        console.error('Error generating advanced disclosures:', error);
      } finally {
        setLoading(false);
      }
    };

    generateDisclosures();
  }, [contractData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
            <div className='h-4 bg-gray-200 rounded w-4/6'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!disclosures) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center text-gray-500'>
          <p>Não foi possível gerar as divulgações avançadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      {/* Header */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Divulgações Avançadas IFRS 16.51-53</h3>
        <p className='text-sm text-gray-600 mt-1'>
          Análise de maturidade, opções exercidas e restrições contratuais
        </p>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8 px-6'>
          {[
            {
              id: 'maturity',
              label: 'Análise de Maturidade',
              count: disclosures.maturity_analysis.periods.length,
            },
            {
              id: 'options',
              label: 'Opções Exercidas',
              count: disclosures.exercised_options.length,
            },
            {
              id: 'restrictions',
              label: 'Restrições Contratuais',
              count: disclosures.contractual_restrictions.length,
            },
            { id: 'qualitative', label: 'Divulgações Qualitativas', count: 1 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='p-6'>
        {activeTab === 'maturity' && (
          <MaturityAnalysisTab
            maturityAnalysis={disclosures.maturity_analysis}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'options' && (
          <ExercisedOptionsTab
            exercisedOptions={disclosures.exercised_options}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'restrictions' && (
          <ContractualRestrictionsTab
            restrictions={disclosures.contractual_restrictions}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'qualitative' && (
          <QualitativeDisclosuresTab qualitativeDisclosures={disclosures.qualitative_disclosures} />
        )}
      </div>

      {/* Footer */}
      <div className='bg-gray-50 px-6 py-3 border-t border-gray-200'>
        <div className='flex justify-between items-center text-sm text-gray-600'>
          <span>Data da análise: {formatDate(disclosures.disclosure_date)}</span>
          <span>Período de relatório: {disclosures.reporting_period}</span>
        </div>
      </div>
    </div>
  );
}

// Maturity Analysis Tab Component
function MaturityAnalysisTab({
  maturityAnalysis,
  formatCurrency,
  formatDate,
}: {
  maturityAnalysis: any;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-blue-50 p-4 rounded-lg'>
          <h4 className='font-medium text-blue-900'>Total do Passivo</h4>
          <p className='text-2xl font-bold text-blue-600'>
            {formatCurrency(maturityAnalysis.total_liability)}
          </p>
        </div>
        <div className='bg-green-50 p-4 rounded-lg'>
          <h4 className='font-medium text-green-900'>Total de Juros</h4>
          <p className='text-2xl font-bold text-green-600'>
            {formatCurrency(maturityAnalysis.total_interest)}
          </p>
        </div>
        <div className='bg-purple-50 p-4 rounded-lg'>
          <h4 className='font-medium text-purple-900'>Total Principal</h4>
          <p className='text-2xl font-bold text-purple-600'>
            {formatCurrency(maturityAnalysis.total_principal)}
          </p>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Período
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Passivo de Arrendamento
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Despesa de Juros
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Pagamento Principal
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Total
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {maturityAnalysis.periods.map((period: any, index: number) => (
              <tr key={index}>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {formatDate(period.period_start)} - {formatDate(period.period_end)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {formatCurrency(period.lease_liability)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {formatCurrency(period.interest_expense)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {formatCurrency(period.principal_payment)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {formatCurrency(period.total_payment)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Exercised Options Tab Component
function ExercisedOptionsTab({
  exercisedOptions,
  formatCurrency,
  formatDate,
}: {
  exercisedOptions: any[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}) {
  if (exercisedOptions.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-gray-400 mb-2'>
          <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-1'>Nenhuma opção exercida</h3>
        <p className='text-gray-500'>
          Não há registros de opções contratuais exercidas neste contrato.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {exercisedOptions.map((option, index) => (
        <div key={index} className='border border-gray-200 rounded-lg p-4'>
          <div className='flex justify-between items-start mb-3'>
            <div>
              <h4 className='font-medium text-gray-900 capitalize'>
                {option.option_type.replace('_', ' ')}
              </h4>
              <p className='text-sm text-gray-600'>
                Exercida em: {formatDate(option.exercise_date)}
              </p>
            </div>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
              Exercida
            </span>
          </div>

          {option.new_terms && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-3'>
              {option.new_terms.term_months && (
                <div>
                  <span className='text-sm text-gray-500'>Novo prazo:</span>
                  <p className='font-medium'>{option.new_terms.term_months} meses</p>
                </div>
              )}
              {option.new_terms.monthly_payment && (
                <div>
                  <span className='text-sm text-gray-500'>Novo pagamento:</span>
                  <p className='font-medium'>{formatCurrency(option.new_terms.monthly_payment)}</p>
                </div>
              )}
              {option.new_terms.discount_rate && (
                <div>
                  <span className='text-sm text-gray-500'>Nova taxa:</span>
                  <p className='font-medium'>{option.new_terms.discount_rate}% a.a.</p>
                </div>
              )}
            </div>
          )}

          {option.financial_impact && (
            <div className='bg-gray-50 p-3 rounded'>
              <h5 className='font-medium text-gray-900 mb-2'>Impacto Financeiro</h5>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
                <div>
                  <span className='text-gray-500'>Mudança no Passivo:</span>
                  <p className='font-medium'>
                    {formatCurrency(option.financial_impact.liability_change)}
                  </p>
                </div>
                <div>
                  <span className='text-gray-500'>Mudança no Ativo:</span>
                  <p className='font-medium'>
                    {formatCurrency(option.financial_impact.asset_change)}
                  </p>
                </div>
                <div>
                  <span className='text-gray-500'>Mudança no Pagamento:</span>
                  <p className='font-medium'>
                    {formatCurrency(option.financial_impact.payment_change)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {option.justification && (
            <div className='mt-3'>
              <span className='text-sm text-gray-500'>Justificativa:</span>
              <p className='text-sm text-gray-700'>{option.justification}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Contractual Restrictions Tab Component
function ContractualRestrictionsTab({
  restrictions,
  formatDate,
}: {
  restrictions: any[];
  formatDate: (date: string) => string;
}) {
  if (restrictions.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-gray-400 mb-2'>
          <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-1'>Nenhuma restrição identificada</h3>
        <p className='text-gray-500'>
          Não foram identificadas restrições contratuais significativas.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {restrictions.map((restriction, index) => (
        <div key={index} className='border border-gray-200 rounded-lg p-4'>
          <div className='flex justify-between items-start mb-3'>
            <div>
              <h4 className='font-medium text-gray-900 capitalize'>
                {restriction.restriction_type.replace('_', ' ')}
              </h4>
              <p className='text-sm text-gray-600'>{restriction.description}</p>
            </div>
            <div className='flex flex-col items-end space-y-1'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  restriction.impact_level === 'high'
                    ? 'bg-red-100 text-red-800'
                    : restriction.impact_level === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {restriction.impact_level === 'high'
                  ? 'Alto'
                  : restriction.impact_level === 'medium'
                    ? 'Médio'
                    : 'Baixo'}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  restriction.compliance_status === 'compliant'
                    ? 'bg-green-100 text-green-800'
                    : restriction.compliance_status === 'non_compliant'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {restriction.compliance_status === 'compliant'
                  ? 'Conforme'
                  : restriction.compliance_status === 'non_compliant'
                    ? 'Não Conforme'
                    : 'Em Revisão'}
              </span>
            </div>
          </div>

          <div className='flex items-center space-x-4 text-sm text-gray-600'>
            <div className='flex items-center'>
              <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              {restriction.monitoring_required ? 'Monitoramento necessário' : 'Sem monitoramento'}
            </div>
            {restriction.last_review_date && (
              <div className='flex items-center'>
                <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                Última revisão: {formatDate(restriction.last_review_date)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Qualitative Disclosures Tab Component
function QualitativeDisclosuresTab({ qualitativeDisclosures }: { qualitativeDisclosures: any }) {
  return (
    <div className='space-y-6'>
      <div>
        <h4 className='font-medium text-gray-900 mb-3'>Política de Arrendamento</h4>
        <div className='bg-gray-50 p-4 rounded-lg'>
          <p className='text-sm text-gray-700 leading-relaxed'>
            {qualitativeDisclosures.lease_policy}
          </p>
        </div>
      </div>

      <div>
        <h4 className='font-medium text-gray-900 mb-3'>Julgamentos Significativos</h4>
        <div className='space-y-3'>
          {qualitativeDisclosures.significant_judgments.map((judgment: string, index: number) => (
            <div key={index} className='bg-blue-50 p-3 rounded-lg'>
              <p className='text-sm text-blue-800'>{judgment}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className='font-medium text-gray-900 mb-3'>Compromissos Futuros</h4>
        <div className='bg-green-50 p-4 rounded-lg'>
          <p className='text-sm text-green-800 leading-relaxed'>
            {qualitativeDisclosures.future_commitments}
          </p>
        </div>
      </div>

      <div>
        <h4 className='font-medium text-gray-900 mb-3'>Fatores de Risco</h4>
        <div className='space-y-3'>
          {qualitativeDisclosures.risk_factors.map((risk: string, index: number) => (
            <div key={index} className='bg-yellow-50 p-3 rounded-lg'>
              <p className='text-sm text-yellow-800'>{risk}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
