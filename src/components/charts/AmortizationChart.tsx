'use client';

import {
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AmortizationData {
  period: number;
  date: string;
  leaseLiability: number;
  rightOfUseAsset: number;
  interestExpense: number;
  depreciationExpense: number;
}

interface AmortizationChartProps {
  data: AmortizationData[];
  className?: string;
}

export default function AmortizationChart({ data, className = '' }: AmortizationChartProps) {
  const [viewMode, setViewMode] = useState<'liability' | 'asset' | 'expenses'>('liability');
  const [animatedBars, setAnimatedBars] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimatedBars(true), 100);
    return () => clearTimeout(timer);
  }, [viewMode]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    });
  };

  const getChartData = () => {
    switch (viewMode) {
      case 'liability':
        return data.map(d => ({ x: d.period, y: d.leaseLiability, label: formatDate(d.date) }));
      case 'asset':
        return data.map(d => ({ x: d.period, y: d.rightOfUseAsset, label: formatDate(d.date) }));
      case 'expenses':
        return data.map(d => ({
          x: d.period,
          y: d.interestExpense + d.depreciationExpense,
          label: formatDate(d.date),
        }));
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.y));
  const minValue = Math.min(...chartData.map(d => d.y));

  const getBarColor = () => {
    switch (viewMode) {
      case 'liability':
        return 'bg-gradient-to-t from-blue-600 to-blue-400';
      case 'asset':
        return 'bg-gradient-to-t from-green-600 to-green-400';
      case 'expenses':
        return 'bg-gradient-to-t from-purple-600 to-purple-400';
      default:
        return 'bg-gradient-to-t from-gray-600 to-gray-400';
    }
  };

  const getBarHoverColor = () => {
    switch (viewMode) {
      case 'liability':
        return 'from-blue-700 to-blue-500';
      case 'asset':
        return 'from-green-700 to-green-500';
      case 'expenses':
        return 'from-purple-700 to-purple-500';
      default:
        return 'from-gray-700 to-gray-500';
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'liability':
        return 'Passivo de Arrendamento';
      case 'asset':
        return 'Ativo de Direito de Uso';
      case 'expenses':
        return 'Despesas Totais';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <ChartBarIcon className='h-6 w-6 text-gray-600 mr-2' />
          <h3 className='text-lg font-medium text-gray-900'>{getTitle()}</h3>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => setViewMode('liability')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'liability'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Passivo
          </button>
          <button
            onClick={() => setViewMode('asset')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'asset'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ativo
          </button>
          <button
            onClick={() => setViewMode('expenses')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'expenses'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Despesas
          </button>
        </div>
      </div>

      <div className='space-y-4'>
        {/* Chart Bars */}
        <div className='flex items-end space-x-2 h-64 relative'>
          {chartData.map((item, index) => {
            const height = ((item.y - minValue) / (maxValue - minValue)) * 100;
            const isHovered = hoveredBar === index;
            const isAnimated = animatedBars;

            return (
              <div key={index} className='flex-1 flex flex-col items-center group'>
                <motion.div
                  className={`w-full ${isHovered ? `bg-gradient-to-t ${getBarHoverColor()}` : getBarColor()} rounded-t cursor-pointer shadow-lg`}
                  style={{
                    height: isAnimated ? `${Math.max(height, 5)}%` : '0%',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'height 0.8s ease-out, transform 0.2s ease-out',
                  }}
                  title={`Período ${item.x}: ${formatCurrency(item.y)}`}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* Tooltip */}
                {isHovered && (
                  <div className='absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 transform -translate-x-1/2 left-1/2'>
                    <div className='font-semibold'>{formatCurrency(item.y)}</div>
                    <div className='text-xs text-gray-300'>{item.label}</div>
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
                  </div>
                )}

                <div className='mt-2 text-xs text-gray-500 text-center group-hover:text-gray-700 transition-colors'>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className='grid grid-cols-3 gap-4 pt-6 border-t border-gray-200'>
          <div className='text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
            <div className='flex items-center justify-center mb-2'>
              <ArrowTrendingUpIcon className='h-5 w-5 text-green-600' />
            </div>
            <div className='text-sm text-gray-500 mb-1'>Valor Inicial</div>
            <div className='text-lg font-semibold text-gray-900'>
              {formatCurrency(chartData[0]?.y || 0)}
            </div>
          </div>
          <div className='text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
            <div className='flex items-center justify-center mb-2'>
              <ArrowTrendingDownIcon className='h-5 w-5 text-red-600' />
            </div>
            <div className='text-sm text-gray-500 mb-1'>Valor Final</div>
            <div className='text-lg font-semibold text-gray-900'>
              {formatCurrency(chartData[chartData.length - 1]?.y || 0)}
            </div>
          </div>
          <div className='text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
            <div className='flex items-center justify-center mb-2'>
              <ChartBarIcon className='h-5 w-5 text-blue-600' />
            </div>
            <div className='text-sm text-gray-500 mb-1'>Redução Total</div>
            <div className='text-lg font-semibold text-gray-900'>
              {formatCurrency((chartData[0]?.y || 0) - (chartData[chartData.length - 1]?.y || 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
