/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * Otimizações de Bundle e Lazy Loading
 * Carregamento sob demanda de componentes pesados
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { logger } from './logger';

// Componentes que devem ser carregados sob demanda
export const LazyComponents = {
  // Charts - carregamento sob demanda
  AmortizationChart: lazy(() => 
    import('@/components/charts/AmortizationChart').catch(error => {
      logger.error('Failed to load AmortizationChart', { error });
      return { default: () => <div>Erro ao carregar gráfico</div> };
    })
  ),
  
  FinancialOverviewChart: lazy(() => 
    import('@/components/charts/FinancialOverviewChart').catch(error => {
      logger.error('Failed to load FinancialOverviewChart', { error });
      return { default: () => <div>Erro ao carregar gráfico</div> };
    })
  ),

  ComplianceChart: lazy(() => 
    import('@/components/charts/ComplianceChart').catch(error => {
      logger.error('Failed to load ComplianceChart', { error });
      return { default: () => <div>Erro ao carregar gráfico</div> };
    })
  ),

  // Componentes 3D - carregamento sob demanda
  InteractiveDemo: lazy(() => 
    import('@/components/landing/InteractiveDemo').catch(error => {
      logger.error('Failed to load InteractiveDemo', { error });
      return { default: () => <div>Demo indisponível</div> };
    })
  ),

  // Formulários complexos
  ContractWizard: lazy(() => 
    import('@/components/contracts/ContractWizard').catch(error => {
      logger.error('Failed to load ContractWizard', { error });
      return { default: () => <div>Formulário indisponível</div> };
    })
  ),

  IFRS16ContractForm: lazy(() => 
    import('@/components/contracts/IFRS16ContractForm').catch(error => {
      logger.error('Failed to load IFRS16ContractForm', { error });
      return { default: () => <div>Formulário indisponível</div> };
    })
  ),

  // Tabelas com virtualização
  VirtualAmortizationTable: lazy(() => 
    import('@/components/contracts/VirtualAmortizationTable').catch(error => {
      logger.error('Failed to load VirtualAmortizationTable', { error });
      return { default: () => <div>Tabela indisponível</div> };
    })
  ),

  OptimizedAmortizationTable: lazy(() => 
    import('@/components/contracts/OptimizedAmortizationTable').catch(error => {
      logger.error('Failed to load OptimizedAmortizationTable', { error });
      return { default: () => <div>Tabela indisponível</div> };
    })
  ),

  // Componentes de onboarding
  OnboardingTour: lazy(() => 
    import('@/components/onboarding/OnboardingTour').catch(error => {
      logger.error('Failed to load OnboardingTour', { error });
      return { default: () => <div>Tour indisponível</div> };
    })
  ),

  // Componentes de performance
  PerformanceMonitor: lazy(() => 
    import('@/components/performance/PerformanceMonitor').catch(error => {
      logger.error('Failed to load PerformanceMonitor', { error });
      return { default: () => null };
    })
  ),
};

// HOC para lazy loading com fallback
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ComponentType
) {
  return function LazyComponent(props: P) {
    return (
      <Suspense fallback={fallback ? <fallback /> : <DefaultFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Fallback padrão
function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Carregando...</span>
    </div>
  );
}

// Fallback para gráficos
export function ChartFallback() {
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-pulse bg-gray-300 rounded h-4 w-32 mx-auto mb-2"></div>
        <div className="animate-pulse bg-gray-300 rounded h-4 w-24 mx-auto"></div>
      </div>
    </div>
  );
}

// Fallback para tabelas
export function TableFallback() {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="rounded bg-gray-300 h-4 flex-1"></div>
            <div className="rounded bg-gray-300 h-4 w-20"></div>
            <div className="rounded bg-gray-300 h-4 w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fallback para formulários
export function FormFallback() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="rounded bg-gray-300 h-4 w-24"></div>
          <div className="rounded bg-gray-300 h-10 w-full"></div>
        </div>
      ))}
    </div>
  );
}

// Preload de componentes críticos
export function preloadCriticalComponents() {
  if (typeof window === 'undefined') return;

  // Preload apenas quando necessário
  const preloadComponent = (importFn: () => Promise<any>) => {
    importFn().catch(error => {
      logger.warn('Failed to preload component', { error });
    });
  };

  // Preload baseado na rota atual
  const pathname = window.location.pathname;
  
  if (pathname.includes('/contracts')) {
    preloadComponent(() => import('@/components/contracts/ContractWizard'));
    preloadComponent(() => import('@/components/contracts/VirtualAmortizationTable'));
  }
  
  if (pathname.includes('/dashboard')) {
    preloadComponent(() => import('@/components/charts/FinancialOverviewChart'));
    preloadComponent(() => import('@/components/performance/PerformanceMonitor'));
  }
}

// Hook para carregamento sob demanda
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  deps: any[] = []
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    
    importFn()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(err => {
        logger.error('Failed to load lazy component', { error: err });
        setError(err);
        setLoading(false);
      });
  }, deps);

  return { Component, loading, error };
}

// Otimização de imports dinâmicos
export const dynamicImports = {
  // Charts
  charts: {
    AmortizationChart: () => import('@/components/charts/AmortizationChart'),
    FinancialOverviewChart: () => import('@/components/charts/FinancialOverviewChart'),
    ComplianceChart: () => import('@/components/charts/ComplianceChart'),
  },
  
  // 3D Components
  threeD: {
    InteractiveDemo: () => import('@/components/landing/InteractiveDemo'),
  },
  
  // Forms
  forms: {
    ContractWizard: () => import('@/components/contracts/ContractWizard'),
    IFRS16ContractForm: () => import('@/components/contracts/IFRS16ContractForm'),
  },
  
  // Tables
  tables: {
    VirtualAmortizationTable: () => import('@/components/contracts/VirtualAmortizationTable'),
    OptimizedAmortizationTable: () => import('@/components/contracts/OptimizedAmortizationTable'),
  },
  
  // Onboarding
  onboarding: {
    OnboardingTour: () => import('@/components/onboarding/OnboardingTour'),
  },
  
  // Performance
  performance: {
    PerformanceMonitor: () => import('@/components/performance/PerformanceMonitor'),
  },
};

// Bundle analyzer helper
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const totalSize = scripts.reduce((total, script) => {
    const src = script.getAttribute('src');
    if (src && src.includes('_next/static/chunks/')) {
      // Estimar tamanho baseado no nome do arquivo
      const size = src.includes('vendor') ? 500 : src.includes('framework') ? 100 : 50;
      return total + size;
    }
    return total;
  }, 0);

  logger.info('Bundle size analysis', {
    totalScripts: scripts.length,
    estimatedSizeKB: totalSize,
    chunks: scripts.length,
  });

  return {
    totalScripts: scripts.length,
    estimatedSizeKB: totalSize,
    chunks: scripts.length,
  };
}

// Otimização de recursos
export function optimizeResources() {
  if (typeof window === 'undefined') return;

  // Preload de recursos críticos
  const preloadResource = (href: string, as: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  };

  // Preload de fontes críticas
  preloadResource('/fonts/inter-var.woff2', 'font');
  
  // Preload de imagens críticas
  preloadResource('/og-image.jpg', 'image');
  
  // Preload de CSS crítico
  preloadResource('/_next/static/css/app.css', 'style');
}

// Inicialização de otimizações
export function initializeOptimizations() {
  if (typeof window === 'undefined') return;

  // Preload de componentes críticos
  preloadCriticalComponents();
  
  // Otimização de recursos
  optimizeResources();
  
  // Análise de bundle
  setTimeout(() => analyzeBundleSize(), 2000);
  
  logger.info('Bundle optimizations initialized');
}