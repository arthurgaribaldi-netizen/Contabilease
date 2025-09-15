'use client';

import React, { useState, useEffect } from 'react';
import {
  IFRS16SensitivityEngine,
  SensitivityAnalysis,
} from '@/lib/calculations/ifrs16-sensitivity';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';

interface IFRS16SensitivityProps {
  contractData: IFRS16CompleteData;
  currencyCode?: string;
}

export default function IFRS16Sensitivity({
  contractData,
  currencyCode = 'BRL',
}: IFRS16SensitivityProps) {
  const [sensitivityAnalysis, setSensitivityAnalysis] = useState<SensitivityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sensitivity' | 'stress' | 'monte_carlo' | 'findings'>(
    'sensitivity'
  );

  useEffect(() => {
    const analyzeSensitivity = async () => {
      try {
        setLoading(true);
        const engine = new IFRS16SensitivityEngine(contractData);
        const analysis = engine.performSensitivityAnalysis();
        setSensitivityAnalysis(analysis);
      } catch (error) {
        console.error('Error analyzing sensitivity:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeSensitivity();
  }, [contractData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'Extremo';
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Médio';
      case 'low':
        return 'Baixo';
      default:
        return severity;
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
            <div className='h-4 bg-gray-200 rounded w-4/6'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sensitivityAnalysis) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center text-gray-500'>
          <p>Não foi possível realizar a análise de sensibilidade</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      {/* Header */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Análise de Sensibilidade e Cenários de Estresse
        </h3>
        <p className='text-sm text-gray-600 mt-1'>
          Análise de riscos e impacto de variações nos parâmetros do contrato
        </p>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8 px-6'>
          {[
            { id: 'sensitivity', label: 'Análise de Sensibilidade' },
            { id: 'stress', label: 'Cenários de Estresse' },
            { id: 'monte_carlo', label: 'Simulação Monte Carlo' },
            { id: 'findings', label: 'Conclusões e Recomendações' },
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='p-6'>
        {activeTab === 'sensitivity' && (
          <SensitivityTab
            sensitivityResults={sensitivityAnalysis.sensitivity_results}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
        )}

        {activeTab === 'stress' && (
          <StressScenariosTab
            stressScenarios={sensitivityAnalysis.stress_scenarios}
            formatCurrency={formatCurrency}
            getSeverityColor={getSeverityColor}
            getSeverityLabel={getSeverityLabel}
          />
        )}

        {activeTab === 'monte_carlo' && (
          <MonteCarloTab
            monteCarloSimulation={sensitivityAnalysis.monte_carlo_simulation}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'findings' && (
          <FindingsTab
            keyFindings={sensitivityAnalysis.key_findings}
            recommendations={sensitivityAnalysis.recommendations}
          />
        )}
      </div>

      {/* Footer */}
      <div className='bg-gray-50 px-6 py-3 border-t border-gray-200'>
        <div className='flex justify-between items-center text-sm text-gray-600'>
          <span>
            Data da análise:{' '}
            {new Date(sensitivityAnalysis.analysis_date).toLocaleDateString('pt-BR')}
          </span>
          <span>Contrato: {sensitivityAnalysis.contract_id}</span>
        </div>
      </div>
    </div>
  );
}

// Sensitivity Tab Component
function SensitivityTab({
  sensitivityResults,
  formatCurrency,
  formatPercentage,
}: {
  sensitivityResults: any[];
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}) {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6'>
        {sensitivityResults.map((result, index) => (
          <div key={index} className='border border-gray-200 rounded-lg p-4'>
            <h4 className='font-medium text-gray-900 mb-4 flex items-center'>
              <svg
                className='w-5 h-5 mr-2 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
              Sensibilidade: {result.parameter}
            </h4>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Variação
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Novo Valor
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Mudança no Passivo
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Mudança no Ativo
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Impacto %
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {result.variations.map((variation: any, varIndex: number) => (
                    <tr key={varIndex}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            variation.variation_percent > 0
                              ? 'bg-red-100 text-red-800'
                              : variation.variation_percent < 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {variation.variation_percent > 0 ? '+' : ''}
                          {formatPercentage(variation.variation_percent)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {result.parameter === 'Taxa de Desconto'
                          ? `${variation.new_value.toFixed(2)}%`
                          : result.parameter === 'Pagamento Mensal'
                            ? formatCurrency(variation.new_value)
                            : `${variation.new_value} meses`}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        <span
                          className={
                            variation.lease_liability_change >= 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {variation.lease_liability_change >= 0 ? '+' : ''}
                          {formatCurrency(variation.lease_liability_change)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        <span
                          className={
                            variation.right_of_use_asset_change >= 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {variation.right_of_use_asset_change >= 0 ? '+' : ''}
                          {formatCurrency(variation.right_of_use_asset_change)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        <span
                          className={
                            Math.abs(variation.impact_percentage) > 10
                              ? 'text-red-600 font-medium'
                              : 'text-gray-600'
                          }
                        >
                          {variation.impact_percentage >= 0 ? '+' : ''}
                          {formatPercentage(variation.impact_percentage)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stress Scenarios Tab Component
function StressScenariosTab({
  stressScenarios,
  formatCurrency,
  getSeverityColor,
  getSeverityLabel,
}: {
  stressScenarios: any[];
  formatCurrency: (value: number) => string;
  getSeverityColor: (severity: string) => string;
  getSeverityLabel: (severity: string) => string;
}) {
  return (
    <div className='space-y-4'>
      {stressScenarios.map((scenario, index) => (
        <div key={index} className='border border-gray-200 rounded-lg p-4'>
          <div className='flex justify-between items-start mb-3'>
            <div>
              <h4 className='font-medium text-gray-900'>{scenario.scenario_name}</h4>
              <p className='text-sm text-gray-600 mt-1'>{scenario.description}</p>
            </div>
            <div className='flex flex-col items-end space-y-1'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(scenario.severity)}`}
              >
                {getSeverityLabel(scenario.severity)}
              </span>
              <span className='text-xs text-gray-500'>Probabilidade: {scenario.probability}%</span>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-3'>
            <div className='bg-red-50 p-3 rounded'>
              <h5 className='font-medium text-red-900 text-sm'>Mudança no Passivo</h5>
              <p className='text-lg font-bold text-red-600'>
                {formatCurrency(scenario.impact.lease_liability_change)}
              </p>
            </div>
            <div className='bg-orange-50 p-3 rounded'>
              <h5 className='font-medium text-orange-900 text-sm'>Mudança no Ativo</h5>
              <p className='text-lg font-bold text-orange-600'>
                {formatCurrency(scenario.impact.right_of_use_asset_change)}
              </p>
            </div>
            <div className='bg-purple-50 p-3 rounded'>
              <h5 className='font-medium text-purple-900 text-sm'>Impacto Total</h5>
              <p className='text-lg font-bold text-purple-600'>
                {formatCurrency(scenario.impact.total_financial_impact)}
              </p>
            </div>
            <div className='bg-blue-50 p-3 rounded'>
              <h5 className='font-medium text-blue-900 text-sm'>Impacto Ponderado</h5>
              <p className='text-lg font-bold text-blue-600'>
                {formatCurrency(scenario.impact.probability_weighted_impact)}
              </p>
            </div>
          </div>

          {scenario.parameters && (
            <div className='bg-gray-50 p-3 rounded'>
              <h5 className='font-medium text-gray-900 text-sm mb-2'>Parâmetros do Cenário:</h5>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700'>
                {scenario.parameters.discount_rate_change && (
                  <div>
                    Mudança na taxa de desconto:{' '}
                    {scenario.parameters.discount_rate_change > 0 ? '+' : ''}
                    {scenario.parameters.discount_rate_change} pontos
                  </div>
                )}
                {scenario.parameters.payment_change_percent && (
                  <div>
                    Mudança no pagamento:{' '}
                    {scenario.parameters.payment_change_percent > 0 ? '+' : ''}
                    {scenario.parameters.payment_change_percent}%
                  </div>
                )}
                {scenario.parameters.term_reduction_months && (
                  <div>Redução do prazo: {scenario.parameters.term_reduction_months} meses</div>
                )}
                {scenario.parameters.market_value_decline && (
                  <div>
                    Declínio do valor de mercado: {scenario.parameters.market_value_decline}%
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Monte Carlo Tab Component
function MonteCarloTab({
  monteCarloSimulation,
  formatCurrency,
}: {
  monteCarloSimulation: any;
  formatCurrency: (value: number) => string;
}) {
  if (!monteCarloSimulation) {
    return (
      <div className='text-center py-8'>
        <div className='text-gray-400 mb-2'>
          <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-1'>Simulação Monte Carlo</h3>
        <p className='text-gray-500'>Simulação não disponível para este contrato.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='font-medium text-blue-900 mb-2'>Parâmetros da Simulação</h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div>
            <span className='text-blue-700'>Iterações:</span>
            <p className='font-medium text-blue-800'>
              {monteCarloSimulation.iterations.toLocaleString()}
            </p>
          </div>
          <div>
            <span className='text-blue-700'>Taxa de desconto:</span>
            <p className='font-medium text-blue-800'>
              {monteCarloSimulation.parameters.discount_rate_mean.toFixed(2)}% ±{' '}
              {monteCarloSimulation.parameters.discount_rate_std}%
            </p>
          </div>
          <div>
            <span className='text-blue-700'>Pagamento mensal:</span>
            <p className='font-medium text-blue-800'>
              {formatCurrency(monteCarloSimulation.parameters.payment_mean)} ±{' '}
              {formatCurrency(monteCarloSimulation.parameters.payment_std)}
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='border border-gray-200 rounded-lg p-4'>
          <h4 className='font-medium text-gray-900 mb-3'>
            Estatísticas do Passivo de Arrendamento
          </h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Média:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.lease_liability_stats.mean)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Mediana:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.lease_liability_stats.median)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Desvio Padrão:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.lease_liability_stats.std_dev)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Mínimo:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.lease_liability_stats.min)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Máximo:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.lease_liability_stats.max)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Percentil 5%:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.lease_liability_stats.percentile_5)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Percentil 95%:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.lease_liability_stats.percentile_95)}
              </span>
            </div>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg p-4'>
          <h4 className='font-medium text-gray-900 mb-3'>
            Estatísticas do Ativo de Direito de Uso
          </h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Média:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.right_of_use_asset_stats.mean)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Mediana:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.right_of_use_asset_stats.median)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Desvio Padrão:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.right_of_use_asset_stats.std_dev)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Mínimo:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.right_of_use_asset_stats.min)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Máximo:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.right_of_use_asset_stats.max)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Percentil 5%:</span>
              <span className='font-medium'>
                {formatCurrency(monteCarloSimulation.results.right_of_use_asset_stats.percentile_5)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Percentil 95%:</span>
              <span className='font-medium'>
                {formatCurrency(
                  monteCarloSimulation.results.right_of_use_asset_stats.percentile_95
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='border border-gray-200 rounded-lg p-4'>
        <h4 className='font-medium text-gray-900 mb-3'>Distribuição de Probabilidade</h4>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Faixa de Valores
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Probabilidade
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contagem
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Visualização
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {monteCarloSimulation.results.probability_distribution.map(
                (dist: any, index: number) => (
                  <tr key={index}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {dist.range}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {dist.probability.toFixed(1)}%
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {dist.count}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{ width: `${dist.probability}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Findings Tab Component
function FindingsTab({
  keyFindings,
  recommendations,
}: {
  keyFindings: string[];
  recommendations: string[];
}) {
  return (
    <div className='space-y-6'>
      <div>
        <h4 className='font-medium text-gray-900 mb-3 flex items-center'>
          <svg
            className='w-5 h-5 mr-2 text-blue-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          Principais Conclusões
        </h4>
        <div className='space-y-3'>
          {keyFindings.map((finding, index) => (
            <div key={index} className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-sm text-blue-800'>{finding}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className='font-medium text-gray-900 mb-3 flex items-center'>
          <svg
            className='w-5 h-5 mr-2 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          Recomendações
        </h4>
        <div className='space-y-3'>
          {recommendations.map((recommendation, index) => (
            <div key={index} className='bg-green-50 border border-green-200 rounded-lg p-3'>
              <p className='text-sm text-green-800'>{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
