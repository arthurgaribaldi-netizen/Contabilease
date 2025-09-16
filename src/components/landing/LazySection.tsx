'use client';

import { motion } from 'framer-motion';
import React, { Suspense, lazy } from 'react';

// Lazy load heavy components
const PricingSection = lazy(() => import('./PricingSection'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));
const DemoSection = lazy(() => import('./DemoSection'));

// Loading skeleton components
const PricingSkeleton = () => (
  <div className='py-20 bg-white'>
    <div className='container mx-auto max-w-7xl px-4'>
      <div className='text-center mb-16'>
        <div className='h-8 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse'></div>
        <div className='h-6 bg-gray-200 rounded w-80 mx-auto animate-pulse'></div>
      </div>
      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='bg-gray-100 rounded-2xl p-8 animate-pulse'>
            <div className='h-6 bg-gray-200 rounded mb-4'></div>
            <div className='h-8 bg-gray-200 rounded mb-2'></div>
            <div className='h-4 bg-gray-200 rounded mb-6'></div>
            <div className='space-y-3'>
              {[...Array(5)].map((_, j) => (
                <div key={j} className='h-4 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TestimonialsSkeleton = () => (
  <div className='py-20 bg-gray-50'>
    <div className='container mx-auto max-w-6xl px-4'>
      <div className='text-center mb-16'>
        <div className='h-8 bg-gray-200 rounded w-80 mx-auto mb-4 animate-pulse'></div>
        <div className='h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse'></div>
      </div>
      <div className='grid md:grid-cols-3 gap-8'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='bg-white rounded-xl p-8 animate-pulse'>
            <div className='flex mb-4'>
              {[...Array(5)].map((_, j) => (
                <div key={j} className='w-5 h-5 bg-gray-200 rounded mr-1'></div>
              ))}
            </div>
            <div className='space-y-3 mb-6'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </div>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-gray-200 rounded-full mr-4'></div>
              <div>
                <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-24'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DemoSkeleton = () => (
  <div className='py-20 bg-gradient-to-br from-blue-50 to-indigo-100'>
    <div className='container mx-auto max-w-6xl px-4'>
      <div className='text-center mb-16'>
        <div className='h-8 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse'></div>
        <div className='h-6 bg-gray-200 rounded w-80 mx-auto animate-pulse'></div>
      </div>
      <div className='grid lg:grid-cols-2 gap-12 items-center'>
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden animate-pulse'>
          <div className='aspect-video bg-gray-200'></div>
          <div className='p-6'>
            <div className='h-6 bg-gray-200 rounded mb-4'></div>
            <div className='space-y-3'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='flex items-center space-x-3'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full'></div>
                  <div className='h-4 bg-gray-200 rounded w-48'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='space-y-8'>
          <div>
            <div className='h-8 bg-gray-200 rounded w-80 mb-4 animate-pulse'></div>
            <div className='space-y-3'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (ref: React.RefObject<HTMLElement>, options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};

// Lazy section wrapper
export default function LazySection({
  children,
  fallback,
  className = '',
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const isIntersecting = useIntersectionObserver(ref, { threshold: 0.1 });

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 50 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Suspense fallback={fallback}>{isIntersecting ? children : fallback}</Suspense>
    </motion.section>
  );
}

// Export lazy sections
export const LazyPricingSection = () => (
  <LazySection fallback={<PricingSkeleton />} className='py-20 bg-white'>
    <PricingSection />
  </LazySection>
);

export const LazyTestimonialsSection = () => (
  <LazySection fallback={<TestimonialsSkeleton />} className='py-20 bg-gray-50'>
    <TestimonialsSection />
  </LazySection>
);

export const LazyDemoSection = () => (
  <LazySection
    fallback={<DemoSkeleton />}
    className='py-20 bg-gradient-to-br from-blue-50 to-indigo-100'
  >
    <DemoSection />
  </LazySection>
);
