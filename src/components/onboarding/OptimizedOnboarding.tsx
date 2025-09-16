/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { useToast } from '@/components/ui/Toast';
import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { createIFRS16LeaseContract } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
  TrophyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OptimizedOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onFirstVictory?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  isCompleted: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'quick-setup',
    title: 'Setup Rápido',
    description: 'Configure sua empresa e primeiro contrato',
    icon: BuildingOfficeIcon,
    estimatedTime: '2 min',
    isCompleted: false,
  },
  {
    id: 'first-victory',
    title: 'Primeira Vitória',
    description: 'Veja seus cálculos IFRS 16 em tempo real',
    icon: TrophyIcon,
    estimatedTime: '3 min',
    isCompleted: false,
  },
  {
    id: 'exploration',
    title: 'Exploração',
    description: 'Descubra funcionalidades avançadas',
    icon: ChartBarIcon,
    estimatedTime: 'Opcional',
    isCompleted: false,
  },
];

export default function OptimizedOnboarding({
  isOpen,
  onClose,
  onComplete,
  onFirstVictory,
}: OptimizedOnboardingProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Quick Setup Data
  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    monthlyContracts: '',
  });

  // Step 2: First Contract Data
  const [contractData, setContractData] = useState<IFRS16LeaseFormData>({
    title: '',
    status: 'active',
    currency_code: 'BRL',
    lease_start_date: '',
    lease_end_date: '',
    lease_term_months: 36,
    monthly_payment: 0,
    payment_frequency: 'monthly',
    discount_rate_annual: 8.5,
    payment_timing: 'end',
    initial_payment: 0,
    asset_fair_value: 0,
    initial_direct_costs: 0,
    lease_incentives: 0,
    guaranteed_residual_value: 0,
  });

  // Step 2: Calculation Results
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [showCalculation, setShowCalculation] = useState(false);

  // Step 3: Exploration options
  const [explorationOptions, setExplorationOptions] = useState({
    showAdvancedFeatures: false,
    enableNotifications: true,
    scheduleDemo: false,
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Reset state when opening
      setCurrentStep(0);
      setCompanyData({ companyName: '', industry: '', monthlyContracts: '' });
      setContractData({
        title: '',
        status: 'active',
        currency_code: 'BRL',
        lease_start_date: '',
        lease_end_date: '',
        lease_term_months: 36,
        monthly_payment: 0,
        payment_frequency: 'monthly',
        discount_rate_annual: 8.5,
        payment_timing: 'end',
        initial_payment: 0,
        asset_fair_value: 0,
        initial_direct_costs: 0,
        lease_incentives: 0,
        guaranteed_residual_value: 0,
      });
      setCalculationResult(null);
      setShowCalculation(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save onboarding completion
      localStorage.setItem('contabilease-onboarding-completed', 'true');
      localStorage.setItem('contabilease-onboarding-date', new Date().toISOString());

      // Save company data
      localStorage.setItem('contabilease-company-data', JSON.stringify(companyData));

      success('Onboarding Concluído!', 'Bem-vindo ao Contabilease! Você está pronto para começar.');

      onComplete();
      router.push('/dashboard');
    } catch (error) {
      logger.error(
        'Error completing onboarding:',
        {
          component: 'optimizedonboarding',
          operation: 'completeOnboarding',
        },
        error as Error
      );
      showError('Erro', 'Não foi possível concluir o onboarding. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateContract = () => {
    try {
      if (
        !contractData.lease_start_date ||
        !contractData.lease_end_date ||
        !contractData.monthly_payment
      ) {
        showError(
          'Dados Incompletos',
          'Preencha pelo menos: data de início, data de fim e valor mensal'
        );
        return;
      }

      const engine = new IFRS16CalculationEngine(contractData);
      const validation = engine.validateLeaseData();

      if (!validation.isValid) {
        showError('Dados Inválidos', validation.errors.join(', '));
        return;
      }

      const results = engine.calculateAll();
      setCalculationResult(results);
      setShowCalculation(true);

      // Mark first victory as completed
      onboardingSteps[1].isCompleted = true;

      // Call first victory callback
      if (onFirstVictory) {
        onFirstVictory();
      }

      success('Cálculo Realizado!', 'Seus cálculos IFRS 16 foram gerados com sucesso!');
    } catch (error) {
      logger.error(
        'Error calculating contract:',
        {
          component: 'optimizedonboarding',
          operation: 'calculateContract',
        },
        error as Error
      );
      showError('Erro no Cálculo', 'Não foi possível calcular o contrato. Verifique os dados.');
    }
  };

  const saveContract = async () => {
    if (!calculationResult) return;

    setIsLoading(true);
    try {
      const contract = await createIFRS16LeaseContract(contractData);
      success('Contrato Salvo!', 'Seu primeiro contrato foi criado com sucesso!');

      // Mark exploration as completed
      onboardingSteps[2].isCompleted = true;

      // Auto-advance to next step
      setTimeout(() => {
        setCurrentStep(2);
      }, 1000);
    } catch (error) {
      logger.error(
        'Error saving contract:',
        {
          component: 'optimizedonboarding',
          operation: 'saveContract',
        },
        error as Error
      );
      showError('Erro ao Salvar', 'Não foi possível salvar o contrato. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-full items-center justify-center p-4'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={onClose}
        />

        <div className='relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <SparklesIcon className='h-8 w-8 text-white' />
                <div>
                  <h2 className='text-xl font-bold text-white'>Onboarding Otimizado</h2>
                  <p className='text-blue-100 text-sm'>Primeira vitória em 5 minutos</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='text-white hover:text-blue-200 transition-colors'
              >
                <XMarkIcon className='h-6 w-6' />
              </button>
            </div>

            {/* Progress Steps */}
            <div className='mt-4 flex space-x-4'>
              {onboardingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    index === currentStep
                      ? 'bg-white bg-opacity-20 text-white'
                      : index < currentStep
                        ? 'bg-green-500 bg-opacity-20 text-green-100'
                        : 'bg-white bg-opacity-10 text-blue-100'
                  }`}
                >
                  <step.icon className='h-5 w-5' />
                  <div>
                    <div className='font-medium text-sm'>{step.title}</div>
                    <div className='text-xs opacity-75'>{step.estimatedTime}</div>
                  </div>
                  {index < currentStep && <CheckCircleIcon className='h-5 w-5 text-green-300' />}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className='p-6 max-h-[60vh] overflow-y-auto'>
            {currentStep === 0 && (
              <div className='space-y-6'>
                <div className='text-center'>
                  <BuildingOfficeIcon className='h-16 w-16 text-blue-600 mx-auto mb-4' />
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>Setup Rápido</h3>
                  <p className='text-gray-600'>Configure sua empresa para começar</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Nome da Empresa *
                      </label>
                      <input
                        type='text'
                        value={companyData.companyName}
                        onChange={e =>
                          setCompanyData(prev => ({ ...prev, companyName: e.target.value }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Ex: Minha Empresa Ltda'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Setor de Atuação
                      </label>
                      <select
                        value={companyData.industry}
                        onChange={e =>
                          setCompanyData(prev => ({ ...prev, industry: e.target.value }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Selecione...</option>
                        <option value='industria'>Indústria</option>
                        <option value='comercio'>Comércio</option>
                        <option value='servicos'>Serviços</option>
                        <option value='construcao'>Construção</option>
                        <option value='tecnologia'>Tecnologia</option>
                        <option value='saude'>Saúde</option>
                        <option value='educacao'>Educação</option>
                        <option value='outros'>Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Contratos Mensais
                      </label>
                      <select
                        value={companyData.monthlyContracts}
                        onChange={e =>
                          setCompanyData(prev => ({ ...prev, monthlyContracts: e.target.value }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Selecione...</option>
                        <option value='1-5'>1-5 contratos</option>
                        <option value='6-20'>6-20 contratos</option>
                        <option value='21-50'>21-50 contratos</option>
                        <option value='50+'>50+ contratos</option>
                      </select>
                    </div>
                  </div>

                  <div className='md:col-span-2'>
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <h4 className='font-medium text-blue-900 mb-2'>
                        Por que precisamos dessas informações?
                      </h4>
                      <ul className='text-sm text-blue-800 space-y-1'>
                        <li>• Personalizar sua experiência</li>
                        <li>• Sugerir configurações otimizadas</li>
                        <li>• Calcular ROI específico para seu setor</li>
                        <li>• Oferecer suporte especializado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className='space-y-6'>
                <div className='text-center'>
                  <TrophyIcon className='h-16 w-16 text-green-600 mx-auto mb-4' />
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>Primeira Vitória</h3>
                  <p className='text-gray-600'>
                    Crie seu primeiro contrato e veja a mágica acontecer
                  </p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <h4 className='font-medium text-gray-900'>Dados do Contrato</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Título *
                        </label>
                        <input
                          type='text'
                          value={contractData.title}
                          onChange={e =>
                            setContractData(prev => ({ ...prev, title: e.target.value }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='Ex: Leasing Equipamento'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Valor Mensal (R$) *
                        </label>
                        <input
                          type='number'
                          value={contractData.monthly_payment || ''}
                          onChange={e =>
                            setContractData(prev => ({
                              ...prev,
                              monthly_payment: Number(e.target.value),
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='1500'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Data Início *
                        </label>
                        <input
                          type='date'
                          value={contractData.lease_start_date}
                          onChange={e =>
                            setContractData(prev => ({ ...prev, lease_start_date: e.target.value }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Data Fim *
                        </label>
                        <input
                          type='date'
                          value={contractData.lease_end_date}
                          onChange={e =>
                            setContractData(prev => ({ ...prev, lease_end_date: e.target.value }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Prazo (meses)
                        </label>
                        <input
                          type='number'
                          value={contractData.lease_term_months || ''}
                          onChange={e =>
                            setContractData(prev => ({
                              ...prev,
                              lease_term_months: Number(e.target.value),
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='36'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Taxa Anual (%)
                        </label>
                        <input
                          type='number'
                          step='0.1'
                          value={contractData.discount_rate_annual || ''}
                          onChange={e =>
                            setContractData(prev => ({
                              ...prev,
                              discount_rate_annual: Number(e.target.value),
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='8.5'
                        />
                      </div>
                    </div>

                    <button
                      onClick={calculateContract}
                      disabled={
                        !contractData.title ||
                        !contractData.monthly_payment ||
                        !contractData.lease_start_date ||
                        !contractData.lease_end_date
                      }
                      className='w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                    >
                      <SparklesIcon className='h-5 w-5 inline mr-2' />
                      Calcular IFRS 16
                    </button>
                  </div>

                  <div className='space-y-4'>
                    {showCalculation && calculationResult ? (
                      <div className='space-y-4'>
                        <h4 className='font-medium text-gray-900'>Resultados do Cálculo</h4>

                        <div className='bg-green-50 p-4 rounded-lg space-y-3'>
                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Passivo Inicial:</span>
                            <span className='font-medium text-green-800'>
                              R${' '}
                              {calculationResult.lease_liability_initial.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Ativo Inicial:</span>
                            <span className='font-medium text-green-800'>
                              R${' '}
                              {calculationResult.right_of_use_asset_initial.toLocaleString(
                                'pt-BR',
                                { minimumFractionDigits: 2 }
                              )}
                            </span>
                          </div>

                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Juros Mensais:</span>
                            <span className='font-medium text-green-800'>
                              R${' '}
                              {calculationResult.monthly_interest_expense.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Amortização Mensal:</span>
                            <span className='font-medium text-green-800'>
                              R${' '}
                              {calculationResult.monthly_amortization.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className='bg-blue-50 p-4 rounded-lg'>
                          <div className='flex items-center space-x-2 mb-2'>
                            <CheckCircleIcon className='h-5 w-5 text-green-600' />
                            <span className='font-medium text-green-800'>
                              Primeira Vitória Conquistada!
                            </span>
                          </div>
                          <p className='text-sm text-green-700'>
                            Seus cálculos IFRS 16 foram gerados automaticamente. Economize horas de
                            trabalho manual!
                          </p>
                        </div>

                        <button
                          onClick={saveContract}
                          disabled={isLoading}
                          className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors'
                        >
                          {isLoading ? 'Salvando...' : 'Salvar Contrato'}
                        </button>
                      </div>
                    ) : (
                      <div className='bg-gray-50 p-6 rounded-lg text-center'>
                        <DocumentTextIcon className='h-12 w-12 text-gray-400 mx-auto mb-3' />
                        <p className='text-gray-600 text-sm'>
                          Preencha os dados do contrato e clique em "Calcular IFRS 16" para ver os
                          resultados
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className='space-y-6'>
                <div className='text-center'>
                  <ChartBarIcon className='h-16 w-16 text-purple-600 mx-auto mb-4' />
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>Exploração</h3>
                  <p className='text-gray-600'>Descubra funcionalidades avançadas (opcional)</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  <div className='space-y-4'>
                    <h4 className='font-medium text-gray-900'>Funcionalidades Avançadas</h4>

                    <div className='space-y-3'>
                      <label className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                        <input
                          type='checkbox'
                          checked={explorationOptions.showAdvancedFeatures}
                          onChange={e =>
                            setExplorationOptions(prev => ({
                              ...prev,
                              showAdvancedFeatures: e.target.checked,
                            }))
                          }
                          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                        />
                        <div>
                          <div className='font-medium text-blue-900 text-sm'>
                            Recursos Avançados
                          </div>
                          <div className='text-blue-700 text-xs'>
                            Modificações, impairment, disclosures
                          </div>
                        </div>
                      </label>

                      <label className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg'>
                        <input
                          type='checkbox'
                          checked={explorationOptions.enableNotifications}
                          onChange={e =>
                            setExplorationOptions(prev => ({
                              ...prev,
                              enableNotifications: e.target.checked,
                            }))
                          }
                          className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
                        />
                        <div>
                          <div className='font-medium text-green-900 text-sm'>
                            Notificações Proativas
                          </div>
                          <div className='text-green-700 text-xs'>
                            Alertas de vencimento e conformidade
                          </div>
                        </div>
                      </label>

                      <label className='flex items-center space-x-3 p-3 bg-purple-50 rounded-lg'>
                        <input
                          type='checkbox'
                          checked={explorationOptions.scheduleDemo}
                          onChange={e =>
                            setExplorationOptions(prev => ({
                              ...prev,
                              scheduleDemo: e.target.checked,
                            }))
                          }
                          className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
                        />
                        <div>
                          <div className='font-medium text-purple-900 text-sm'>
                            Demo Personalizada
                          </div>
                          <div className='text-purple-700 text-xs'>Agende uma demonstração</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h4 className='font-medium text-gray-900'>Próximos Passos</h4>

                    <div className='space-y-3'>
                      <div className='flex items-start space-x-3 p-3 bg-blue-50 rounded-lg'>
                        <DocumentTextIcon className='h-5 w-5 text-blue-600 mt-0.5' />
                        <div>
                          <div className='font-medium text-blue-900 text-sm'>
                            Criar Mais Contratos
                          </div>
                          <div className='text-blue-700 text-xs'>
                            Adicione todos os seus contratos de leasing
                          </div>
                        </div>
                      </div>

                      <div className='flex items-start space-x-3 p-3 bg-green-50 rounded-lg'>
                        <ChartBarIcon className='h-5 w-5 text-green-600 mt-0.5' />
                        <div>
                          <div className='font-medium text-green-900 text-sm'>
                            Relatórios Automáticos
                          </div>
                          <div className='text-green-700 text-xs'>
                            Gere relatórios IFRS 16 profissionais
                          </div>
                        </div>
                      </div>

                      <div className='flex items-start space-x-3 p-3 bg-purple-50 rounded-lg'>
                        <ClockIcon className='h-5 w-5 text-purple-600 mt-0.5' />
                        <div>
                          <div className='font-medium text-purple-900 text-sm'>
                            Monitoramento Contínuo
                          </div>
                          <div className='text-purple-700 text-xs'>
                            Acompanhe vencimentos e alertas
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h4 className='font-medium text-gray-900'>Recursos Premium</h4>

                    <div className='space-y-3'>
                      <div className='flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg'>
                        <SparklesIcon className='h-5 w-5 text-yellow-600 mt-0.5' />
                        <div>
                          <div className='font-medium text-yellow-900 text-sm'>IA Avançada</div>
                          <div className='text-yellow-700 text-xs'>
                            Sugestões inteligentes e automação
                          </div>
                        </div>
                      </div>

                      <div className='flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg'>
                        <TrophyIcon className='h-5 w-5 text-indigo-600 mt-0.5' />
                        <div>
                          <div className='font-medium text-indigo-900 text-sm'>Suporte Premium</div>
                          <div className='text-indigo-700 text-xs'>Suporte especializado 24/7</div>
                        </div>
                      </div>

                      <div className='flex items-start space-x-3 p-3 bg-pink-50 rounded-lg'>
                        <BuildingOfficeIcon className='h-5 w-5 text-pink-600 mt-0.5' />
                        <div>
                          <div className='font-medium text-pink-900 text-sm'>Integrações</div>
                          <div className='text-pink-700 text-xs'>Conecte com seus sistemas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg'>
                  <div className='text-center'>
                    <TrophyIcon className='h-12 w-12 text-yellow-500 mx-auto mb-3' />
                    <h4 className='text-lg font-bold text-gray-900 mb-2'>Parabéns! 🎉</h4>
                    <p className='text-gray-600 mb-4'>
                      Você completou o onboarding otimizado e já tem seu primeiro contrato
                      calculado!
                    </p>
                    <div className='flex justify-center space-x-4'>
                      <button
                        onClick={() => router.push('/contracts')}
                        className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                      >
                        Ver Contratos
                      </button>
                      <button
                        onClick={() => router.push('/contracts/new')}
                        className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'
                      >
                        Criar Novo Contrato
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='bg-gray-50 px-6 py-4 flex justify-between items-center'>
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <ClockIcon className='h-4 w-4' />
              <span>Tempo estimado: {onboardingSteps[currentStep].estimatedTime}</span>
            </div>

            <div className='flex space-x-3'>
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
                >
                  Anterior
                </button>
              )}

              <button
                onClick={currentStep === onboardingSteps.length - 1 ? handleComplete : handleNext}
                disabled={isLoading || (currentStep === 0 && !companyData.companyName)}
                className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === onboardingSteps.length - 1 ? 'Concluir' : 'Próximo'}
                    </span>
                    <ChevronRightIcon className='h-4 w-4' />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
