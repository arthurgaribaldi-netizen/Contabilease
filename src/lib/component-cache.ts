import { ComponentType, ReactElement } from 'react';

interface CacheEntry<T> {
  component: ReactElement<T>;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface ComponentCacheOptions {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  maxAge: number; // Maximum age in milliseconds
}

class ComponentCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private options: ComponentCacheOptions;

  constructor(options: Partial<ComponentCacheOptions> = {}) {
    this.options = {
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
      maxAge: 30 * 60 * 1000, // 30 minutes
      ...options,
    };
  }

  private generateKey(props: any): string {
    return JSON.stringify(props);
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return (
      now - entry.timestamp > this.options.maxAge ||
      now - entry.lastAccessed > this.options.ttl
    );
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  get(props: any): ReactElement<T> | null {
    const key = this.generateKey(props);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update access info
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.component;
  }

  set(props: any, component: ReactElement<T>): void {
    const key = this.generateKey(props);

    // Cleanup expired entries
    this.cleanup();

    // Evict if cache is full
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      component,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): {
    size: number;
    hitRate: number;
    averageAge: number;
  } {
    const now = Date.now();
    let totalAge = 0;
    let totalAccesses = 0;

    for (const entry of this.cache.values()) {
      totalAge += now - entry.timestamp;
      totalAccesses += entry.accessCount;
    }

    return {
      size: this.cache.size,
      hitRate: totalAccesses > 0 ? totalAccesses / this.cache.size : 0,
      averageAge: this.cache.size > 0 ? totalAge / this.cache.size : 0,
    };
  }
}

// Global cache instance
const globalCache = new ComponentCache();

// Higher-order component for caching
export function withCache<P extends object>(
  Component: ComponentType<P>,
  options?: Partial<ComponentCacheOptions>
) {
  const cache = options ? new ComponentCache(options) : globalCache;

  return function CachedComponent(props: P) {
    // Try to get from cache
    const cachedComponent = cache.get(props);
    if (cachedComponent) {
      return cachedComponent;
    }

    // Create new component
    const component = React.createElement(Component, props);

    // Cache it
    cache.set(props, component);

    return component;
  };
}

// Hook for component caching
export function useComponentCache<T = any>(
  key: string,
  factory: () => ReactElement<T>,
  options?: Partial<ComponentCacheOptions>
) {
  const cache = options ? new ComponentCache(options) : globalCache;

  const cachedComponent = cache.get({ key });
  if (cachedComponent) {
    return cachedComponent;
  }

  const component = factory();
  cache.set({ key }, component);

  return component;
}

// Utility for memoizing expensive computations
export function useMemoizedComponent<T>(
  factory: () => ReactElement<T>,
  deps: React.DependencyList,
  cacheKey?: string
) {
  const cache = globalCache;
  const key = cacheKey || JSON.stringify(deps);

  const cachedComponent = cache.get({ key });
  if (cachedComponent) {
    return cachedComponent;
  }

  const component = factory();
  cache.set({ key }, component);

  return component;
}

// Cache management utilities
export const cacheManager = {
  clear: () => globalCache.clear(),
  getStats: () => globalCache.getStats(),
  size: () => globalCache.size(),
};

export default ComponentCache;
