/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { ExceptionAnalysis, IFRS16ExceptionsEngine } from '@/lib/calculations/ifrs16-exceptions';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';
import { useEffect, useState } from 'react';

interface IFRS16ExceptionsProps {
  contractData: IFRS16CompleteData;
  currencyCode?: string;
}

export default function IFRS16Exceptions({
  contractData,
  currencyCode = 'BRL',
}: IFRS16ExceptionsProps) {
  const [exceptionAnalysis, setExceptionAnalysis] = useState<ExceptionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    const analyzeExceptions = async () => {
      try {
        setLoading(true);
        const engine = new IFRS16ExceptionsEngine(contractData);
        const analysis = engine.analyzeExceptions();
        const validationResult = engine.validateExceptionCriteria();

        setExceptionAnalysis(analysis);
        setValidation(validationResult);
      } catch (error) {
        console.error('Error analyzing exceptions:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeExceptions();
  }, [contractData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const getExceptionTypeLabel = (type: string) => {
    switch (type) {
      case 'short_term':
        return 'Curto Prazo';
      case 'low_value':
        return 'Baixo Valor';
      case 'both':
        return 'Curto Prazo + Baixo Valor';
      case 'none':
        return 'Nenhuma Exceção';
      default:
        return type;
    }
  };

  const getExceptionTypeColor = (type: string) => {
    switch (type) {
      case 'short_term':
        return 'bg-blue-100 text-blue-800';
      case 'low_value':
        return 'bg-green-100 text-green-800';
      case 'both':
        return 'bg-purple-100 text-purple-800';
      case 'none':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountingTreatmentColor = (treatment: string) => {
    return treatment === 'simplified' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
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

  if (!exceptionAnalysis) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center text-gray-500'>
          <p>Não foi possível analisar as exceções do contrato</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      {/* Header */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Análise de Exceções IFRS 16.5-8</h3>
            <p className='text-sm text-gray-600 mt-1'>Curto prazo e ativos de baixo valor</p>
          </div>
          <div className='flex flex-col items-end space-y-2'>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExceptionTypeColor(exceptionAnalysis.exception_type)}`}
            >
              {getExceptionTypeLabel(exceptionAnalysis.exception_type)}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccountingTreatmentColor(exceptionAnalysis.accounting_treatment)}`}
            >
              {exceptionAnalysis.accounting_treatment === 'simplified'
                ? 'Contabilização Simplificada'
                : 'IFRS 16 Completo'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-6 space-y-6'>
        {/* Exception Summary */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Short-term Lease Analysis */}
          <div className='border border-gray-200 rounded-lg p-4'>
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
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Análise de Curto Prazo
            </h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Prazo do contrato:</span>
                <span className='font-medium'>
                  {exceptionAnalysis.short_term_criteria.lease_term_months} meses
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>É curto prazo (≤12 meses):</span>
                <span
                  className={`font-medium ${exceptionAnalysis.short_term_criteria.is_short_term ? 'text-green-600' : 'text-red-600'}`}
                >
                  {exceptionAnalysis.short_term_criteria.is_short_term ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Tem opção de compra:</span>
                <span
                  className={`font-medium ${exceptionAnalysis.short_term_criteria.has_purchase_option ? 'text-red-600' : 'text-green-600'}`}
                >
                  {exceptionAnalysis.short_term_criteria.has_purchase_option ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Probabilidade de renovação:</span>
                <span className='font-medium'>
                  {exceptionAnalysis.short_term_criteria.renewal_probability}%
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Qualifica à exceção:</span>
                <span
                  className={`font-medium ${exceptionAnalysis.short_term_criteria.meets_criteria ? 'text-green-600' : 'text-red-600'}`}
                >
                  {exceptionAnalysis.short_term_criteria.meets_criteria ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>

          {/* Low-value Asset Analysis */}
          <div className='border border-gray-200 rounded-lg p-4'>
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
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
              Análise de Baixo Valor
            </h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Valor justo do ativo:</span>
                <span className='font-medium'>
                  {formatCurrency(exceptionAnalysis.low_value_criteria.asset_fair_value)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Threshold de baixo valor:</span>
                <span className='font-medium'>
                  {formatCurrency(exceptionAnalysis.low_value_criteria.low_value_threshold)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Tipo de ativo:</span>
                <span className='font-medium capitalize'>
                  {exceptionAnalysis.low_value_criteria.asset_type.replace('_', ' ')}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>É baixo valor:</span>
                <span
                  className={`font-medium ${exceptionAnalysis.low_value_criteria.is_low_value ? 'text-green-600' : 'text-red-600'}`}
                >
                  {exceptionAnalysis.low_value_criteria.is_low_value ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Qualifica à exceção:</span>
                <span
                  className={`font-medium ${exceptionAnalysis.low_value_criteria.meets_criteria ? 'text-green-600' : 'text-red-600'}`}
                >
                  {exceptionAnalysis.low_value_criteria.meets_criteria ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accounting Treatment */}
        {exceptionAnalysis.accounting_treatment === 'simplified' && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <h4 className='font-medium text-green-900 mb-3 flex items-center'>
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Contabilização Simplificada Aplicável
            </h4>
            <div className='space-y-3 text-sm text-green-800'>
              <div>
                <span className='font-medium'>Reconhecimento de Despesa:</span>
                <p className='mt-1'>
                  {exceptionAnalysis.simplified_accounting.expense_recognition === 'straight_line'
                    ? 'Base linear ao longo do prazo do contrato'
                    : 'Base sistemática ao longo do prazo do contrato'}
                </p>
              </div>
              <div>
                <span className='font-medium'>Base de Mensuração:</span>
                <p className='mt-1'>{exceptionAnalysis.simplified_accounting.measurement_basis}</p>
              </div>
              <div>
                <span className='font-medium'>Requisitos de Divulgação:</span>
                <ul className='mt-1 list-disc list-inside space-y-1'>
                  {exceptionAnalysis.simplified_accounting.disclosure_requirements.map(
                    (req, index) => (
                      <li key={index}>{req}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Justification */}
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
          <h4 className='font-medium text-gray-900 mb-3 flex items-center'>
            <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            Justificativa da Classificação
          </h4>
          <p className='text-sm text-gray-700 leading-relaxed'>{exceptionAnalysis.justification}</p>
        </div>

        {/* Validation Results */}
        {validation && (
          <div
            className={`border rounded-lg p-4 ${
              validation.is_valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <h4
              className={`font-medium mb-3 flex items-center ${
                validation.is_valid ? 'text-green-900' : 'text-red-900'
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
              Validação dos Critérios
            </h4>

            {validation.validation_errors.length > 0 && (
              <div className='mb-3'>
                <span className='font-medium text-red-800'>Erros de Validação:</span>
                <ul className='mt-1 list-disc list-inside space-y-1 text-sm text-red-700'>
                  {validation.validation_errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.recommendations.length > 0 && (
              <div>
                <span className='font-medium text-blue-800'>Recomendações:</span>
                <ul className='mt-1 list-disc list-inside space-y-1 text-sm text-blue-700'>
                  {validation.recommendations.map((recommendation: string, index: number) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.is_valid && (
              <p className='text-sm text-green-700'>
                ✓ Critérios de exceção validados com sucesso. A classificação está correta.
              </p>
            )}
          </div>
        )}

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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
            <div>
              <span className='font-medium'>Data da Análise:</span>
              <p>
                {new Date(exceptionAnalysis.audit_trail.analysis_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <span className='font-medium'>Analisado por:</span>
              <p>{exceptionAnalysis.audit_trail.analyzed_by}</p>
            </div>
            <div>
              <span className='font-medium'>Revisão Necessária:</span>
              <p
                className={
                  exceptionAnalysis.audit_trail.review_required
                    ? 'text-orange-600'
                    : 'text-green-600'
                }
              >
                {exceptionAnalysis.audit_trail.review_required ? 'Sim' : 'Não'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
