'use client';

import { useEffect } from 'react';

interface ResourcePreloaderProps {
  resources?: string[];
}

export default function ResourcePreloader({ resources = [] }: ResourcePreloaderProps) {
  useEffect(() => {
    // Preload critical resources
    const criticalResources = [
      '/fonts/inter-var.woff2',
      '/api/contracts',
      '/api/health',
      ...resources,
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      link.as = resource.includes('.woff') ? 'font' : 'fetch';
      if (resource.includes('.woff')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });

    // Preload critical routes
    const criticalRoutes = [
      '/dashboard',
      '/contracts',
      '/contracts/new',
    ];

    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Preload critical images (if any)
    const criticalImages = [
      // Add any critical images here
    ];

    criticalImages.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = image;
      link.as = 'image';
      document.head.appendChild(link);
    });

    // Preload critical CSS
    const criticalCSS = [
      // Add any critical CSS files here
    ];

    criticalCSS.forEach(css => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = css;
      link.as = 'style';
      document.head.appendChild(link);
    });

    // Preload critical JavaScript modules
    const criticalModules = [
      'framer-motion',
      'chart.js',
      'three',
    ];

    criticalModules.forEach(module => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = `/node_modules/${module}/index.js`;
      document.head.appendChild(link);
    });

  }, [resources]);

  return null;
}
