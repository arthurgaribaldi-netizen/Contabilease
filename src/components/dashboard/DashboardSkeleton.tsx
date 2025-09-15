'use client';

import { cn } from '@/lib/utils';

interface DashboardSkeletonProps {
  className?: string;
}

export default function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Skeleton */}
      <div className='md:flex md:items-center md:justify-between'>
        <div className='min-w-0 flex-1'>
          <div className='h-8 bg-muted rounded w-64 mb-2 animate-pulse'></div>
          <div className='h-4 bg-muted rounded w-96 animate-pulse'></div>
        </div>
        <div className='mt-4 flex md:ml-4 md:mt-0 space-x-3'>
          <div className='h-10 bg-muted rounded w-24 animate-pulse'></div>
          <div className='h-10 bg-muted rounded w-32 animate-pulse'></div>
        </div>
      </div>

      {/* Main Stats Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className='bg-card border border-border rounded-lg p-6'>
            <div className='h-6 bg-muted rounded w-24 mb-2 animate-pulse'></div>
            <div className='h-8 bg-muted rounded w-16 mb-1 animate-pulse'></div>
            <div className='h-4 bg-muted rounded w-20 animate-pulse'></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-card border border-border rounded-lg p-6'>
          <div className='h-6 bg-muted rounded w-32 mb-4 animate-pulse'></div>
          <div className='h-64 bg-muted rounded animate-pulse'></div>
        </div>
        <div className='bg-card border border-border rounded-lg p-6'>
          <div className='h-6 bg-muted rounded w-32 mb-4 animate-pulse'></div>
          <div className='h-64 bg-muted rounded animate-pulse'></div>
        </div>
      </div>

      {/* Recent Contracts Skeleton */}
      <div className='bg-card border border-border rounded-lg p-6'>
        <div className='h-6 bg-muted rounded w-40 mb-6 animate-pulse'></div>
        <div className='space-y-4'>
          {[1, 2, 3].map(i => (
            <div key={i} className='flex items-center justify-between p-4 border border-border rounded-lg'>
              <div className='flex-1'>
                <div className='h-4 bg-muted rounded w-48 mb-2 animate-pulse'></div>
                <div className='h-3 bg-muted rounded w-32 animate-pulse'></div>
              </div>
              <div className='h-6 bg-muted rounded w-16 animate-pulse'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
