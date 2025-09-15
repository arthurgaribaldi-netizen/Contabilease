'use client';

import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { logger } from '@/lib/logger';
import {
  ContractModificationValidationSchema,
  type ContractModification,
  type ContractModificationValidation,
} from '@/lib/schemas/ifrs16-complete';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

interface ContractModificationManagerProps {
  contractData: IFRS16LeaseFormData;
  existingModifications?: ContractModification[];
  onModificationAdd: (modification: ContractModification) => void;
  onModificationUpdate: (id: string, modification: ContractModification) => void;
  onModificationDelete: (id: string) => void;
  currencyCode?: string;
}

interface ModificationFormData {
  modification_type: string;
  effective_date: string;
  description: string;
  justification: string;

  // Campos específicos por tipo
  new_term_months?: number;
  new_end_date?: string;
  new_monthly_payment?: number;
  new_frequency?: string;
  new_discount_rate?: number;
}

export default function ContractModificationManager({
  contractData,
  existingModifications = [],
  onModificationAdd,
  onModificationUpdate,
  onModificationDelete,
  currencyCode = 'BRL',
}: ContractModificationManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingModification, setEditingModification] = useState<string | null>(null);
  const [formData, setFormData] = useState<ModificationFormData>({
    modification_type: '',
    effective_date: '',
    description: '',
    justification: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [_isCalculating, _setIsCalculating] = useState(false);
  const [financialImpact, setFinancialImpact] = useState<{
    liability_change: number;
    asset_change: number;
    payment_change: number;
  } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getModificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      term_extension: 'Extensão de Prazo',
      term_reduction: 'Redução de Prazo',
      payment_increase: 'Aumento de Pagamento',
      payment_decrease: 'Redução de Pagamento',
      rate_change: 'Alteração de Taxa',
      asset_change: 'Alteração de Ativo',
      classification_change: 'Alteração de Classificação',
      other: 'Outro',
    };
    return labels[type] || type;
  };

  const calculateFinancialImpact = useCallback(async () => {
    if (!formData.effective_date || !formData.modification_type) return;

    setIsCalculating(true);
    try {
      // Criar dados modificados para cálculo
      const modifiedData = { ...contractData };

      switch (formData.modification_type) {
        case 'term_extension':
          if (formData.new_term_months) {
            modifiedData.lease_term_months = formData.new_term_months;
            if (formData.new_end_date) {
              modifiedData.lease_end_date = formData.new_end_date;
            }
          }
          break;
        case 'payment_increase':
        case 'payment_decrease':
          if (formData.new_monthly_payment) {
            modifiedData.monthly_payment = formData.new_monthly_payment;
          }
          break;
        case 'rate_change':
          if (formData.new_discount_rate) {
            modifiedData.discount_rate_annual = formData.new_discount_rate;
          }
          break;
      }

      // Calcular impacto financeiro
      const originalEngine = new IFRS16CalculationEngine(contractData);
      const modifiedEngine = new IFRS16CalculationEngine(modifiedData);

      const originalResults = originalEngine.calculateAll();
      const modifiedResults = modifiedEngine.calculateAll();

      setFinancialImpact({
        liability_change:
          modifiedResults.lease_liability_initial - originalResults.lease_liability_initial,
        asset_change:
          modifiedResults.right_of_use_asset_initial - originalResults.right_of_use_asset_initial,
        payment_change:
          modifiedResults.monthly_interest_expense - originalResults.monthly_interest_expense,
      });
    } catch (error) {
      logger.error('Error calculating financial impact:', error);
      setFinancialImpact(null);
    } finally {
      setIsCalculating(false);
    }
  }, [formData, contractData]);

  useEffect(() => {
    if (showForm) {
      calculateFinancialImpact();
    }
  }, [showForm, calculateFinancialImpact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validationData: ContractModificationValidation = {
        modification_type: formData.modification_type as any,
        effective_date: formData.effective_date,
        description: formData.description,
        term_changes: formData.new_term_months
          ? {
              new_term_months: formData.new_term_months,
              new_end_date: formData.new_end_date,
            }
          : undefined,
        payment_changes: formData.new_monthly_payment
          ? {
              new_monthly_payment: formData.new_monthly_payment,
              new_frequency: formData.new_frequency as any,
            }
          : undefined,
        rate_changes: formData.new_discount_rate
          ? {
              new_discount_rate: formData.new_discount_rate,
              effective_date: formData.effective_date,
            }
          : undefined,
      };

      const validatedData = ContractModificationValidationSchema.parse(validationData);
      setErrors({});

      const modification: ContractModification = {
        id: editingModification || `MOD-${Date.now()}`,
        modification_date: new Date().toISOString().split('T')[0],
        modification_type: validatedData.modification_type,
        effective_date: validatedData.effective_date,
        description: validatedData.description,
        justification: formData.justification,
        old_values: getOldValues(),
        new_values: getNewValues(),
        financial_impact: financialImpact || undefined,
      };

      if (editingModification) {
        onModificationUpdate(editingModification, modification);
      } else {
        onModificationAdd(modification);
      }

      resetForm();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        logger.error('Error submitting modification:', error);
      }
    }
  };

  const getOldValues = () => {
    const oldValues: Record<string, any> = {};

    switch (formData.modification_type) {
      case 'term_extension':
      case 'term_reduction':
        oldValues.lease_term_months = contractData.lease_term_months;
        oldValues.lease_end_date = contractData.lease_end_date;
        break;
      case 'payment_increase':
      case 'payment_decrease':
        oldValues.monthly_payment = contractData.monthly_payment;
        oldValues.payment_frequency = contractData.payment_frequency;
        break;
      case 'rate_change':
        oldValues.discount_rate_annual = contractData.discount_rate_annual;
        break;
    }

    return oldValues;
  };

  const getNewValues = () => {
    const newValues: Record<string, any> = {};

    switch (formData.modification_type) {
      case 'term_extension':
      case 'term_reduction':
        if (formData.new_term_months) newValues.lease_term_months = formData.new_term_months;
        if (formData.new_end_date) newValues.lease_end_date = formData.new_end_date;
        break;
      case 'payment_increase':
      case 'payment_decrease':
        if (formData.new_monthly_payment) newValues.monthly_payment = formData.new_monthly_payment;
        if (formData.new_frequency) newValues.payment_frequency = formData.new_frequency;
        break;
      case 'rate_change':
        if (formData.new_discount_rate) newValues.discount_rate_annual = formData.new_discount_rate;
        break;
    }

    return newValues;
  };

  const resetForm = () => {
    setFormData({
      modification_type: '',
      effective_date: '',
      description: '',
      justification: '',
    });
    setErrors({});
    setShowForm(false);
    setEditingModification(null);
    setFinancialImpact(null);
  };

  const handleEdit = (modification: ContractModification) => {
    setEditingModification(modification.id);
    setFormData({
      modification_type: modification.modification_type,
      effective_date: modification.effective_date,
      description: modification.description,
      justification: modification.justification || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta modificação?')) {
      onModificationDelete(id);
    }
  };

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>Modificações Contratuais</h3>
          <button
            type='button'
            onClick={() => setShowForm(true)}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Nova Modificação
          </button>
        </div>
      </div>

      {/* Formulário de Modificação */}
      {showForm && (
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='modification_type'
                  className='block text-sm font-medium text-gray-700'
                >
                  Tipo de Modificação *
                </label>
                <select
                  id='modification_type'
                  value={formData.modification_type}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, modification_type: e.target.value }))
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.modification_type ? 'border-red-300' : ''
                  }`}
                >
                  <option value=''>Selecione o tipo</option>
                  <option value='term_extension'>Extensão de Prazo</option>
                  <option value='term_reduction'>Redução de Prazo</option>
                  <option value='payment_increase'>Aumento de Pagamento</option>
                  <option value='payment_decrease'>Redução de Pagamento</option>
                  <option value='rate_change'>Alteração de Taxa</option>
                  <option value='asset_change'>Alteração de Ativo</option>
                  <option value='classification_change'>Alteração de Classificação</option>
                  <option value='other'>Outro</option>
                </select>
                {errors.modification_type && (
                  <p className='mt-1 text-sm text-red-600'>{errors.modification_type}</p>
                )}
              </div>

              <div>
                <label htmlFor='effective_date' className='block text-sm font-medium text-gray-700'>
                  Data Efetiva *
                </label>
                <input
                  type='date'
                  id='effective_date'
                  value={formData.effective_date}
                  onChange={e => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.effective_date ? 'border-red-300' : ''
                  }`}
                />
                {errors.effective_date && (
                  <p className='mt-1 text-sm text-red-600'>{errors.effective_date}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
                Descrição *
              </label>
              <textarea
                id='description'
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.description ? 'border-red-300' : ''
                }`}
                rows={3}
                placeholder='Descreva a modificação contratual...'
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-600'>{errors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor='justification' className='block text-sm font-medium text-gray-700'>
                Justificativa
              </label>
              <textarea
                id='justification'
                value={formData.justification}
                onChange={e => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                rows={2}
                placeholder='Justifique a necessidade da modificação...'
              />
            </div>

            {/* Campos específicos por tipo de modificação */}
            {(formData.modification_type === 'term_extension' ||
              formData.modification_type === 'term_reduction') && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='new_term_months'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Novo Prazo (meses)
                  </label>
                  <input
                    type='number'
                    id='new_term_months'
                    value={formData.new_term_months || ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        new_term_months: parseInt(e.target.value) || undefined,
                      }))
                    }
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                    min='1'
                  />
                </div>
                <div>
                  <label htmlFor='new_end_date' className='block text-sm font-medium text-gray-700'>
                    Nova Data de Fim
                  </label>
                  <input
                    type='date'
                    id='new_end_date'
                    value={formData.new_end_date || ''}
                    onChange={e => setFormData(prev => ({ ...prev, new_end_date: e.target.value }))}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  />
                </div>
              </div>
            )}

            {(formData.modification_type === 'payment_increase' ||
              formData.modification_type === 'payment_decrease') && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='new_monthly_payment'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Novo Pagamento Mensal
                  </label>
                  <input
                    type='number'
                    id='new_monthly_payment'
                    value={formData.new_monthly_payment || ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        new_monthly_payment: parseFloat(e.target.value) || undefined,
                      }))
                    }
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                    min='0'
                    step='0.01'
                  />
                </div>
                <div>
                  <label
                    htmlFor='new_frequency'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Nova Frequência
                  </label>
                  <select
                    id='new_frequency'
                    value={formData.new_frequency || ''}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, new_frequency: e.target.value }))
                    }
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  >
                    <option value=''>Manter atual</option>
                    <option value='monthly'>Mensal</option>
                    <option value='quarterly'>Trimestral</option>
                    <option value='semi-annual'>Semestral</option>
                    <option value='annual'>Anual</option>
                  </select>
                </div>
              </div>
            )}

            {formData.modification_type === 'rate_change' && (
              <div>
                <label
                  htmlFor='new_discount_rate'
                  className='block text-sm font-medium text-gray-700'
                >
                  Nova Taxa de Desconto (% a.a.)
                </label>
                <input
                  type='number'
                  id='new_discount_rate'
                  value={formData.new_discount_rate || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      new_discount_rate: parseFloat(e.target.value) || undefined,
                    }))
                  }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  min='0'
                  max='100'
                  step='0.01'
                />
              </div>
            )}

            {/* Impacto Financeiro */}
            {financialImpact && (
              <div className='bg-blue-50 p-4 rounded-lg'>
                <h4 className='text-sm font-medium text-blue-900 mb-2'>
                  Impacto Financeiro Estimado
                </h4>
                <div className='grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-blue-700'>Passivo:</span>
                    <div className='font-medium text-blue-900'>
                      {formatCurrency(financialImpact.liability_change)}
                    </div>
                  </div>
                  <div>
                    <span className='text-blue-700'>Ativo:</span>
                    <div className='font-medium text-blue-900'>
                      {formatCurrency(financialImpact.asset_change)}
                    </div>
                  </div>
                  <div>
                    <span className='text-blue-700'>Pagamento:</span>
                    <div className='font-medium text-blue-900'>
                      {formatCurrency(financialImpact.payment_change)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={resetForm}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                {editingModification ? 'Atualizar' : 'Adicionar'} Modificação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Modificações */}
      <div className='px-6 py-4'>
        {existingModifications.length === 0 ? (
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
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Nenhuma Modificação Registrada
            </h3>
            <p className='text-sm text-gray-500'>
              Clique em &ldquo;Nova Modificação&rdquo; para registrar alterações no contrato
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {existingModifications.map(modification => (
              <div key={modification.id} className='border border-gray-200 rounded-lg p-4'>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                        {getModificationTypeLabel(modification.modification_type)}
                      </span>
                      <span className='text-sm text-gray-500'>
                        Efetiva em: {formatDate(modification.effective_date)}
                      </span>
                    </div>

                    <h4 className='text-sm font-medium text-gray-900 mb-1'>
                      {modification.description}
                    </h4>

                    {modification.justification && (
                      <p className='text-sm text-gray-600 mb-2'>
                        <strong>Justificativa:</strong> {modification.justification}
                      </p>
                    )}

                    {modification.financial_impact && (
                      <div className='text-sm text-gray-600'>
                        <strong>Impacto Financeiro:</strong>
                        <div className='ml-4 mt-1'>
                          <div>
                            Passivo:{' '}
                            {formatCurrency(modification.financial_impact.liability_change || 0)}
                          </div>
                          <div>
                            Ativo: {formatCurrency(modification.financial_impact.asset_change || 0)}
                          </div>
                          <div>
                            Pagamento:{' '}
                            {formatCurrency(modification.financial_impact.payment_change || 0)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='flex space-x-2 ml-4'>
                    <button
                      onClick={() => handleEdit(modification)}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(modification.id)}
                      className='text-red-600 hover:text-red-800 text-sm'
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
