// Bundle optimization utilities

// Dynamic imports for code splitting
export const dynamicImports = {
  // Charts
  AmortizationChart: () => import('@/components/charts/AmortizationChart'),
  ComplianceChart: () => import('@/components/charts/ComplianceChart'),
  FinancialOverviewChart: () => import('@/components/charts/FinancialOverviewChart'),
  
  // Forms
  ContractForm: () => import('@/components/contracts/ContractForm'),
  ContractWizard: () => import('@/components/contracts/ContractWizard'),
  
  // UI Components
  ConfirmationModal: () => import('@/components/ui/ConfirmationModal'),
  LoadingSpinner: () => import('@/components/ui/LoadingSpinner'),
  
  // Pages
  Dashboard: () => import('@/app/[locale]/dashboard/page'),
  Contracts: () => import('@/app/[locale]/contracts/page'),
  Pricing: () => import('@/app/[locale]/pricing/page'),
};

// Preload critical components
export function preloadCriticalComponents() {
  if (typeof window === 'undefined') return;

  // Preload components that are likely to be used soon
  const criticalComponents = [
    dynamicImports.ContractForm,
    dynamicImports.ContractWizard,
    dynamicImports.LoadingSpinner,
  ];

  criticalComponents.forEach(importFn => {
    importFn().catch(console.error);
  });
}

// Preload components based on user interaction
export function preloadOnHover(element: HTMLElement, importFn: () => Promise<any>) {
  let hasPreloaded = false;

  const preload = () => {
    if (!hasPreloaded) {
      importFn().catch(console.error);
      hasPreloaded = true;
    }
  };

  element.addEventListener('mouseenter', preload, { once: true });
  element.addEventListener('focus', preload, { once: true });
}

// Preload components based on route
export function preloadRouteComponents(route: string) {
  if (typeof window === 'undefined') return;

  const routeComponents: Record<string, (() => Promise<any>)[]> = {
    '/dashboard': [
      dynamicImports.Dashboard,
      dynamicImports.FinancialOverviewChart,
    ],
    '/contracts': [
      dynamicImports.Contracts,
      dynamicImports.ContractForm,
      dynamicImports.ContractWizard,
    ],
    '/pricing': [
      dynamicImports.Pricing,
    ],
  };

  const components = routeComponents[route];
  if (components) {
    components.forEach(importFn => {
      importFn().catch(console.error);
    });
  }
}

// Bundle analyzer helper
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;

  // This would typically be used with webpack-bundle-analyzer
  console.log('Bundle analysis available in development mode');
}

// Tree shaking optimization
export const treeShakeableExports = {
  // Only export what's needed
  utils: {
    formatCurrency: (value: number, currency: string = 'BRL') => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
      }).format(value);
    },
    formatDate: (date: string | Date) => {
      return new Date(date).toLocaleDateString('pt-BR');
    },
  },
};

// Lazy load utilities
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: T) {
    return React.createElement(
      React.Suspense,
      { fallback: fallback || React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props)
    );
  };
}

// Performance monitoring
export function measureComponentPerformance(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return () => {};

  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    
    // Log slow components
    if (duration > 16) { // More than one frame
      console.warn(`[Performance Warning] ${componentName} took ${duration.toFixed(2)}ms to render`);
    }
  };
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const memory = (performance as any).memory;
  
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
    usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

// Cleanup utilities
export function cleanupResources() {
  // Clear any pending timeouts
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }

  // Clear any pending intervals
  const highestIntervalId = setInterval(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }
}

// Export all utilities
export default {
  dynamicImports,
  preloadCriticalComponents,
  preloadOnHover,
  preloadRouteComponents,
  analyzeBundleSize,
  treeShakeableExports,
  createLazyComponent,
  measureComponentPerformance,
  monitorMemoryUsage,
  cleanupResources,
};
