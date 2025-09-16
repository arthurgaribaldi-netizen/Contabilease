'use client';

import { cn } from '@/lib/utils';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './animated-counter';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  animated?: boolean;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  format = 'number',
  icon: Icon,
  className,
  animated = true,
  delay = 0,
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ArrowTrendingUpIcon className='h-4 w-4' />;
      case 'decrease':
        return <ArrowTrendingDownIcon className='h-4 w-4' />;
      default:
        return null;
    }
  };

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('pt-BR');
    }
  };

  return (
    <motion.div
      className={cn(
        'p-6 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2 }}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-muted-foreground mb-2'>{title}</p>
          <div className='text-2xl font-bold text-foreground'>
            {animated ? (
              <AnimatedCounter
                value={value}
                duration={1}
                suffix={format === 'currency' ? '' : format === 'percentage' ? '%' : ''}
                prefix={format === 'currency' ? 'R$ ' : ''}
                decimals={format === 'currency' ? 2 : format === 'percentage' ? 1 : 0}
              />
            ) : (
              formatValue(value)
            )}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center mt-2 text-sm', getChangeColor())}>
              {getChangeIcon()}
              <span className='ml-1'>
                {changeType === 'increase' ? '+' : changeType === 'decrease' ? '-' : ''}
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className='ml-1 text-muted-foreground'>vs mês anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className='ml-4'>
            <Icon className='h-8 w-8 text-primary' />
          </div>
        )}
      </div>
    </motion.div>
  );
}
