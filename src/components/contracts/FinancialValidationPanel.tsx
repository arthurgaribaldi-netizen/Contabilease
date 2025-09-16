/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { CONTRACT_LIMITS } from '@/lib/constants/validation-limits';
import { logger } from '@/lib/logger';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { useCallback, useEffect, useState } from 'react';

interface FinancialValidationPanelProps {
  formData: IFRS16LeaseFormData;
  currencyCode?: string;
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (data: IFRS16LeaseFormData, engine: IFRS16CalculationEngine) => boolean;
  message: string;
}

const validationRules: ValidationRule[] = [
  {
    id: 'lease_term_reasonable',
    name: 'Prazo do Contrato',
    description: 'Verifica se o prazo do contrato está dentro de limites razoáveis',
    severity: 'warning',
    check: data =>
      data.lease_term_months >= CONTRACT_LIMITS.TERM_TYPICAL_MIN_MONTHS &&
      data.lease_term_months <= CONTRACT_LIMITS.TERM_TYPICAL_MAX_MONTHS,
    message: 'Prazo deve estar entre 12 e 120 meses para contratos típicos',
  },
  {
    id: 'discount_rate_reasonable',
    name: 'Taxa de Desconto',
    description: 'Verifica se a taxa de desconto está dentro de limites de mercado',
    severity: 'warning',
    check: data =>
      data.discount_rate_annual >= CONTRACT_LIMITS.DISCOUNT_RATE_TYPICAL_MIN &&
      data.discount_rate_annual <= CONTRACT_LIMITS.DISCOUNT_RATE_TYPICAL_MAX,
    message: 'Taxa de desconto deve estar entre 1% e 25% a.a.',
  },
  {
    id: 'payment_amount_reasonable',
    name: 'Valor do Pagamento',
    description: 'Verifica se o valor do pagamento mensal é razoável',
    severity: 'warning',
    check: data =>
      data.monthly_payment > CONTRACT_LIMITS.PAYMENT_MIN &&
      data.monthly_payment <= CONTRACT_LIMITS.PAYMENT_MAX_REASONABLE,
    message: 'Pagamento mensal deve ser positivo e menor que R$ 1.000.000',
  },
  {
    id: 'residual_value_reasonable',
    name: 'Valor Residual',
    description: 'Verifica se o valor residual está dentro de limites razoáveis',
    severity: 'warning',
    check: data => {
      if (!data.guaranteed_residual_value) return true;
      const totalPayments = data.monthly_payment * data.lease_term_months;
      return (
        data.guaranteed_residual_value <= totalPayments * CONTRACT_LIMITS.RESIDUAL_VALUE_MAX_RATIO
      );
    },
    message: 'Valor residual não deve exceder 30% do total de pagamentos',
  },
  {
    id: 'purchase_option_reasonable',
    name: 'Opção de Compra',
    description: 'Verifica se o preço da opção de compra é razoável',
    severity: 'warning',
    check: data => {
      if (!data.purchase_option_price) return true;
      const totalPayments = data.monthly_payment * data.lease_term_months;
      return (
        data.purchase_option_price <= totalPayments * CONTRACT_LIMITS.PURCHASE_OPTION_MAX_RATIO
      );
    },
    message: 'Preço da opção de compra não deve exceder 50% do total de pagamentos',
  },
  {
    id: 'lease_classification_check',
    name: 'Classificação do Contrato',
    description: 'Verifica se a classificação do contrato está correta',
    severity: 'info',
    check: data => {
      if (!data.lease_classification) return true;
      // Simple heuristic: if purchase option is exercisable and price is low, likely finance lease
      if (data.purchase_option_exercisable && data.purchase_option_price) {
        const totalPayments = data.monthly_payment * data.lease_term_months;
        const purchaseRatio = data.purchase_option_price / totalPayments;
        return purchaseRatio < CONTRACT_LIMITS.PURCHASE_OPTION_FINANCE_LEASE_RATIO; // Less than 10% suggests finance lease
      }
      return true;
    },
    message: 'Contrato com opção de compra baixa pode ser classificado como leasing financeiro',
  },
  {
    id: 'date_consistency',
    name: 'Consistência de Datas',
    description: 'Verifica se as datas estão consistentes',
    severity: 'error',
    check: data => {
      if (!data.lease_start_date || !data.lease_end_date) return false;
      const startDate = new Date(data.lease_start_date);
      const endDate = new Date(data.lease_end_date);
      return endDate > startDate;
    },
    message: 'Data de fim deve ser posterior à data de início',
  },
  {
    id: 'term_date_consistency',
    name: 'Consistência Prazo-Datas',
    description: 'Verifica se o prazo em meses corresponde às datas',
    severity: 'warning',
    check: data => {
      if (!data.lease_start_date || !data.lease_end_date) return true;
      const startDate = new Date(data.lease_start_date);
      const endDate = new Date(data.lease_end_date);
      const calculatedMonths =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      return (
        Math.abs(calculatedMonths - data.lease_term_months) <= CONTRACT_LIMITS.TITLE_MIN_LENGTH
      );
    },
    message: 'Prazo em meses deve corresponder aproximadamente às datas informadas',
  },
];

export default function FinancialValidationPanel({
  formData,
  currencyCode: _currencyCode = 'BRL',
}: FinancialValidationPanelProps) {
  const [validationResults, setValidationResults] = useState<
    Array<{
      rule: ValidationRule;
      passed: boolean;
      message: string;
    }>
  >([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateFormData = useCallback(async () => {
    setIsValidating(true);

    try {
      // Create calculation engine for validation
      const engine = new IFRS16CalculationEngine(formData);

      const results = validationRules.map(rule => {
        const passed = rule.check(formData, engine);
        return {
          rule,
          passed,
          message: passed ? 'Validação aprovada' : rule.message,
        };
      });

      setValidationResults(results);
    } catch (error) {
      logger.error('Validation error:', error);
      setValidationResults([]);
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  useEffect(() => {
    validateFormData();
  }, [validateFormData]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string, passed: boolean) => {
    if (passed) {
      return (
        <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
            clipRule='evenodd'
          />
        </svg>
      );
    }

    switch (severity) {
      case 'error':
        return (
          <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className='h-5 w-5 text-yellow-400' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'info':
        return (
          <svg className='h-5 w-5 text-blue-400' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const errorCount = validationResults.filter(r => !r.passed && r.rule.severity === 'error').length;
  const warningCount = validationResults.filter(
    r => !r.passed && r.rule.severity === 'warning'
  ).length;
  const infoCount = validationResults.filter(r => !r.passed && r.rule.severity === 'info').length;

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>Validações Financeiras</h3>
          {isValidating && (
            <div className='flex items-center text-sm text-gray-500'>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Validando...
            </div>
          )}
        </div>

        {/* Summary */}
        <div className='mt-4 grid grid-cols-3 gap-4'>
          <div
            className={`p-3 rounded-lg border ${errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
          >
            <div className='text-sm font-medium text-gray-900'>Erros</div>
            <div
              className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {errorCount}
            </div>
          </div>
          <div
            className={`p-3 rounded-lg border ${warningCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}
          >
            <div className='text-sm font-medium text-gray-900'>Avisos</div>
            <div
              className={`text-2xl font-bold ${warningCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}
            >
              {warningCount}
            </div>
          </div>
          <div
            className={`p-3 rounded-lg border ${infoCount > 0 ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}
          >
            <div className='text-sm font-medium text-gray-900'>Informações</div>
            <div
              className={`text-2xl font-bold ${infoCount > 0 ? 'text-blue-600' : 'text-green-600'}`}
            >
              {infoCount}
            </div>
          </div>
        </div>
      </div>

      <div className='px-6 py-4'>
        <div className='space-y-3'>
          {validationResults.map(result => (
            <div
              key={result.rule.id}
              className={`p-4 rounded-lg border ${getSeverityColor(result.rule.severity)}`}
            >
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  {getSeverityIcon(result.rule.severity, result.passed)}
                </div>
                <div className='ml-3 flex-1'>
                  <h4 className='text-sm font-medium'>{result.rule.name}</h4>
                  <p className='mt-1 text-sm'>{result.message}</p>
                  <p className='mt-1 text-xs opacity-75'>{result.rule.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {validationResults.length === 0 && !isValidating && (
          <div className='text-center py-8'>
            <div className='text-gray-400 mb-4'>
              <svg
                className='mx-auto h-12 w-12'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Nenhuma Validação Disponível</h3>
            <p className='text-sm text-gray-500'>
              Preencha os campos obrigatórios para executar as validações financeiras
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
