'use client';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { LoadingButton } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { Contract } from '@/lib/contracts';
import { contractSchema, type ContractFormData } from '@/lib/schemas/contract';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { z } from 'zod';

interface ContractWizardProps {
  contract?: Contract;
  onSubmit: (data: ContractFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
}

const wizardSteps: WizardStep[] = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Título e status do contrato',
    icon: DocumentTextIcon,
    fields: ['title', 'status'],
  },
  {
    id: 'financial',
    title: 'Dados Financeiros',
    description: 'Valores e taxas do contrato',
    icon: CurrencyDollarIcon,
    fields: [
      'currency_code',
      'contract_value',
      'contract_term_months',
      'implicit_interest_rate',
      'guaranteed_residual_value',
      'purchase_option_price',
      'payment_frequency',
    ],
  },
  {
    id: 'dates',
    title: 'Datas e Prazos',
    description: 'Datas importantes do contrato',
    icon: CalendarDaysIcon,
    fields: ['lease_start_date', 'lease_end_date', 'purchase_option_exercise_date'],
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Confirme os dados antes de salvar',
    icon: CheckCircleIcon,
    fields: [],
  },
];

export default function ContractWizard({
  contract,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContractWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { success, error } = useToast();

  const currentStepData = wizardSteps[currentStep];
  const isLastStep = currentStep === wizardSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = () => {
    const currentFields = currentStepData.fields;
    const newErrors: Record<string, string> = {};

    // Validate required fields for current step
    currentFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (!value || value.trim() === '') {
        newErrors[field] = 'Este campo é obrigatório';
      }
    });

    // Additional validation for specific fields
    if (currentFields.includes('contract_value') && formData.contract_value) {
      const value = parseFloat(formData.contract_value);
      if (isNaN(value) || value <= 0) {
        newErrors.contract_value = 'Valor deve ser maior que zero';
      }
    }

    if (currentFields.includes('contract_term_months') && formData.contract_term_months) {
      const value = parseInt(formData.contract_term_months);
      if (isNaN(value) || value <= 0 || value > 600) {
        newErrors.contract_term_months = 'Prazo deve ser entre 1 e 600 meses';
      }
    }

    if (currentFields.includes('implicit_interest_rate') && formData.implicit_interest_rate) {
      const value = parseFloat(formData.implicit_interest_rate);
      if (isNaN(value) || value < 0 || value > 100) {
        newErrors.implicit_interest_rate = 'Taxa deve ser entre 0% e 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
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
      success(
        'Contrato salvo com sucesso!',
        'Os dados foram salvos e os cálculos IFRS 16 foram atualizados.'
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues?.forEach(issue => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
        error('Erro de validação', 'Verifique os dados informados');
      } else {
        console.error('Error submitting form:', err);
        error('Erro ao salvar', 'Não foi possível salvar o contrato. Tente novamente.');
      }
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const formatDate = (value: string) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Progress Steps */}
      <div className='mb-8'>
        <nav aria-label='Progress'>
          <ol className='flex items-center justify-between'>
            {wizardSteps.map((step, stepIndex) => {
              const status = getStepStatus(stepIndex);
              return (
                <li
                  key={step.id}
                  className={`flex items-center ${stepIndex < wizardSteps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className='flex items-center'>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        status === 'completed'
                          ? 'bg-green-600 border-green-600 text-white'
                          : status === 'current'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-500'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircleIcon className='w-6 h-6' />
                      ) : (
                        <step.icon className='w-6 h-6' />
                      )}
                    </div>
                    <div className='ml-4 min-w-0'>
                      <p
                        className={`text-sm font-medium ${
                          status === 'current'
                            ? 'text-blue-600'
                            : status === 'completed'
                              ? 'text-green-600'
                              : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className='text-xs text-gray-500'>{step.description}</p>
                    </div>
                  </div>
                  {stepIndex < wizardSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className='bg-white shadow rounded-lg'>
        <div className='px-6 py-8'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>{currentStepData.title}</h2>
            <p className='mt-2 text-gray-600'>{currentStepData.description}</p>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className='space-y-6'>
              <div>
                <label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-2'>
                  Título do Contrato *
                </label>
                <input
                  type='text'
                  id='title'
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ex: Contrato de Leasing - Veículo ABC123'
                  disabled={isLoading}
                />
                {errors.title && <p className='mt-1 text-sm text-red-600'>{errors.title}</p>}
              </div>

              <div>
                <label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-2'>
                  Status
                </label>
                <select
                  id='status'
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  disabled={isLoading}
                >
                  <option value='draft'>Rascunho</option>
                  <option value='active'>Ativo</option>
                  <option value='completed'>Concluído</option>
                  <option value='cancelled'>Cancelado</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Financial Data */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='currency_code'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Moeda
                  </label>
                  <input
                    type='text'
                    id='currency_code'
                    value={formData.currency_code}
                    onChange={e => handleChange('currency_code', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.currency_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder='BRL'
                    maxLength={3}
                    disabled={isLoading}
                  />
                  <p className='mt-1 text-sm text-gray-500'>Código ISO da moeda (3 caracteres)</p>
                </div>

                <div>
                  <label
                    htmlFor='contract_value'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Valor do Contrato *
                  </label>
                  <input
                    type='number'
                    id='contract_value'
                    value={formData.contract_value}
                    onChange={e => handleChange('contract_value', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contract_value ? 'border-red-300' : 'border-gray-300'
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
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Prazo (meses) *
                  </label>
                  <input
                    type='number'
                    id='contract_term_months'
                    value={formData.contract_term_months}
                    onChange={e => handleChange('contract_term_months', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contract_term_months ? 'border-red-300' : 'border-gray-300'
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
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Taxa de Juros Implícita (%) *
                  </label>
                  <input
                    type='number'
                    id='implicit_interest_rate'
                    value={formData.implicit_interest_rate}
                    onChange={e => handleChange('implicit_interest_rate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.implicit_interest_rate ? 'border-red-300' : 'border-gray-300'
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
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Valor Residual Garantido
                  </label>
                  <input
                    type='number'
                    id='guaranteed_residual_value'
                    value={formData.guaranteed_residual_value}
                    onChange={e => handleChange('guaranteed_residual_value', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='0.00'
                    step='0.01'
                    min='0'
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor='purchase_option_price'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Preço da Opção de Compra
                  </label>
                  <input
                    type='number'
                    id='purchase_option_price'
                    value={formData.purchase_option_price}
                    onChange={e => handleChange('purchase_option_price', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='0.00'
                    step='0.01'
                    min='0'
                    disabled={isLoading}
                  />
                </div>

                <div className='md:col-span-2'>
                  <label
                    htmlFor='payment_frequency'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Frequência de Pagamento
                  </label>
                  <select
                    id='payment_frequency'
                    value={formData.payment_frequency}
                    onChange={e => handleChange('payment_frequency', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    disabled={isLoading}
                  >
                    <option value=''>Selecione...</option>
                    <option value='monthly'>Mensal</option>
                    <option value='quarterly'>Trimestral</option>
                    <option value='semi-annual'>Semestral</option>
                    <option value='annual'>Anual</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dates */}
          {currentStep === 2 && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <label
                    htmlFor='lease_start_date'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Data de Início do Leasing
                  </label>
                  <input
                    type='date'
                    id='lease_start_date'
                    value={formData.lease_start_date}
                    onChange={e => handleChange('lease_start_date', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor='lease_end_date'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Data de Fim do Leasing
                  </label>
                  <input
                    type='date'
                    id='lease_end_date'
                    value={formData.lease_end_date}
                    onChange={e => handleChange('lease_end_date', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor='purchase_option_exercise_date'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Data de Exercício da Opção de Compra
                  </label>
                  <input
                    type='date'
                    id='purchase_option_exercise_date'
                    value={formData.purchase_option_exercise_date}
                    onChange={e => handleChange('purchase_option_exercise_date', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              <div className='bg-gray-50 rounded-lg p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Resumo do Contrato</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Título</dt>
                    <dd className='text-sm text-gray-900'>{formData.title || 'Não informado'}</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Status</dt>
                    <dd className='text-sm text-gray-900 capitalize'>{formData.status}</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Valor do Contrato</dt>
                    <dd className='text-sm text-gray-900'>
                      {formatCurrency(formData.contract_value)}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Prazo</dt>
                    <dd className='text-sm text-gray-900'>{formData.contract_term_months} meses</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Taxa de Juros</dt>
                    <dd className='text-sm text-gray-900'>{formData.implicit_interest_rate}%</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Frequência de Pagamento</dt>
                    <dd className='text-sm text-gray-900 capitalize'>
                      {formData.payment_frequency || 'Não informado'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Data de Início</dt>
                    <dd className='text-sm text-gray-900'>
                      {formatDate(formData.lease_start_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Data de Fim</dt>
                    <dd className='text-sm text-gray-900'>{formatDate(formData.lease_end_date)}</dd>
                  </div>
                </div>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <ExclamationTriangleIcon className='h-5 w-5 text-blue-400' />
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-blue-800'>Cálculos IFRS 16</h3>
                    <div className='mt-2 text-sm text-blue-700'>
                      <p>
                        Após salvar o contrato, os seguintes cálculos serão executados
                        automaticamente:
                      </p>
                      <ul className='mt-2 list-disc list-inside space-y-1'>
                        <li>Passivo de Arrendamento</li>
                        <li>Ativo de Direito de Uso</li>
                        <li>Cronograma de Amortização</li>
                        <li>Despesas de Juros e Depreciação</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            disabled={isLoading}
          >
            Cancelar
          </button>

          <div className='flex space-x-3'>
            {!isFirstStep && (
              <button
                type='button'
                onClick={handlePrevious}
                className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                disabled={isLoading}
              >
                <ChevronLeftIcon className='w-4 h-4 mr-2' />
                Anterior
              </button>
            )}

            <LoadingButton
              isLoading={isLoading}
              onClick={handleNext}
              className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              {isLastStep ? (
                <>
                  <CheckCircleIcon className='w-4 h-4 mr-2' />
                  Salvar Contrato
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRightIcon className='w-4 h-4 ml-2' />
                </>
              )}
            </LoadingButton>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title='Cancelar criação do contrato'
        message='Tem certeza que deseja cancelar? Todos os dados inseridos serão perdidos.'
        confirmText='Sim, cancelar'
        cancelText='Continuar editando'
        type='warning'
      />
    </div>
  );
}
