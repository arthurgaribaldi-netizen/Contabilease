/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { useState } from 'react';

interface IFRS16LeaseFormProps {
  onSubmit: (data: IFRS16LeaseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<IFRS16LeaseFormData>;
}

export default function IFRS16LeaseForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
}: IFRS16LeaseFormProps) {
  const [formData, setFormData] = useState<Partial<IFRS16LeaseFormData>>({
    payment_frequency: 'monthly',
    payment_timing: 'end',
    status: 'draft',
    currency_code: 'BRL',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof IFRS16LeaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.lease_start_date) {
      newErrors.lease_start_date = 'Data de início é obrigatória';
    }
    if (!formData.lease_end_date) {
      newErrors.lease_end_date = 'Data de fim é obrigatória';
    }
    if (!formData.monthly_payment || formData.monthly_payment <= 0) {
      newErrors.monthly_payment = 'Pagamento mensal deve ser maior que zero';
    }
    if (!formData.lease_term_months || formData.lease_term_months <= 0) {
      newErrors.lease_term_months = 'Prazo deve ser maior que zero';
    }
    if (
      !formData.discount_rate_annual ||
      formData.discount_rate_annual < 0 ||
      formData.discount_rate_annual > 100
    ) {
      newErrors.discount_rate_annual = 'Taxa de desconto deve estar entre 0% e 100%';
    }

    // Date validation
    if (formData.lease_start_date && formData.lease_end_date) {
      const startDate = new Date(formData.lease_start_date);
      const endDate = new Date(formData.lease_end_date);
      if (endDate <= startDate) {
        newErrors.lease_end_date = 'Data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData as IFRS16LeaseFormData);
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Contrato de Leasing IFRS 16</h2>
        <p className='text-gray-600'>
          Preencha os dados do contrato de leasing para cálculos automáticos conforme IFRS 16
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Informações Básicas</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Título do Contrato *
              </label>
              <input
                type='text'
                value={formData.title || ''}
                onChange={e => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Ex: Leasing de Equipamento Industrial'
              />
              {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
              <select
                value={formData.status || 'draft'}
                onChange={e => handleInputChange('status', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='draft'>Rascunho</option>
                <option value='active'>Ativo</option>
                <option value='completed'>Concluído</option>
                <option value='cancelled'>Cancelado</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Moeda</label>
              <select
                value={formData.currency_code || 'BRL'}
                onChange={e => handleInputChange('currency_code', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='BRL'>BRL - Real Brasileiro</option>
                <option value='USD'>USD - Dólar Americano</option>
                <option value='EUR'>EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lease Terms */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Termos do Contrato</h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Data de Início *
              </label>
              <input
                type='date'
                value={formData.lease_start_date || ''}
                onChange={e => handleInputChange('lease_start_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lease_start_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lease_start_date && (
                <p className='text-red-500 text-sm mt-1'>{errors.lease_start_date}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Data de Fim *</label>
              <input
                type='date'
                value={formData.lease_end_date || ''}
                onChange={e => handleInputChange('lease_end_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lease_end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lease_end_date && (
                <p className='text-red-500 text-sm mt-1'>{errors.lease_end_date}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Prazo (meses) *
              </label>
              <input
                type='number'
                min='1'
                value={formData.lease_term_months || ''}
                onChange={e =>
                  handleInputChange('lease_term_months', parseInt(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lease_term_months ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='36'
              />
              {errors.lease_term_months && (
                <p className='text-red-500 text-sm mt-1'>{errors.lease_term_months}</p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Terms */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Termos Financeiros</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Pagamento Mensal *
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.monthly_payment || ''}
                onChange={e =>
                  handleInputChange('monthly_payment', parseFloat(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.monthly_payment ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='1000.00'
              />
              {errors.monthly_payment && (
                <p className='text-red-500 text-sm mt-1'>{errors.monthly_payment}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Pagamento Inicial
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.initial_payment || ''}
                onChange={e =>
                  handleInputChange('initial_payment', parseFloat(e.target.value) || 0)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='5000.00'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Taxa de Desconto Anual (%) *
              </label>
              <input
                type='number'
                min='0'
                max='100'
                step='0.01'
                value={formData.discount_rate_annual || ''}
                onChange={e =>
                  handleInputChange('discount_rate_annual', parseFloat(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.discount_rate_annual ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='8.50'
              />
              {errors.discount_rate_annual && (
                <p className='text-red-500 text-sm mt-1'>{errors.discount_rate_annual}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Momento do Pagamento
              </label>
              <select
                value={formData.payment_timing || 'end'}
                onChange={e => handleInputChange('payment_timing', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='end'>Final do Período</option>
                <option value='beginning'>Início do Período</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Informações Adicionais</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Valor Justo do Ativo
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.asset_fair_value || ''}
                onChange={e =>
                  handleInputChange('asset_fair_value', parseFloat(e.target.value) || 0)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='50000.00'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Valor Residual Garantido
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.guaranteed_residual_value || ''}
                onChange={e =>
                  handleInputChange('guaranteed_residual_value', parseFloat(e.target.value) || 0)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='10000.00'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Custos Diretos Iniciais
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.initial_direct_costs || ''}
                onChange={e =>
                  handleInputChange('initial_direct_costs', parseFloat(e.target.value) || 0)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='1000.00'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Incentivos de Leasing
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.lease_incentives || ''}
                onChange={e =>
                  handleInputChange('lease_incentives', parseFloat(e.target.value) || 0)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='500.00'
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex justify-end space-x-4 pt-6 border-t'>
          <button
            type='button'
            onClick={onCancel}
            className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500'
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={isLoading}
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Salvando...' : 'Salvar Contrato'}
          </button>
        </div>
      </form>
    </div>
  );
}
