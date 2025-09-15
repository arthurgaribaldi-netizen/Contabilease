interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class AmortizationCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Generate cache key for amortization data
  generateAmortizationKey(contractId: string, page: number, limit: number): string {
    return `amortization:${contractId}:${page}:${limit}`;
  }

  // Generate cache key for summary data
  generateSummaryKey(contractId: string): string {
    return `amortization:summary:${contractId}`;
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const amortizationCache = new AmortizationCache();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  amortizationCache.cleanup();
}, 10 * 60 * 1000);

// React hook for cached amortization data
export function useAmortizationCache() {
  const getCachedData = <T>(key: string): T | null => {
    return amortizationCache.get<T>(key);
  };

  const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
    amortizationCache.set(key, data, ttl);
  };

  const hasCachedData = (key: string): boolean => {
    return amortizationCache.has(key);
  };

  const clearCache = (): void => {
    amortizationCache.clear();
  };

  const clearContractCache = (contractId: string): void => {
    const stats = amortizationCache.getStats();
    stats.keys.forEach(key => {
      if (key.includes(contractId)) {
        amortizationCache.delete(key);
      }
    });
  };

  return {
    getCachedData,
    setCachedData,
    hasCachedData,
    clearCache,
    clearContractCache,
  };
}
