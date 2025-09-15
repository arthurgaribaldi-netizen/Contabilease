'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
          
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
          console.log('FID:', entry.processingStart - entry.startTime);
        }
        
        if (entry.entryType === 'layout-shift') {
          console.log('CLS:', entry.value);
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration > 1000) {
            console.warn('Slow resource:', resource.name, resource.duration);
          }
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Monitor navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          console.log('Navigation timing:', {
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
