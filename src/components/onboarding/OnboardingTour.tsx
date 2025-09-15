'use client';

import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  highlight?: boolean;
  animation?: 'pulse' | 'bounce' | 'shake';
  tips?: string[];
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Contabilease! 🎉',
    content:
      'Sua plataforma especializada em conformidade contábil IFRS 16 para contratos de leasing. Vamos fazer um tour rápido para você conhecer as principais funcionalidades.',
    position: 'bottom',
    highlight: true,
    animation: 'bounce',
    tips: [
      'Plataforma 100% conforme com IFRS 16',
      'Cálculos automáticos de passivo e ativo',
      'Relatórios profissionais prontos',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard IFRS 16 📊',
    content:
      'Aqui você tem uma visão completa dos seus contratos de leasing, métricas de conformidade e alertas importantes. O dashboard é atualizado em tempo real.',
    target: '[data-tour="dashboard"]',
    position: 'bottom',
    highlight: true,
    animation: 'pulse',
    tips: ['Métricas em tempo real', 'Alertas de vencimento', 'Status de conformidade'],
  },
  {
    id: 'contracts',
    title: 'Gestão de Contratos 📋',
    content:
      'Gerencie todos os seus contratos de leasing em um só lugar. Crie novos contratos, visualize detalhes e acompanhe o status de conformidade.',
    target: '[data-tour="contracts"]',
    position: 'bottom',
    action: {
      text: 'Ver Contratos',
      href: '/contracts',
    },
    highlight: true,
    tips: [
      'Criação com wizard intuitivo',
      'Validação automática de dados',
      'Histórico de modificações',
    ],
  },
  {
    id: 'calculations',
    title: 'Cálculos IFRS 16 🧮',
    content:
      'Nossa engine avançada calcula automaticamente o passivo de arrendamento, ativo de direito de uso e tabela de amortização conforme IFRS 16.',
    target: '[data-tour="calculations"]',
    position: 'bottom',
    action: {
      text: 'Criar Contrato',
      href: '/contracts/new',
    },
    highlight: true,
    animation: 'pulse',
    tips: ['Cálculos automáticos', 'Tabela de amortização', 'Conformidade garantida'],
  },
  {
    id: 'compliance',
    title: 'Conformidade ✅',
    content:
      'Monitore a conformidade dos seus contratos com IFRS 16. Identifique problemas e receba recomendações para correção.',
    target: '[data-tour="compliance"]',
    position: 'bottom',
    action: {
      text: 'Ver Conformidade',
      href: '/ifrs16-demo',
    },
    highlight: true,
    tips: ['Verificação automática', 'Relatórios de não conformidade', 'Recomendações de correção'],
  },
  {
    id: 'charts',
    title: 'Visualizações 📈',
    content:
      'Gráficos interativos mostram a evolução dos seus contratos, amortização e métricas financeiras de forma clara e profissional.',
    target: '[data-tour="charts"]',
    position: 'top',
    highlight: true,
    animation: 'pulse',
    tips: ['Gráficos interativos', 'Análise temporal', 'Exportação de dados'],
  },
  {
    id: 'complete',
    title: 'Tour Concluído! 🚀',
    content:
      'Agora você está pronto para usar o Contabilease. Comece criando seu primeiro contrato de leasing ou explore as funcionalidades disponíveis.',
    position: 'bottom',
    highlight: true,
    animation: 'bounce',
    tips: ['Suporte 24/7 disponível', 'Documentação completa', 'Treinamentos online'],
  },
];

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Scroll to target element if exists
      const target = tourSteps[currentStep].target;
      if (target) {
        const element = document.querySelector(target) as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedElement(element);

          // Add highlight class
          if (tourSteps[currentStep].highlight) {
            element.classList.add('tour-highlight');
            if (tourSteps[currentStep].animation) {
              element.classList.add(`animate-${tourSteps[currentStep].animation}`);
            }
          }
        }
      }
    } else {
      // Clean up highlights
      if (highlightedElement) {
        highlightedElement.classList.remove(
          'tour-highlight',
          'animate-pulse',
          'animate-bounce',
          'animate-shake'
        );
        setHighlightedElement(null);
      }
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove(
          'tour-highlight',
          'animate-pulse',
          'animate-bounce',
          'animate-shake'
        );
      }
    };
  }, [highlightedElement]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
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

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      setCurrentStep(0);
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setCurrentStep(0);
    }, 300);
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Tour Content */}
      <div
        className={`relative flex items-center justify-center min-h-screen p-4 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center'>
              <div className='flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3'>
                <span className='text-sm font-medium text-blue-600'>{currentStep + 1}</span>
              </div>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>{step.title}</h3>
                <div className='text-sm text-gray-500'>
                  Passo {currentStep + 1} de {tourSteps.length}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>

          {/* Progress Bar */}
          <div className='px-6 py-2'>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className='p-6'>
            <p className='text-gray-700 leading-relaxed mb-4'>{step.content}</p>

            {/* Tips */}
            {step.tips && step.tips.length > 0 && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center mb-2'>
                  <SparklesIcon className='h-4 w-4 text-blue-600 mr-2' />
                  <h4 className='text-sm font-medium text-blue-800'>Dicas importantes:</h4>
                </div>
                <ul className='space-y-1'>
                  {step.tips.map((tip, index) => (
                    <li key={index} className='text-sm text-blue-700 flex items-start'>
                      <span className='text-blue-500 mr-2'>•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Button */}
          {step.action && (
            <div className='px-6 pb-4'>
              <button
                onClick={() => {
                  if (step.action?.onClick) {
                    step.action.onClick();
                  } else if (step.action?.href) {
                    window.location.href = step.action.href;
                  }
                }}
                className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
              >
                {step.action.text}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className='flex items-center justify-between p-6 border-t border-gray-200'>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronLeftIcon className='h-4 w-4 mr-1' />
              Anterior
            </button>

            <div className='flex space-x-2'>
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <CheckCircleIcon className='h-4 w-4 mr-1' />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRightIcon className='h-4 w-4 ml-1' />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
