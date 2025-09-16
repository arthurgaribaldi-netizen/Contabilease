import { IFRS16CalculationResult } from '@/lib/calculations/ifrs16-basic';
import { Contract } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { useCallback, useEffect, useState } from 'react';

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  cacheSize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

interface CalculationResponse {
  contract_id: string;
  calculation: IFRS16CalculationResult;
  cached: boolean;
  cache_stats: CacheStats;
}

interface UseIFRS16CalculationsOptions {
  contractId?: string;
  contract?: Contract;
  autoCalculate?: boolean;
  ttl?: number;
}

interface UseIFRS16CalculationsReturn {
  result: IFRS16CalculationResult | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
  cacheStats: CacheStats | null;
  calculate: () => Promise<void>;
  clearCache: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook personalizado para cálculos IFRS 16 com cache
 */
export function useIFRS16Calculations({
  contractId,
  contract,
  autoCalculate = false,
  ttl,
}: UseIFRS16CalculationsOptions = {}): UseIFRS16CalculationsReturn {
  const [result, setResult] = useState<IFRS16CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);

  const calculate = useCallback(async () => {
    if (!contractId || !contract) {
      setError('Contract ID and contract data are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contracts/${contractId}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate IFRS 16 values');
      }

      const data: CalculationResponse = await response.json();

      setResult(data.calculation);
      setCached(data.cached);
      setCacheStats(data.cache_stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error(
        'Error calculating IFRS 16 values:',
        {
          component: 'useifrs16calculations',
          operation: 'calculateIFRS16Values',
        },
        err as Error
      );
    } finally {
      setLoading(false);
    }
  }, [contractId, contract]);

  const clearCache = useCallback(async () => {
    if (!contractId) return;

    try {
      const response = await fetch(`/api/cache/ifrs16?contract_id=${contractId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }

      // Refresh calculations after clearing cache
      await calculate();
    } catch (err) {
      logger.error(
        'Error clearing cache:',
        {
          component: 'useifrs16calculations',
          operation: 'clearCache',
        },
        err as Error
      );
    }
  }, [contractId, calculate]);

  const refresh = useCallback(async () => {
    // Force refresh by clearing cache first, then recalculating
    await clearCache();
  }, [clearCache]);

  // Auto-calculate when dependencies change
  useEffect(() => {
    if (autoCalculate && contractId && contract) {
      calculate();
    }
  }, [autoCalculate, contractId, contract, calculate]);

  return {
    result,
    loading,
    error,
    cached,
    cacheStats,
    calculate,
    clearCache,
    refresh,
  };
}

/**
 * Hook para obter estatísticas do cache
 */
export function useCacheStats() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cache/ifrs16');

      if (!response.ok) {
        throw new Error('Failed to fetch cache stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAllCache = useCallback(async () => {
    try {
      const response = await fetch('/api/cache/ifrs16', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }

      // Refresh stats after clearing
      await fetchStats();
    } catch (err) {
      logger.error(
        'Error clearing cache:',
        {
          component: 'useifrs16calculations',
          operation: 'clearAllCache',
        },
        err as Error
      );
    }
  }, [fetchStats]);

  const cleanupCache = useCallback(async () => {
    try {
      const response = await fetch('/api/cache/ifrs16', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cleanup' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cleanup cache');
      }

      // Refresh stats after cleanup
      await fetchStats();
    } catch (err) {
      logger.error(
        'Error cleaning up cache:',
        {
          component: 'useifrs16calculations',
          operation: 'cleanupCache',
        },
        err as Error
      );
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearAllCache,
    cleanupCache,
  };
}

/**
 * Hook para cálculos em tempo real com debounce
 */
export function useIFRS16RealtimeCalculations(
  contractId: string,
  contract: Contract | null,
  debounceMs: number = 500
) {
  const [result, setResult] = useState<IFRS16CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (!contractId || !contract) {
      setResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/contracts/${contractId}/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to calculate IFRS 16 values');
        }

        const data: CalculationResponse = await response.json();

        setResult(data.calculation);
        setCached(data.cached);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        logger.error(
          'Error calculating IFRS 16 values:',
          {
            component: 'useifrs16calculations',
            operation: 'calculateIFRS16ValuesDebounced',
          },
          err as Error
        );
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [contractId, contract, debounceMs]);

  return {
    result,
    loading,
    error,
    cached,
  };
}
