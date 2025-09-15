'use client';

import { useSustainableDesign } from '@/lib/sustainable-design';
import { cn } from '@/lib/utils';
import { Battery0Icon, Battery100Icon, Battery50Icon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface EnergyIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function EnergyIndicator({ className, showDetails = false }: EnergyIndicatorProps) {
  const { metrics, config, setEnergyMode } = useSustainableDesign();

  const getEnergyLevel = () => {
    if (metrics.energyScore >= 80) return 'high';
    if (metrics.energyScore >= 50) return 'medium';
    return 'low';
  };

  const getEnergyIcon = () => {
    const level = getEnergyLevel();
    switch (level) {
      case 'high':
        return <Battery100Icon className='h-5 w-5 text-green-600' />;
      case 'medium':
        return <Battery50Icon className='h-5 w-5 text-yellow-600' />;
      case 'low':
        return <Battery0Icon className='h-5 w-5 text-red-600' />;
    }
  };

  const getEnergyColor = () => {
    const level = getEnergyLevel();
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    }
  };

  const getModeColor = () => {
    switch (config.energyMode) {
      case 'eco':
        return 'text-green-600';
      case 'performance':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className='flex items-center space-x-1'>
        {getEnergyIcon()}
        <span className='text-sm font-medium'>{Math.round(metrics.energyScore)}%</span>
      </div>

      <div className='flex items-center space-x-1'>
        <SparklesIcon className='h-4 w-4 text-green-600' />
        <span className={cn('text-xs font-medium', getModeColor())}>
          {config.energyMode === 'eco'
            ? 'ECO'
            : config.energyMode === 'performance'
              ? 'PERF'
              : 'NORMAL'}
        </span>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className='flex items-center space-x-2 text-xs text-muted-foreground'
        >
          <span>{metrics.renderTime.toFixed(0)}ms</span>
          <span>•</span>
          <span>{metrics.networkRequests} req</span>
        </motion.div>
      )}
    </div>
  );
}
