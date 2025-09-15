/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { useState } from 'react';
import { ContractModificationFormData } from '@/lib/schemas/contract-modification';

interface ContractModificationFormProps {
  contractId: string;
  onSubmit: (data: ContractModificationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ContractModificationForm({
  contractId,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContractModificationFormProps) {
  const [formData, setFormData] = useState<Partial<ContractModificationFormData>>({
    modification_date: new Date().toISOString().split('T')[0],
    effective_date: new Date().toISOString().split('T')[0],
    status: 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ContractModificationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.modification_date) {
      newErrors.modification_date = 'Data da modificação é obrigatória';
    }
    if (!formData.effective_date) {
      newErrors.effective_date = 'Data de vigência é obrigatória';
    }
    if (!formData.modification_type) {
      newErrors.modification_type = 'Tipo de modificação é obrigatório';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    // Date consistency
    if (formData.modification_date && formData.effective_date) {
      const modDate = new Date(formData.modification_date);
      const effectiveDate = new Date(formData.effective_date);

      if (effectiveDate < modDate) {
        newErrors.effective_date =
          'Data de vigência deve ser posterior ou igual à data da modificação';
      }
    }

    // Type-specific validations
    if (
      formData.modification_type === 'term_extension' ||
      formData.modification_type === 'term_reduction'
    ) {
      if (!formData.new_term_months && !formData.term_change_months) {
        newErrors.term_fields = 'Informe o novo prazo ou a mudança no prazo';
      }
    }

    if (formData.modification_type === 'payment_change') {
      if (
        !formData.new_monthly_payment &&
        !formData.payment_change_amount &&
        !formData.payment_change_percentage
      ) {
        newErrors.payment_fields = 'Informe o novo valor, mudança absoluta ou percentual';
      }
    }

    if (formData.modification_type === 'rate_change') {
      if (
        !formData.new_discount_rate_annual &&
        !formData.rate_change_amount &&
        !formData.rate_change_percentage
      ) {
        newErrors.rate_fields = 'Informe a nova taxa, mudança absoluta ou percentual';
      }
    }

    if (formData.modification_type === 'termination') {
      if (!formData.termination_date) {
        newErrors.termination_date = 'Data de término é obrigatória para rescisão';
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

    onSubmit(formData as ContractModificationFormData);
  };

  const renderModificationFields = () => {
    switch (formData.modification_type) {
      case 'term_extension':
      case 'term_reduction':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Novo Prazo (meses)
              </label>
              <input
                type='number'
                min='1'
                value={formData.new_term_months || ''}
                onChange={e =>
                  handleInputChange('new_term_months', parseInt(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 48'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Mudança no Prazo (meses)
              </label>
              <input
                type='number'
                value={formData.term_change_months || ''}
                onChange={e =>
                  handleInputChange('term_change_months', parseInt(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: +12 ou -6'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Positivo para extensão, negativo para redução
              </p>
            </div>
          </div>
        );

      case 'payment_change':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Novo Pagamento Mensal
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.new_monthly_payment || ''}
                onChange={e =>
                  handleInputChange('new_monthly_payment', parseFloat(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 1200.00'
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mudança Absoluta
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={formData.payment_change_amount || ''}
                  onChange={e =>
                    handleInputChange(
                      'payment_change_amount',
                      parseFloat(e.target.value) || undefined
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Ex: +200 ou -100'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mudança Percentual (%)
                </label>
                <input
                  type='number'
                  min='-100'
                  max='100'
                  step='0.01'
                  value={formData.payment_change_percentage || ''}
                  onChange={e =>
                    handleInputChange(
                      'payment_change_percentage',
                      parseFloat(e.target.value) || undefined
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Ex: +10 ou -5'
                />
              </div>
            </div>
          </div>
        );

      case 'rate_change':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nova Taxa de Desconto Anual (%)
              </label>
              <input
                type='number'
                min='0'
                max='100'
                step='0.01'
                value={formData.new_discount_rate_annual || ''}
                onChange={e =>
                  handleInputChange(
                    'new_discount_rate_annual',
                    parseFloat(e.target.value) || undefined
                  )
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 9.5'
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mudança Absoluta (%)
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={formData.rate_change_amount || ''}
                  onChange={e =>
                    handleInputChange('rate_change_amount', parseFloat(e.target.value) || undefined)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Ex: +1.5 ou -0.5'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mudança Percentual (%)
                </label>
                <input
                  type='number'
                  min='-100'
                  max='100'
                  step='0.01'
                  value={formData.rate_change_percentage || ''}
                  onChange={e =>
                    handleInputChange(
                      'rate_change_percentage',
                      parseFloat(e.target.value) || undefined
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Ex: +10 ou -5'
                />
              </div>
            </div>
          </div>
        );

      case 'termination':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Data de Término *
              </label>
              <input
                type='date'
                value={formData.termination_date || ''}
                onChange={e => handleInputChange('termination_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.termination_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.termination_date && (
                <p className='text-red-500 text-sm mt-1'>{errors.termination_date}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Taxa de Rescisão
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.termination_fee || ''}
                onChange={e =>
                  handleInputChange('termination_fee', parseFloat(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 5000.00'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Motivo da Rescisão
              </label>
              <input
                type='text'
                value={formData.termination_reason || ''}
                onChange={e => handleInputChange('termination_reason', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: Mudança de estratégia empresarial'
              />
            </div>
          </div>
        );

      case 'renewal':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Prazo de Renovação (meses)
              </label>
              <input
                type='number'
                min='1'
                value={formData.renewal_term_months || ''}
                onChange={e =>
                  handleInputChange('renewal_term_months', parseInt(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 24'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Pagamento Mensal da Renovação
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.renewal_monthly_payment || ''}
                onChange={e =>
                  handleInputChange(
                    'renewal_monthly_payment',
                    parseFloat(e.target.value) || undefined
                  )
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 1100.00'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Taxa de Desconto da Renovação (%)
              </label>
              <input
                type='number'
                min='0'
                max='100'
                step='0.01'
                value={formData.renewal_discount_rate || ''}
                onChange={e =>
                  handleInputChange(
                    'renewal_discount_rate',
                    parseFloat(e.target.value) || undefined
                  )
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 9.0'
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Modificação de Contrato IFRS 16</h2>
        <p className='text-gray-600'>
          Registre modificações no contrato de leasing e calcule o impacto nos valores IFRS 16
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Informações Básicas</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Data da Modificação *
              </label>
              <input
                type='date'
                value={formData.modification_date || ''}
                onChange={e => handleInputChange('modification_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.modification_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.modification_date && (
                <p className='text-red-500 text-sm mt-1'>{errors.modification_date}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Data de Vigência *
              </label>
              <input
                type='date'
                value={formData.effective_date || ''}
                onChange={e => handleInputChange('effective_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.effective_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.effective_date && (
                <p className='text-red-500 text-sm mt-1'>{errors.effective_date}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Tipo de Modificação *
              </label>
              <select
                value={formData.modification_type || ''}
                onChange={e => handleInputChange('modification_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.modification_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value=''>Selecione o tipo</option>
                <option value='term_extension'>Extensão de Prazo</option>
                <option value='term_reduction'>Redução de Prazo</option>
                <option value='payment_change'>Mudança no Pagamento</option>
                <option value='rate_change'>Mudança na Taxa</option>
                <option value='asset_change'>Mudança no Ativo</option>
                <option value='termination'>Rescisão</option>
                <option value='renewal'>Renovação</option>
                <option value='other'>Outras</option>
              </select>
              {errors.modification_type && (
                <p className='text-red-500 text-sm mt-1'>{errors.modification_type}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
              <select
                value={formData.status || 'pending'}
                onChange={e => handleInputChange('status', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='pending'>Pendente</option>
                <option value='approved'>Aprovado</option>
                <option value='rejected'>Rejeitado</option>
                <option value='effective'>Efetivo</option>
                <option value='cancelled'>Cancelado</option>
              </select>
            </div>
          </div>

          <div className='mt-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Descrição *</label>
            <textarea
              value={formData.description || ''}
              onChange={e => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder='Descreva detalhadamente a modificação proposta...'
            />
            {errors.description && (
              <p className='text-red-500 text-sm mt-1'>{errors.description}</p>
            )}
          </div>
        </div>

        {/* Modification Specific Fields */}
        {formData.modification_type && (
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Detalhes da Modificação</h3>
            {renderModificationFields()}
            {errors.term_fields && (
              <p className='text-red-500 text-sm mt-2'>{errors.term_fields}</p>
            )}
            {errors.payment_fields && (
              <p className='text-red-500 text-sm mt-2'>{errors.payment_fields}</p>
            )}
            {errors.rate_fields && (
              <p className='text-red-500 text-sm mt-2'>{errors.rate_fields}</p>
            )}
          </div>
        )}

        {/* Financial Impact */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Impacto Financeiro</h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Taxa de Modificação
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.modification_fee || ''}
                onChange={e =>
                  handleInputChange('modification_fee', parseFloat(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 1000.00'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Custos Adicionais
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.additional_costs || ''}
                onChange={e =>
                  handleInputChange('additional_costs', parseFloat(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 500.00'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Incentivos Recebidos
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.incentives_received || ''}
                onChange={e =>
                  handleInputChange('incentives_received', parseFloat(e.target.value) || undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Ex: 200.00'
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Informações Adicionais</h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Observações</label>
              <textarea
                value={formData.notes || ''}
                onChange={e => handleInputChange('notes', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={3}
                placeholder='Observações adicionais sobre a modificação...'
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
            {isLoading ? 'Salvando...' : 'Salvar Modificação'}
          </button>
        </div>
      </form>
    </div>
  );
}
