'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import * as React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  variant?: 'default' | 'circular' | 'rectangular';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animated = true, variant = 'default', ...props }, ref) => {
    const Comp = animated ? motion.div : 'div';

    const baseClasses = cn(
      'bg-gray-200 dark:bg-gray-700',
      {
        'rounded-md': variant === 'default',
        'rounded-full': variant === 'circular',
        'rounded-none': variant === 'rectangular',
      },
      className
    );

    const motionProps = animated
      ? {
          animate: {
            opacity: [0.5, 1, 0.5],
          },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }
      : {};

    return (
      <Comp
        ref={ref}
        className={baseClasses}
        {...motionProps}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card p-6 space-y-4', className)}
      {...props}
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
);
SkeletonCard.displayName = 'SkeletonCard';

const SkeletonTable = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-3', className)}
      {...props}
    >
      {/* Header */}
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
);
SkeletonTable.displayName = 'SkeletonTable';

const SkeletonForm = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-6', className)}
      {...props}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
);
SkeletonForm.displayName = 'SkeletonForm';

const SkeletonChart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    >
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="h-64 flex items-end space-x-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </div>
  )
);
SkeletonChart.displayName = 'SkeletonChart';

export {
    Skeleton,
    SkeletonCard, SkeletonChart, SkeletonForm, SkeletonTable
};

