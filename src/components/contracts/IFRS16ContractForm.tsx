/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary IFRS 16 contract form components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { logger } from '@/lib/logger';
import {
  IFRS16CalculationResult,
  IFRS16LeaseFormData,
  ifrs16LeaseSchema,
} from '@/lib/schemas/ifrs16-lease';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import AmortizationScheduleTable from './AmortizationScheduleTable';
import FinancialValidationPanel from './FinancialValidationPanel';

interface IFRS16ContractFormProps {
  contract?: Partial<IFRS16LeaseFormData>;
  onSubmit: (data: IFRS16LeaseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface CalculationPreview {
  lease_liability_initial: number;
  right_of_use_asset_initial: number;
  monthly_interest_expense: number;
  monthly_principal_payment: number;
  monthly_amortization: number;
  total_lease_payments: number;
  effective_interest_rate_annual: number;
  isValid: boolean;
  errors: string[];
}

export default function IFRS16ContractForm({
  contract,
  onSubmit,
  onCancel,
  isLoading = false,
}: IFRS16ContractFormProps) {
  const [formData, setFormData] = useState<IFRS16LeaseFormData>({
    title: contract?.title || '',
    status: contract?.status || 'draft',
    currency_code: contract?.currency_code || 'BRL',
    lease_start_date: contract?.lease_start_date || '',
    lease_end_date: contract?.lease_end_date || '',
    lease_term_months: contract?.lease_term_months || 12,
    initial_payment: contract?.initial_payment || 0,
    monthly_payment: contract?.monthly_payment || 0,
    annual_payment: contract?.annual_payment || 0,
    payment_frequency: contract?.payment_frequency || 'monthly',
    discount_rate_annual: contract?.discount_rate_annual || 0,
    discount_rate_monthly: contract?.discount_rate_monthly || 0,
    asset_fair_value: contract?.asset_fair_value || 0,
    asset_residual_value: contract?.asset_residual_value || 0,
    initial_direct_costs: contract?.initial_direct_costs || 0,
    lease_incentives: contract?.lease_incentives || 0,
    payment_timing: contract?.payment_timing || 'end',
    lease_classification: contract?.lease_classification || 'operating',
    escalation_rate: contract?.escalation_rate || 0,
    variable_payments: contract?.variable_payments || [],
    guaranteed_residual_value: contract?.guaranteed_residual_value || 0,
    purchase_option_price: contract?.purchase_option_price || 0,
    purchase_option_exercisable: contract?.purchase_option_exercisable || false,
    renewal_options: contract?.renewal_options || [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [calculationPreview, setCalculationPreview] = useState<CalculationPreview | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);
  const [fullCalculationResult, setFullCalculationResult] =
    useState<IFRS16CalculationResult | null>(null);

  const calculatePreview = useCallback(() => {
    try {
      // Validate required fields for calculation
      if (
        !formData.lease_start_date ||
        !formData.lease_end_date ||
        !formData.monthly_payment ||
        !formData.lease_term_months
      ) {
        setCalculationPreview(null);
        return;
      }

      // Create calculation engine
      const engine = new IFRS16CalculationEngine(formData);

      // Validate lease data
      const validation = engine.validateLeaseData();

      if (!validation.isValid) {
        setCalculationPreview({
          lease_liability_initial: 0,
          right_of_use_asset_initial: 0,
          monthly_interest_expense: 0,
          monthly_principal_payment: 0,
          monthly_amortization: 0,
          total_lease_payments: 0,
          effective_interest_rate_annual: 0,
          isValid: false,
          errors: validation.errors,
        });
        return;
      }

      // Perform calculations
      const results = engine.calculateAll();

      setCalculationPreview({
        lease_liability_initial: results.lease_liability_initial,
        right_of_use_asset_initial: results.right_of_use_asset_initial,
        monthly_interest_expense: results.monthly_interest_expense,
        monthly_principal_payment: results.monthly_principal_payment,
        monthly_amortization: results.monthly_amortization,
        total_lease_payments: results.total_lease_payments,
        effective_interest_rate_annual: results.effective_interest_rate_annual,
        isValid: true,
        errors: [],
      });

      // Store full calculation result for amortization table
      setFullCalculationResult(results);
    } catch (error) {
      logger.error(
        'Calculation error:',
        {
          component: 'ifrs16contractform',
          operation: 'calculateValues',
        },
        error as Error
      );
      setCalculationPreview({
        lease_liability_initial: 0,
        right_of_use_asset_initial: 0,
        monthly_interest_expense: 0,
        monthly_principal_payment: 0,
        monthly_amortization: 0,
        total_lease_payments: 0,
        effective_interest_rate_annual: 0,
        isValid: false,
        errors: ['Erro ao calcular preview'],
      });
    }
  }, [formData]);

  // Calculate preview whenever form data changes
  useEffect(() => {
    calculatePreview();
  }, [calculatePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = ifrs16LeaseSchema.parse(formData);
      setErrors({});
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        logger.error(
          'Error submitting form:',
          {
            component: 'ifrs16contractform',
            operation: 'submitForm',
          },
          error as Error
        );
      }
    }
  };

  const handleChange = (field: keyof IFRS16LeaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-calculate lease term if dates are provided
    if (field === 'lease_start_date' || field === 'lease_end_date') {
      if (formData.lease_start_date && formData.lease_end_date) {
        const startDate = new Date(formData.lease_start_date);
        const endDate = new Date(formData.lease_end_date);
        const monthsDiff =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth());
        if (monthsDiff > 0) {
          setFormData(prev => ({ ...prev, lease_term_months: monthsDiff }));
        }
      }
    }

    // Auto-calculate monthly payment from annual if frequency is annual
    if (field === 'annual_payment' && formData.payment_frequency === 'annual') {
      setFormData(prev => ({ ...prev, monthly_payment: value / 12 }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: formData.currency_code || 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(4)}%`;
  };

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Form Section */}
        <div className='space-y-6'>
          <div className='bg-white shadow rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>Informações do Contrato</h2>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-800'>Informações Básicas</h3>

                <div>
                  <label htmlFor='title' className='block text-sm font-medium text-gray-700'>
                    Título do Contrato *
                  </label>
                  <input
                    type='text'
                    id='title'
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.title ? 'border-red-300' : ''
                    }`}
                    placeholder='Ex: Contrato de Leasing - Veículo ABC123'
                    disabled={isLoading}
                  />
                  {errors.title && <p className='mt-1 text-sm text-red-600'>{errors.title}</p>}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='status' className='block text-sm font-medium text-gray-700'>
                      Status
                    </label>
                    <select
                      id='status'
                      value={formData.status}
                      onChange={e => handleChange('status', e.target.value)}
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                      disabled={isLoading}
                    >
                      <option value='draft'>Rascunho</option>
                      <option value='active'>Ativo</option>
                      <option value='completed'>Concluído</option>
                      <option value='cancelled'>Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor='currency_code'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Moeda *
                    </label>
                    <input
                      type='text'
                      id='currency_code'
                      value={formData.currency_code}
                      onChange={e => handleChange('currency_code', e.target.value.toUpperCase())}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors.currency_code ? 'border-red-300' : ''
                      }`}
                      placeholder='BRL'
                      maxLength={3}
                      disabled={isLoading}
                    />
                    {errors.currency_code && (
                      <p className='mt-1 text-sm text-red-600'>{errors.currency_code}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lease Terms */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-800'>Termos do Contrato</h3>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='lease_start_date'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Data de Início *
                    </label>
                    <input
                      type='date'
                      id='lease_start_date'
                      value={formData.lease_start_date}
                      onChange={e => handleChange('lease_start_date', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors.lease_start_date ? 'border-red-300' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.lease_start_date && (
                      <p className='mt-1 text-sm text-red-600'>{errors.lease_start_date}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='lease_end_date'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Data de Fim *
                    </label>
                    <input
                      type='date'
                      id='lease_end_date'
                      value={formData.lease_end_date}
                      onChange={e => handleChange('lease_end_date', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors.lease_end_date ? 'border-red-300' : ''
                      }`}
                      disabled={isLoading}
                    />
                    {errors.lease_end_date && (
                      <p className='mt-1 text-sm text-red-600'>{errors.lease_end_date}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='lease_term_months'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Prazo (meses) *
                    </label>
                    <input
                      type='number'
                      id='lease_term_months'
                      value={formData.lease_term_months}
                      onChange={e =>
                        handleChange('lease_term_months', parseInt(e.target.value) || 0)
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors.lease_term_months ? 'border-red-300' : ''
                      }`}
                      min='1'
                      max='600'
                      disabled={isLoading}
                    />
                    {errors.lease_term_months && (
                      <p className='mt-1 text-sm text-red-600'>{errors.lease_term_months}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='payment_frequency'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Frequência de Pagamento *
                    </label>
                    <select
                      id='payment_frequency'
                      value={formData.payment_frequency}
                      onChange={e => handleChange('payment_frequency', e.target.value)}
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                      disabled={isLoading}
                    >
                      <option value='monthly'>Mensal</option>
                      <option value='quarterly'>Trimestral</option>
                      <option value='semi-annual'>Semestral</option>
                      <option value='annual'>Anual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Terms */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-800'>Termos Financeiros</h3>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='monthly_payment'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Pagamento Mensal *
                    </label>
                    <input
                      type='number'
                      id='monthly_payment'
                      value={formData.monthly_payment}
                      onChange={e =>
                        handleChange('monthly_payment', parseFloat(e.target.value) || 0)
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors.monthly_payment ? 'border-red-300' : ''
                      }`}
                      min='0'
                      step='0.01'
                      disabled={isLoading}
                    />
                    {errors.monthly_payment && (
                      <p className='mt-1 text-sm text-red-600'>{errors.monthly_payment}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='discount_rate_annual'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Taxa de Desconto Anual (%) *
                    </label>
                    <input
                      type='number'
                      id='discount_rate_annual'
                      value={formData.discount_rate_annual}
                      onChange={e =>
                        handleChange('discount_rate_annual', parseFloat(e.target.value) || 0)
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors.discount_rate_annual ? 'border-red-300' : ''
                      }`}
                      min='0'
                      max='100'
                      step='0.01'
                      disabled={isLoading}
                    />
                    {errors.discount_rate_annual && (
                      <p className='mt-1 text-sm text-red-600'>{errors.discount_rate_annual}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='initial_payment'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Pagamento Inicial
                    </label>
                    <input
                      type='number'
                      id='initial_payment'
                      value={formData.initial_payment}
                      onChange={e =>
                        handleChange('initial_payment', parseFloat(e.target.value) || 0)
                      }
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                      min='0'
                      step='0.01'
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='payment_timing'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Momento do Pagamento
                    </label>
                    <select
                      id='payment_timing'
                      value={formData.payment_timing}
                      onChange={e => handleChange('payment_timing', e.target.value)}
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                      disabled={isLoading}
                    >
                      <option value='end'>Final do Período</option>
                      <option value='beginning'>Início do Período</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Fields Toggle */}
              <div className='border-t pt-4'>
                <button
                  type='button'
                  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                  className='text-blue-600 hover:text-blue-800 font-medium'
                  disabled={isLoading}
                >
                  {showAdvancedFields ? 'Ocultar' : 'Mostrar'} Campos Avançados
                </button>
              </div>

              {/* Advanced Fields */}
              {showAdvancedFields && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium text-gray-800'>Campos Avançados</h3>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='asset_fair_value'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Valor Justo do Ativo
                      </label>
                      <input
                        type='number'
                        id='asset_fair_value'
                        value={formData.asset_fair_value}
                        onChange={e =>
                          handleChange('asset_fair_value', parseFloat(e.target.value) || 0)
                        }
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                        min='0'
                        step='0.01'
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='guaranteed_residual_value'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Valor Residual Garantido
                      </label>
                      <input
                        type='number'
                        id='guaranteed_residual_value'
                        value={formData.guaranteed_residual_value}
                        onChange={e =>
                          handleChange('guaranteed_residual_value', parseFloat(e.target.value) || 0)
                        }
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                        min='0'
                        step='0.01'
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='initial_direct_costs'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Custos Diretos Iniciais
                      </label>
                      <input
                        type='number'
                        id='initial_direct_costs'
                        value={formData.initial_direct_costs}
                        onChange={e =>
                          handleChange('initial_direct_costs', parseFloat(e.target.value) || 0)
                        }
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                        min='0'
                        step='0.01'
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='lease_incentives'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Incentivos de Leasing
                      </label>
                      <input
                        type='number'
                        id='lease_incentives'
                        value={formData.lease_incentives}
                        onChange={e =>
                          handleChange('lease_incentives', parseFloat(e.target.value) || 0)
                        }
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                        min='0'
                        step='0.01'
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='purchase_option_price'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Preço da Opção de Compra
                      </label>
                      <input
                        type='number'
                        id='purchase_option_price'
                        value={formData.purchase_option_price}
                        onChange={e =>
                          handleChange('purchase_option_price', parseFloat(e.target.value) || 0)
                        }
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                        min='0'
                        step='0.01'
                        disabled={isLoading}
                      />
                    </div>

                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='purchase_option_exercisable'
                        checked={formData.purchase_option_exercisable}
                        onChange={e =>
                          handleChange('purchase_option_exercisable', e.target.checked)
                        }
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                        disabled={isLoading}
                      />
                      <label
                        htmlFor='purchase_option_exercisable'
                        className='ml-2 block text-sm text-gray-900'
                      >
                        Opção de Compra Exercível
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className='flex justify-end space-x-3 pt-6 border-t'>
                <button
                  type='button'
                  onClick={onCancel}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={isLoading || !calculationPreview?.isValid}
                >
                  {isLoading ? 'Salvando...' : contract ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Calculation Preview Section */}
        <div className='space-y-6'>
          <div className='bg-white shadow rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
              Preview dos Cálculos IFRS 16
            </h2>

            {calculationPreview ? (
              <div className='space-y-6'>
                {/* Validation Status */}
                <div
                  className={`p-4 rounded-md ${
                    calculationPreview.isValid
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className='flex'>
                    <div
                      className={`flex-shrink-0 ${
                        calculationPreview.isValid ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {calculationPreview.isValid ? (
                        <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      ) : (
                        <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </div>
                    <div className='ml-3'>
                      <h3
                        className={`text-sm font-medium ${
                          calculationPreview.isValid ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {calculationPreview.isValid ? 'Cálculos Válidos' : 'Erros de Validação'}
                      </h3>
                      {calculationPreview.errors.length > 0 && (
                        <div className='mt-2 text-sm text-red-700'>
                          <ul className='list-disc pl-5 space-y-1'>
                            {calculationPreview.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className='grid grid-cols-1 gap-4'>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Métricas Principais</h3>

                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Passivo de Leasing Inicial:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {formatCurrency(calculationPreview.lease_liability_initial)}
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Ativo de Uso Inicial:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {formatCurrency(calculationPreview.right_of_use_asset_initial)}
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Total de Pagamentos:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {formatCurrency(calculationPreview.total_lease_payments)}
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Taxa Efetiva Anual:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {formatPercentage(calculationPreview.effective_interest_rate_annual)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Cálculos Mensais</h3>

                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Juros Mensais:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {formatCurrency(calculationPreview.monthly_interest_expense)}
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Principal Mensal:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {formatCurrency(calculationPreview.monthly_principal_payment)}
                        </span>
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Amortização Mensal:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {formatCurrency(calculationPreview.monthly_amortization)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='text-lg font-medium text-blue-900 mb-2'>Resumo do Contrato</h3>
                  <div className='text-sm text-blue-800'>
                    <p>
                      <strong>Prazo:</strong> {formData.lease_term_months} meses
                    </p>
                    <p>
                      <strong>Pagamento Mensal:</strong> {formatCurrency(formData.monthly_payment)}
                    </p>
                    <p>
                      <strong>Taxa de Desconto:</strong> {formData.discount_rate_annual}% a.a.
                    </p>
                    <p>
                      <strong>Classificação:</strong>{' '}
                      {formData.lease_classification === 'operating' ? 'Operacional' : 'Financeiro'}
                    </p>
                  </div>
                </div>

                {/* Financial Validation Panel */}
                <FinancialValidationPanel
                  formData={formData}
                  currencyCode={formData.currency_code}
                />

                {/* Amortization Table Toggle */}
                {fullCalculationResult && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex justify-between items-center'>
                      <h3 className='text-lg font-medium text-gray-900'>
                        Tabela de Amortização Completa
                      </h3>
                      <button
                        type='button'
                        onClick={() => setShowAmortizationTable(!showAmortizationTable)}
                        className='px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      >
                        {showAmortizationTable ? 'Ocultar' : 'Mostrar'} Tabela
                      </button>
                    </div>
                    {showAmortizationTable && (
                      <div className='mt-4'>
                        <AmortizationScheduleTable
                          calculationResult={fullCalculationResult}
                          currencyCode={formData.currency_code}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
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
                      d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Preview dos Cálculos</h3>
                <p className='text-sm text-gray-500'>
                  Preencha os campos obrigatórios para ver o preview dos cálculos IFRS 16
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
