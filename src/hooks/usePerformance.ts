'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Hook para intersection observer (lazy loading)
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Hook para medir performance
export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(Date.now());
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - startTime.current;
    setRenderTime(duration);

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${duration}ms`);
    }

    // Reset start time for next render
    startTime.current = Date.now();
  });

  return renderTime;
}

// Hook para memoização inteligente
export function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  maxAge: number = 5000 // 5 seconds default
): T {
  const [value, setValue] = useState<T>(factory);
  const lastUpdate = useRef<number>(Date.now());
  const dependencies = useRef<React.DependencyList>(deps);

  useEffect(() => {
    const now = Date.now();
    const hasDepsChanged = 
      dependencies.current.length !== deps.length ||
      dependencies.current.some((dep, index) => dep !== deps[index]);

    if (hasDepsChanged || now - lastUpdate.current > maxAge) {
      setValue(factory());
      lastUpdate.current = now;
      dependencies.current = deps;
    }
  }, [factory, deps, maxAge]);

  return value;
}

// Hook para preload de recursos
export function usePreload() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return;

    const img = new Image();
    img.src = src;
    preloadedResources.current.add(src);
  }, []);

  const preloadScript = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
    preloadedResources.current.add(src);
  }, []);

  const preloadStylesheet = useCallback((href: string) => {
    if (preloadedResources.current.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
    preloadedResources.current.add(href);
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadStylesheet,
  };
}

// Hook para otimização de scroll
export function useScrollOptimization() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set new timeout
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return { scrollY, isScrolling };
}

// Hook para otimização de resize
export function useResizeOptimization() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return dimensions;
}
