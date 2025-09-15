'use client';

import { useCallback, useEffect, useState } from 'react';

interface SustainableDesignConfig {
  reducedMotion: boolean;
  energyMode: 'normal' | 'eco' | 'performance';
  autoOptimize: boolean;
  darkModePreference: boolean;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  energyScore: number;
}

const defaultConfig: SustainableDesignConfig = {
  reducedMotion: false,
  energyMode: 'normal',
  autoOptimize: true,
  darkModePreference: false,
};

export function useSustainableDesign() {
  const [config, setConfig] = useState<SustainableDesignConfig>(defaultConfig);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    energyScore: 100,
  });

  // Detect user preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setConfig(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
      darkModePreference: darkModeQuery.matches,
    }));

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, darkModePreference: e.matches }));
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  // Monitor performance metrics
  const updateMetrics = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const renderTime =
        navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

      // Estimate memory usage (if available)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

      // Count network requests
      const networkRequests = performance.getEntriesByType('resource').length;

      // Calculate energy score (simplified)
      const energyScore = Math.max(0, 100 - renderTime / 100 - networkRequests / 10);

      setMetrics({
        renderTime,
        memoryUsage,
        networkRequests,
        energyScore,
      });
    }
  }, []);

  useEffect(() => {
    updateMetrics();

    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [updateMetrics]);

  // Optimize based on energy mode
  const getOptimizedSettings = useCallback(() => {
    const baseSettings = {
      animations: !config.reducedMotion,
      shadows: true,
      gradients: true,
      images: 'optimized',
      lazyLoading: true,
    };

    switch (config.energyMode) {
      case 'eco':
        return {
          ...baseSettings,
          animations: false,
          shadows: false,
          gradients: false,
          images: 'low-quality',
          lazyLoading: true,
        };
      case 'performance':
        return {
          ...baseSettings,
          animations: !config.reducedMotion,
          shadows: true,
          gradients: true,
          images: 'high-quality',
          lazyLoading: false,
        };
      default:
        return baseSettings;
    }
  }, [config]);

  // Apply sustainable optimizations
  const applyOptimizations = useCallback(() => {
    const settings = getOptimizedSettings();

    // Apply CSS custom properties for optimizations
    document.documentElement.style.setProperty(
      '--animation-duration',
      settings.animations ? '0.3s' : '0s'
    );
    document.documentElement.style.setProperty('--shadow-opacity', settings.shadows ? '0.1' : '0');
    document.documentElement.style.setProperty(
      '--gradient-opacity',
      settings.gradients ? '1' : '0'
    );

    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (settings.lazyLoading && !img.loading) {
        img.loading = 'lazy';
      }
      if (settings.images === 'low-quality') {
        img.style.imageRendering = 'pixelated';
      }
    });
  }, [getOptimizedSettings]);

  useEffect(() => {
    if (config.autoOptimize) {
      applyOptimizations();
    }
  }, [config, applyOptimizations]);

  const setEnergyMode = (mode: SustainableDesignConfig['energyMode']) => {
    setConfig(prev => ({ ...prev, energyMode: mode }));
  };

  const toggleAutoOptimize = () => {
    setConfig(prev => ({ ...prev, autoOptimize: !prev.autoOptimize }));
  };

  return {
    config,
    metrics,
    optimizedSettings: getOptimizedSettings(),
    setEnergyMode,
    toggleAutoOptimize,
    updateMetrics,
  };
}
