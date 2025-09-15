'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  PlayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onStartTour }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleStartTour = () => {
    setIsVisible(false);
    setTimeout(() => {
      onStartTour();
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative flex items-center justify-center min-h-screen p-4 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4'>
                <ChartBarIcon className='h-8 w-8 text-blue-600' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>Bem-vindo ao Contabilease!</h2>
                <p className='text-gray-600'>Sua plataforma especializada em IFRS 16</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>
            <div className='mb-6'>
              <p className='text-lg text-gray-700 mb-4'>
                O Contabilease é a solução completa para gestão de contratos de leasing com
                conformidade total às normas IFRS 16. Desenvolvido especialmente para contadores e
                escritórios contábeis.
              </p>
            </div>

            {/* Features */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <DocumentTextIcon className='h-8 w-8 text-blue-600 mx-auto mb-2' />
                <h3 className='font-medium text-gray-900 mb-1'>Gestão de Contratos</h3>
                <p className='text-sm text-gray-600'>
                  Crie e gerencie contratos de leasing com interface intuitiva
                </p>
              </div>

              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <CalculatorIcon className='h-8 w-8 text-green-600 mx-auto mb-2' />
                <h3 className='font-medium text-gray-900 mb-1'>Cálculos IFRS 16</h3>
                <p className='text-sm text-gray-600'>
                  Engine avançado com cálculos automáticos e validações
                </p>
              </div>

              <div className='text-center p-4 bg-purple-50 rounded-lg'>
                <ChartBarIcon className='h-8 w-8 text-purple-600 mx-auto mb-2' />
                <h3 className='font-medium text-gray-900 mb-1'>Relatórios</h3>
                <p className='text-sm text-gray-600'>
                  Visualizações e relatórios profissionais para auditoria
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <h3 className='font-medium text-gray-900 mb-3'>Principais Benefícios:</h3>
              <ul className='space-y-2 text-sm text-gray-700'>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                  <span>Conformidade 100% com IFRS 16</span>
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                  <span>Cálculos automáticos de passivo e ativo</span>
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                  <span>Tabela de amortização completa</span>
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                  <span>Validações financeiras avançadas</span>
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                  <span>Interface profissional e intuitiva</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-between p-6 border-t border-gray-200'>
            <button
              onClick={handleClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Pular Introdução
            </button>

            <button
              onClick={handleStartTour}
              className='flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              <PlayIcon className='h-4 w-4 mr-2' />
              Fazer Tour Guiado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
