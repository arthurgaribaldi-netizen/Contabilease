'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useIntersectionObserver } from '@/hooks/usePerformance';
import { lazy, Suspense, useRef } from 'react';

// Lazy load chart components
const AmortizationChart = lazy(() => import('./AmortizationChart'));
const ComplianceChart = lazy(() => import('./ComplianceChart'));
const FinancialOverviewChart = lazy(() => import('./FinancialOverviewChart'));

interface LazyChartProps {
  type: 'amortization' | 'compliance' | 'financial';
  data: any;
  className?: string;
  [key: string]: any;
}

export default function LazyChart({ type, data, className = '', ...props }: LazyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { hasIntersected } = useIntersectionObserver(chartRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  const renderChart = () => {
    if (!hasIntersected) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-gray-500">Chart will load when visible</div>
        </div>
      );
    }

    const ChartComponent = (() => {
      switch (type) {
        case 'amortization':
          return AmortizationChart;
        case 'compliance':
          return ComplianceChart;
        case 'financial':
          return FinancialOverviewChart;
        default:
          return AmortizationChart;
      }
    })();

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <ChartComponent data={data} className={className} {...props} />
      </Suspense>
    );
  };

  return (
    <div ref={chartRef} className={className}>
      {renderChart()}
    </div>
  );
}

// Hook para preload de charts
export function useChartPreload() {
  const preloadedCharts = useRef<Set<string>>(new Set());

  const preloadChart = (type: string) => {
    if (preloadedCharts.current.has(type)) return;

    switch (type) {
      case 'amortization':
        import('./AmortizationChart');
        break;
      case 'compliance':
        import('./ComplianceChart');
        break;
      case 'financial':
        import('./FinancialOverviewChart');
        break;
    }

    preloadedCharts.current.add(type);
  };

  return { preloadChart };
}
