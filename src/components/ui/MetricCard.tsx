'use client';

import {
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  className = '',
  onClick,
  loading = false,
}: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
      },
      green: {
        bg: 'bg-green-50',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
      },
      yellow: {
        bg: 'bg-yellow-50',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-100',
      },
      red: {
        bg: 'bg-red-50',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        text: 'text-red-600',
        border: 'border-red-200',
        hover: 'hover:bg-red-100',
      },
      purple: {
        bg: 'bg-purple-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100',
      },
      indigo: {
        bg: 'bg-indigo-50',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        hover: 'hover:bg-indigo-100',
      },
    };
    return colors[color];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: {
        container: 'p-4',
        icon: 'h-6 w-6',
        title: 'text-sm',
        value: 'text-lg',
        subtitle: 'text-xs',
      },
      md: {
        container: 'p-5',
        icon: 'h-8 w-8',
        title: 'text-sm',
        value: 'text-2xl',
        subtitle: 'text-xs',
      },
      lg: {
        container: 'p-6',
        icon: 'h-10 w-10',
        title: 'text-base',
        value: 'text-3xl',
        subtitle: 'text-sm',
      },
    };
    return sizes[size];
  };

  const colorClasses = getColorClasses();
  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow border ${colorClasses.border} ${sizeClasses.container} ${className}`}
      >
        <div className='animate-pulse'>
          <div className='flex items-center'>
            <div className={`${colorClasses.iconBg} rounded-lg p-2`}>
              <div className={`h-6 w-6 bg-gray-300 rounded`}></div>
            </div>
            <div className='ml-4 flex-1'>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-6 bg-gray-200 rounded w-1/2'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow border ${colorClasses.border} ${sizeClasses.container} transition-all duration-200 ${
        onClick ? `cursor-pointer ${colorClasses.hover}` : ''
      } ${className}`}
      onClick={onClick}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
      }}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          {Icon && (
            <div className={`${colorClasses.iconBg} rounded-lg p-2 mr-4`}>
              <Icon className={`${sizeClasses.icon} ${colorClasses.iconColor}`} />
            </div>
          )}
          <div className='flex-1'>
            <h3 className={`${sizeClasses.title} font-medium text-gray-500 mb-1`}>{title}</h3>
            <p className={`${sizeClasses.value} font-bold text-gray-900`}>{value}</p>
            {subtitle && <p className={`${sizeClasses.subtitle} text-gray-400 mt-1`}>{subtitle}</p>}
          </div>
        </div>

        {trend && (
          <div className='flex items-center'>
            <div className={`flex items-center ${colorClasses.text}`}>
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className='h-4 w-4 mr-1' />
              ) : (
                <ArrowTrendingDownIcon className='h-4 w-4 mr-1' />
              )}
              <span className='text-sm font-medium'>{trend.value}%</span>
            </div>
          </div>
        )}

        {onClick && <ArrowRightIcon className='h-5 w-5 text-gray-400 ml-2' />}
      </div>
    </div>
  );
}

// Componente para exibir múltiplas métricas em grid
interface MetricGridProps {
  metrics: Omit<MetricCardProps, 'className'>[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ metrics, columns = 4, className = '' }: MetricGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-5 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} className='animate-fade-in' />
      ))}
    </div>
  );
}
