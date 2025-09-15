'use client';

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface FinancialData {
  period: string;
  leaseLiability: number;
  rightOfUseAsset: number;
  interestExpense: number;
  depreciationExpense: number;
  totalExpenses: number;
}

interface FinancialOverviewChartProps {
  data: FinancialData[];
  className?: string;
}

export default function FinancialOverviewChart({
  data,
  className = '',
}: FinancialOverviewChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFilteredData = () => {
    if (selectedPeriod === 'all') return data;
    return data.filter(d => d.period === selectedPeriod);
  };

  const filteredData = getFilteredData();

  const getTotalLeaseLiability = () => {
    return filteredData.reduce((sum, d) => sum + d.leaseLiability, 0);
  };

  const getTotalRightOfUseAsset = () => {
    return filteredData.reduce((sum, d) => sum + d.rightOfUseAsset, 0);
  };

  const getTotalExpenses = () => {
    return filteredData.reduce((sum, d) => sum + d.totalExpenses, 0);
  };

  const getAverageExpenses = () => {
    return filteredData.length > 0 ? getTotalExpenses() / filteredData.length : 0;
  };

  const getTrend = () => {
    if (filteredData.length < 2) return 'stable';
    const first = filteredData[0].totalExpenses;
    const last = filteredData[filteredData.length - 1].totalExpenses;
    return last > first ? 'up' : last < first ? 'down' : 'stable';
  };

  const getTrendIcon = () => {
    const trend = getTrend();
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className='h-5 w-5 text-red-500' />;
      case 'down':
        return <ArrowTrendingDownIcon className='h-5 w-5 text-green-500' />;
      default:
        return <ChartBarIcon className='h-5 w-5 text-gray-500' />;
    }
  };

  const getTrendColor = () => {
    const trend = getTrend();
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendText = () => {
    const trend = getTrend();
    switch (trend) {
      case 'up':
        return 'Crescimento';
      case 'down':
        return 'Redução';
      default:
        return 'Estável';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <CurrencyDollarIcon className='h-6 w-6 text-gray-600 mr-2' />
          <h3 className='text-lg font-medium text-gray-900'>Visão Financeira Geral</h3>
        </div>
        <div className='flex items-center space-x-2'>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className='text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>Todos os Períodos</option>
            <option value='2024'>2024</option>
            <option value='2025'>2025</option>
            <option value='2026'>2026</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='bg-blue-50 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-blue-600 font-medium'>Passivo Total</p>
              <p className='text-2xl font-bold text-blue-900'>
                {formatCurrency(getTotalLeaseLiability())}
              </p>
            </div>
            <ChartBarIcon className='h-8 w-8 text-blue-500' />
          </div>
        </div>

        <div className='bg-green-50 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-green-600 font-medium'>Ativo Total</p>
              <p className='text-2xl font-bold text-green-900'>
                {formatCurrency(getTotalRightOfUseAsset())}
              </p>
            </div>
            <ChartBarIcon className='h-8 w-8 text-green-500' />
          </div>
        </div>

        <div className='bg-purple-50 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-purple-600 font-medium'>Despesas Totais</p>
              <p className='text-2xl font-bold text-purple-900'>
                {formatCurrency(getTotalExpenses())}
              </p>
            </div>
            <div className='flex items-center'>{getTrendIcon()}</div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className='bg-gray-50 rounded-lg p-4 mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-medium text-gray-900'>Tendência das Despesas</h4>
            <p className='text-sm text-gray-500'>
              Média por período: {formatCurrency(getAverageExpenses())}
            </p>
          </div>
          <div className='flex items-center'>
            {getTrendIcon()}
            <span className={`ml-2 text-sm font-medium ${getTrendColor()}`}>{getTrendText()}</span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium text-gray-900'>Detalhamento por Período</h4>
        <div className='space-y-2'>
          {filteredData.map((item, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
            >
              <div className='flex items-center space-x-4'>
                <div className='text-sm font-medium text-gray-900'>{item.period}</div>
                <div className='text-sm text-gray-500'>
                  Passivo: {formatCurrency(item.leaseLiability)}
                </div>
                <div className='text-sm text-gray-500'>
                  Ativo: {formatCurrency(item.rightOfUseAsset)}
                </div>
              </div>
              <div className='text-sm font-medium text-gray-900'>
                {formatCurrency(item.totalExpenses)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className='mt-6 pt-4 border-t border-gray-200'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-gray-500'>Períodos analisados:</span>
            <span className='ml-2 font-medium text-gray-900'>{filteredData.length}</span>
          </div>
          <div>
            <span className='text-gray-500'>Despesa média:</span>
            <span className='ml-2 font-medium text-gray-900'>
              {formatCurrency(getAverageExpenses())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
