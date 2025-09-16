/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { Contract } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { contractSchema, type ContractFormData } from '@/lib/schemas/contract';
import { useState } from 'react';
import { z } from 'zod';
import ContractWizard from './ContractWizard';

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: ContractFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  useWizard?: boolean;
}

export default function ContractForm({
  contract,
  onSubmit,
  onCancel,
  isLoading = false,
  useWizard = true,
}: ContractFormProps) {
  // Use wizard for new contracts or when explicitly requested
  if (useWizard && !contract) {
    return (
      <ContractWizard
        contract={contract}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    );
  }
  const [formData, setFormData] = useState({
    title: contract?.title ?? '',
    status: contract?.status ?? 'draft',
    currency_code: contract?.currency_code ?? '',
    contract_value: contract?.contract_value?.toString() ?? '',
    contract_term_months: contract?.contract_term_months?.toString() ?? '',
    implicit_interest_rate: contract?.implicit_interest_rate?.toString() ?? '',
    guaranteed_residual_value: contract?.guaranteed_residual_value?.toString() ?? '',
    purchase_option_price: contract?.purchase_option_price?.toString() ?? '',
    purchase_option_exercise_date: contract?.purchase_option_exercise_date ?? '',
    lease_start_date: contract?.lease_start_date ?? '',
    lease_end_date: contract?.lease_end_date ?? '',
    payment_frequency: contract?.payment_frequency ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for validation
      const dataToValidate = {
        title: formData.title.trim(),
        status: formData.status as 'draft' | 'active' | 'completed' | 'cancelled',
        currency_code: formData.currency_code || undefined,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : undefined,
        contract_term_months: formData.contract_term_months
          ? parseInt(formData.contract_term_months)
          : undefined,
        implicit_interest_rate: formData.implicit_interest_rate
          ? parseFloat(formData.implicit_interest_rate)
          : undefined,
        guaranteed_residual_value: formData.guaranteed_residual_value
          ? parseFloat(formData.guaranteed_residual_value)
          : undefined,
        purchase_option_price: formData.purchase_option_price
          ? parseFloat(formData.purchase_option_price)
          : undefined,
        purchase_option_exercise_date: formData.purchase_option_exercise_date || undefined,
        lease_start_date: formData.lease_start_date || undefined,
        lease_end_date: formData.lease_end_date || undefined,
        payment_frequency:
          (formData.payment_frequency as 'monthly' | 'quarterly' | 'semi-annual' | 'annual') ||
          undefined,
      };

      const validatedData = contractSchema.parse(dataToValidate);
      setErrors({});

      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues?.forEach(issue => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      } else {
        logger.error(
          'Error submitting form:',
          {
            component: 'contractform',
            operation: 'submitForm',
          },
          error as Error
        );
        setErrors({ general: 'Erro inesperado. Tente novamente.' });
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 fade-in'>
      <div className='space-y-2'>
        <label htmlFor='title' className='label'>
          Título do Contrato *
        </label>
        <input
          type='text'
          id='title'
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          className={`input ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          placeholder='Ex: Contrato de Leasing - Veículo ABC123'
          disabled={isLoading}
        />
        {errors.title && (
          <p className='text-sm text-red-600 flex items-center gap-1'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            {errors.title}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <label htmlFor='status' className='label'>
          Status
        </label>
        <select
          id='status'
          value={formData.status}
          onChange={e => handleChange('status', e.target.value)}
          className='input'
          disabled={isLoading}
        >
          <option value='draft'>Rascunho</option>
          <option value='active'>Ativo</option>
          <option value='completed'>Concluído</option>
          <option value='cancelled'>Cancelado</option>
        </select>
      </div>

      <div>
        <label htmlFor='currency_code' className='block text-sm font-medium text-gray-700'>
          Moeda
        </label>
        <input
          type='text'
          id='currency_code'
          value={formData.currency_code}
          onChange={e => handleChange('currency_code', e.target.value.toUpperCase())}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.currency_code ? 'border-red-300' : ''
          }`}
          placeholder='Ex: BRL, USD, EUR'
          maxLength={3}
          disabled={isLoading}
        />
        {errors.currency_code && (
          <p className='mt-1 text-sm text-red-600'>{errors.currency_code}</p>
        )}
        <p className='mt-1 text-sm text-gray-500'>Código ISO da moeda (opcional, 3 caracteres)</p>
      </div>

      {/* Financial Fields Section */}
      <div className='border-t pt-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>Campos Financeiros IFRS 16</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='contract_value' className='block text-sm font-medium text-gray-700'>
              Valor do Contrato
            </label>
            <input
              type='number'
              id='contract_value'
              value={formData.contract_value}
              onChange={e => handleChange('contract_value', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.contract_value ? 'border-red-300' : ''
              }`}
              placeholder='0.00'
              step='0.01'
              min='0'
              disabled={isLoading}
            />
            {errors.contract_value && (
              <p className='mt-1 text-sm text-red-600'>{errors.contract_value}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='contract_term_months'
              className='block text-sm font-medium text-gray-700'
            >
              Prazo (meses)
            </label>
            <input
              type='number'
              id='contract_term_months'
              value={formData.contract_term_months}
              onChange={e => handleChange('contract_term_months', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.contract_term_months ? 'border-red-300' : ''
              }`}
              placeholder='12'
              min='1'
              max='600'
              disabled={isLoading}
            />
            {errors.contract_term_months && (
              <p className='mt-1 text-sm text-red-600'>{errors.contract_term_months}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='implicit_interest_rate'
              className='block text-sm font-medium text-gray-700'
            >
              Taxa de Juros Implícita (%)
            </label>
            <input
              type='number'
              id='implicit_interest_rate'
              value={formData.implicit_interest_rate}
              onChange={e => handleChange('implicit_interest_rate', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.implicit_interest_rate ? 'border-red-300' : ''
              }`}
              placeholder='5.00'
              step='0.01'
              min='0'
              max='100'
              disabled={isLoading}
            />
            {errors.implicit_interest_rate && (
              <p className='mt-1 text-sm text-red-600'>{errors.implicit_interest_rate}</p>
            )}
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
              onChange={e => handleChange('guaranteed_residual_value', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.guaranteed_residual_value ? 'border-red-300' : ''
              }`}
              placeholder='0.00'
              step='0.01'
              min='0'
              disabled={isLoading}
            />
            {errors.guaranteed_residual_value && (
              <p className='mt-1 text-sm text-red-600'>{errors.guaranteed_residual_value}</p>
            )}
          </div>

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
              onChange={e => handleChange('purchase_option_price', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.purchase_option_price ? 'border-red-300' : ''
              }`}
              placeholder='0.00'
              step='0.01'
              min='0'
              disabled={isLoading}
            />
            {errors.purchase_option_price && (
              <p className='mt-1 text-sm text-red-600'>{errors.purchase_option_price}</p>
            )}
          </div>

          <div>
            <label htmlFor='payment_frequency' className='block text-sm font-medium text-gray-700'>
              Frequência de Pagamento
            </label>
            <select
              id='payment_frequency'
              value={formData.payment_frequency}
              onChange={e => handleChange('payment_frequency', e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
              disabled={isLoading}
            >
              <option value=''>Selecione...</option>
              <option value='monthly'>Mensal</option>
              <option value='quarterly'>Trimestral</option>
              <option value='semi-annual'>Semestral</option>
              <option value='annual'>Anual</option>
            </select>
            {errors.payment_frequency && (
              <p className='mt-1 text-sm text-red-600'>{errors.payment_frequency}</p>
            )}
          </div>
        </div>

        {/* Date Fields */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
          <div>
            <label htmlFor='lease_start_date' className='block text-sm font-medium text-gray-700'>
              Data de Início do Leasing
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
            <label htmlFor='lease_end_date' className='block text-sm font-medium text-gray-700'>
              Data de Fim do Leasing
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

          <div>
            <label
              htmlFor='purchase_option_exercise_date'
              className='block text-sm font-medium text-gray-700'
            >
              Data de Exercício da Opção de Compra
            </label>
            <input
              type='date'
              id='purchase_option_exercise_date'
              value={formData.purchase_option_exercise_date}
              onChange={e => handleChange('purchase_option_exercise_date', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.purchase_option_exercise_date ? 'border-red-300' : ''
              }`}
              disabled={isLoading}
            />
            {errors.purchase_option_exercise_date && (
              <p className='mt-1 text-sm text-red-600'>{errors.purchase_option_exercise_date}</p>
            )}
          </div>
        </div>
      </div>

      <div className='flex justify-end space-x-3'>
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
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : contract ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}
