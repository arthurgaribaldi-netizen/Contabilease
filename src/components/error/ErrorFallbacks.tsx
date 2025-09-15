import { AlertTriangle } from 'lucide-react';
import React from 'react';

/**
 * Componente de fallback para erros de página
 */
export const PageErrorFallback: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <div className='text-center'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Erro na página</h1>
      <p className='text-gray-600 dark:text-gray-400 mb-6'>
        Algo deu errado ao carregar esta página.
      </p>
      <button
        onClick={() => window.location.reload()}
        className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
      >
        Recarregar página
      </button>
    </div>
  </div>
);

/**
 * Componente de fallback para erros críticos
 */
export const CriticalErrorFallback: React.FC = () => (
  <div className='p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md'>
    <div className='flex'>
      <AlertTriangle className='w-5 h-5 text-red-400 mr-3' />
      <div>
        <h3 className='text-sm font-medium text-red-800 dark:text-red-200'>Erro crítico</h3>
        <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
          Ocorreu um erro crítico. Por favor, recarregue a página.
        </p>
      </div>
    </div>
  </div>
);

/**
 * Componente de fallback para erros de componente
 */
export const ComponentErrorFallback: React.FC = () => (
  <div className='p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md'>
    <div className='flex'>
      <AlertTriangle className='w-4 h-4 text-yellow-400 mr-2' />
      <p className='text-sm text-yellow-800 dark:text-yellow-200'>Erro ao carregar componente</p>
    </div>
  </div>
);

/**
 * Função utilitária para obter o componente de fallback baseado no nível
 */
export const getErrorFallback = (level: 'page' | 'component' | 'critical') => {
  switch (level) {
    case 'page':
      return <PageErrorFallback />;
    case 'critical':
      return <CriticalErrorFallback />;
    default:
      return <ComponentErrorFallback />;
  }
};
