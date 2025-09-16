'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export function LoadingSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-muted rounded';

  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-4',
    circular: 'rounded-full aspect-square',
  };

  const animationVariants = {
    pulse: {
      animate: {
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    wave: {
      animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
  };

  const style = {
    width: width || '100%',
    height: height || undefined,
    ...(animation === 'wave' && {
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      backgroundSize: '200% 100%',
    }),
  };

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      variants={animationVariants}
      animate='animate'
    />
  );
}

interface SkeletonGroupProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export function SkeletonGroup({ count = 3, className, itemClassName }: SkeletonGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} className={itemClassName} animation='wave' />
      ))}
    </div>
  );
}
