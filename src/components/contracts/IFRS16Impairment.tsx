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
import { IFRS16ImpairmentEngine, ImpairmentAnalysis } from '@/lib/calculations/ifrs16-impairment';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';

interface IFRS16ImpairmentProps {
  contractData: IFRS16CompleteData;
  currencyCode?: string;
}

export default function IFRS16Impairment({
  contractData,
  currencyCode = 'BRL',
}: IFRS16ImpairmentProps) {
  const [impairmentAnalysis, setImpairmentAnalysis] = useState<ImpairmentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeImpairment = async () => {
      try {
        setLoading(true);
        const engine = new IFRS16ImpairmentEngine(contractData);
        const analysis = engine.performImpairmentAnalysis();
        setImpairmentAnalysis(analysis);
      } catch (error) {
        console.error('Error analyzing impairment:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeImpairment();
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

  const getImpairmentStatusColor = (status: string) => {
    switch (status) {
      case 'impaired':
        return 'bg-red-100 text-red-800';
      case 'not_impaired':
        return 'bg-green-100 text-green-800';
      case 'reversed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpairmentStatusLabel = (status: string) => {
    switch (status) {
      case 'impaired':
        return 'Com Impairment';
      case 'not_impaired':
        return 'Sem Impairment';
      case 'reversed':
        return 'Impairment Revertido';
      default:
        return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
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

  if (!impairmentAnalysis) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center text-gray-500'>
          <p>Não foi possível analisar o impairment do ativo</p>
        </div>
      </div>
    );
  }

  const currentTest = impairmentAnalysis.current_tests[0];

  return (
    <div className='bg-white rounded-lg shadow'>
      {/* Header */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Teste de Impairment IFRS 16.40</h3>
            <p className='text-sm text-gray-600 mt-1'>{impairmentAnalysis.asset_description}</p>
          </div>
          <div className='flex flex-col items-end space-y-2'>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getImpairmentStatusColor(impairmentAnalysis.impairment_status)}`}
            >
              {getImpairmentStatusLabel(impairmentAnalysis.impairment_status)}
            </span>
            {impairmentAnalysis.next_required_test && (
              <span className='text-xs text-gray-500'>
                Próximo teste: {formatDate(impairmentAnalysis.next_required_test)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-6 space-y-6'>
        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-blue-50 p-4 rounded-lg'>
            <h4 className='font-medium text-blue-900'>Valor Contábil</h4>
            <p className='text-2xl font-bold text-blue-600'>
              {formatCurrency(currentTest.carrying_amount)}
            </p>
          </div>
          <div className='bg-green-50 p-4 rounded-lg'>
            <h4 className='font-medium text-green-900'>Valor Recuperável</h4>
            <p className='text-2xl font-bold text-green-600'>
              {formatCurrency(currentTest.recoverable_amount)}
            </p>
          </div>
          <div className='bg-red-50 p-4 rounded-lg'>
            <h4 className='font-medium text-red-900'>Perda por Impairment</h4>
            <p className='text-2xl font-bold text-red-600'>
              {formatCurrency(currentTest.impairment_loss)}
            </p>
          </div>
          <div className='bg-purple-50 p-4 rounded-lg'>
            <h4 className='font-medium text-purple-900'>Valor Líquido</h4>
            <p className='text-2xl font-bold text-purple-600'>
              {formatCurrency(impairmentAnalysis.net_carrying_amount)}
            </p>
          </div>
        </div>

        {/* Impairment Indicators */}
        <div>
          <h4 className='font-medium text-gray-900 mb-3 flex items-center'>
            <svg
              className='w-5 h-5 mr-2 text-orange-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
            Indicadores de Impairment Identificados
          </h4>

          {currentTest.indicators_present.length === 0 ? (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 text-green-600 mr-2'
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
                <span className='text-green-800 font-medium'>
                  Nenhum indicador significativo identificado
                </span>
              </div>
              <p className='text-green-700 text-sm mt-1'>
                O ativo não apresenta indicadores de impairment no momento.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {currentTest.indicators_present.map((indicator, index) => (
                <div key={index} className='border border-gray-200 rounded-lg p-4'>
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <h5 className='font-medium text-gray-900 capitalize'>
                        {indicator.description}
                      </h5>
                      <p className='text-sm text-gray-600 capitalize'>
                        Tipo: {indicator.indicator_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className='flex flex-col items-end space-y-1'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(indicator.severity)}`}
                      >
                        {getSeverityLabel(indicator.severity)}
                      </span>
                      <span className='text-xs text-gray-500'>
                        Impacto:{' '}
                        {indicator.impact_on_value === 'significant'
                          ? 'Significativo'
                          : indicator.impact_on_value === 'moderate'
                            ? 'Moderado'
                            : 'Mínimo'}
                      </span>
                    </div>
                  </div>

                  {indicator.evidence.length > 0 && (
                    <div className='mt-2'>
                      <span className='text-sm text-gray-600'>Evidências:</span>
                      <ul className='mt-1 list-disc list-inside space-y-1 text-sm text-gray-700'>
                        {indicator.evidence.map((evidence, evidenceIndex) => (
                          <li key={evidenceIndex}>{evidence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recoverable Amount Calculation */}
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
                d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
              />
            </svg>
            Cálculo do Valor Recuperável
          </h4>

          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h5 className='font-medium text-gray-900 mb-2'>Valor em Uso</h5>
                <p className='text-lg font-semibold text-gray-700'>
                  {formatCurrency(currentTest.recoverable_amount_calculation.value_in_use)}
                </p>
                <p className='text-sm text-gray-600 mt-1'>
                  Baseado em fluxos de caixa futuros descontados
                </p>
              </div>

              <div>
                <h5 className='font-medium text-gray-900 mb-2'>
                  Valor Justo Menos Custos de Venda
                </h5>
                <p className='text-lg font-semibold text-gray-700'>
                  {formatCurrency(
                    currentTest.recoverable_amount_calculation.fair_value_less_costs_to_sell
                  )}
                </p>
                <p className='text-sm text-gray-600 mt-1'>
                  Valor de mercado menos custos de transação
                </p>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='flex justify-between items-center'>
                <span className='font-medium text-gray-900'>
                  Valor Recuperável (Maior dos dois):
                </span>
                <span className='text-xl font-bold text-green-600'>
                  {formatCurrency(currentTest.recoverable_amount_calculation.recoverable_amount)}
                </span>
              </div>
              <p className='text-sm text-gray-600 mt-1'>
                Método utilizado:{' '}
                {currentTest.recoverable_amount_calculation.calculation_method === 'value_in_use'
                  ? 'Valor em Uso'
                  : 'Valor Justo Menos Custos de Venda'}
              </p>
            </div>
          </div>
        </div>

        {/* Assumptions */}
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
            Premissas Utilizadas
          </h4>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Taxa de desconto:</span>
                  <span className='font-medium'>
                    {currentTest.recoverable_amount_calculation.assumptions.discount_rate}% a.a.
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Taxa de crescimento:</span>
                  <span className='font-medium'>
                    {(
                      currentTest.recoverable_amount_calculation.assumptions.growth_rate * 100
                    ).toFixed(1)}
                    % a.a.
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-green-50 p-4 rounded-lg'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Vida útil:</span>
                  <span className='font-medium'>
                    {currentTest.recoverable_amount_calculation.assumptions.useful_life} meses
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Valor residual:</span>
                  <span className='font-medium'>
                    {formatCurrency(
                      currentTest.recoverable_amount_calculation.assumptions.residual_value
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Conclusion */}
        <div
          className={`border rounded-lg p-4 ${
            currentTest.conclusion === 'impaired'
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <h4
            className={`font-medium mb-3 flex items-center ${
              currentTest.conclusion === 'impaired' ? 'text-red-900' : 'text-green-900'
            }`}
          >
            <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            Conclusão do Teste
          </h4>

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span
                className={
                  currentTest.conclusion === 'impaired' ? 'text-red-700' : 'text-green-700'
                }
              >
                Status do Impairment:
              </span>
              <span
                className={`font-medium ${currentTest.conclusion === 'impaired' ? 'text-red-800' : 'text-green-800'}`}
              >
                {currentTest.conclusion === 'impaired' ? 'IMPAIRED' : 'NÃO IMPAIRED'}
              </span>
            </div>

            {currentTest.conclusion === 'impaired' && (
              <div className='flex justify-between'>
                <span className='text-red-700'>Perda por Impairment:</span>
                <span className='font-medium text-red-800'>
                  {formatCurrency(currentTest.impairment_loss)}
                </span>
              </div>
            )}

            <div className='flex justify-between'>
              <span
                className={
                  currentTest.conclusion === 'impaired' ? 'text-red-700' : 'text-green-700'
                }
              >
                Próximo teste:
              </span>
              <span
                className={`font-medium ${currentTest.conclusion === 'impaired' ? 'text-red-800' : 'text-green-800'}`}
              >
                {currentTest.next_test_date
                  ? formatDate(currentTest.next_test_date)
                  : 'Não agendado'}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
          <h4 className='font-medium text-gray-900 mb-3 flex items-center'>
            <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
              />
            </svg>
            Rastro de Auditoria
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
            <div>
              <span className='font-medium'>Data do Teste:</span>
              <p>{formatDate(currentTest.test_date)}</p>
            </div>
            <div>
              <span className='font-medium'>Data da Análise:</span>
              <p>{formatDate(impairmentAnalysis.analysis_date)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
