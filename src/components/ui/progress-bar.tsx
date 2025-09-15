'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = true,
  animated = true,
  color = 'primary',
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className='flex justify-between text-sm text-muted-foreground mb-1'>
          <span>Progresso</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          className={cn('h-full rounded-full transition-colors duration-300', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: 'easeOut',
            delay: 0.2,
          }}
        />
      </div>
    </div>
  );
}
