'use client';

import { logger } from '@/lib/logger';
import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          logger.debug('LCP metric recorded', {
            component: 'performance-monitor',
            operation: 'observePerformance',
            metricType: 'LCP',
            startTime: entry.startTime,
          });

          // Send to analytics if needed
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
              event_category: 'Performance',
              event_label: 'LCP',
              value: Math.round(entry.startTime),
            });
          }
        }

        if (entry.entryType === 'first-input') {
          logger.debug('FID metric recorded', {
            component: 'performance-monitor',
            operation: 'observePerformance',
            metricType: 'FID',
            processingTime: (entry as any).processingStart
              ? (entry as any).processingStart - entry.startTime
              : 0,
          });
        }

        if (entry.entryType === 'layout-shift') {
          logger.debug('CLS metric recorded', {
            component: 'performance-monitor',
            operation: 'observePerformance',
            metricType: 'CLS',
            value: (entry as any).value || 0,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration > 1000) {
            logger.warn('Slow resource detected', {
              component: 'performance-monitor',
              operation: 'observePerformance',
              resourceName: resource.name,
              duration: resource.duration,
            });
          }
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Monitor navigation timing
    const navigationObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          logger.debug('Navigation timing recorded', {
            component: 'performance-monitor',
            operation: 'observePerformance',
            domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
            loadComplete: nav.loadEventEnd - nav.loadEventStart,
            totalTime: nav.loadEventEnd - nav.fetchStart,
          });
        }
      }
    });

    navigationObserver.observe({ entryTypes: ['navigation'] });

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, []);

  return null;
}
