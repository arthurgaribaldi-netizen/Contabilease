'use client';

import { ComponentType, Suspense, lazy } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyLoadProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function LazyLoad({ fallback = <LoadingSpinner />, children }: LazyLoadProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Higher-order component for lazy loading
export function withLazyLoad<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <LazyLoad fallback={fallback}>
        <Component {...props} />
      </LazyLoad>
    );
  };
}

// Utility function to create lazy components
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: T) {
    return (
      <LazyLoad fallback={fallback}>
        <LazyComponent {...props} />
      </LazyLoad>
    );
  };
}

// Preload function for critical components
export function preloadComponent(importFn: () => Promise<any>) {
  return () => {
    importFn();
  };
}
