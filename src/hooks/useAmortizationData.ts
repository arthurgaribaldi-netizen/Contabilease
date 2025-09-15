import { useAmortizationCache } from '@/lib/cache/amortization-cache';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface AmortizationPeriod {
  period: number;
  date: string;
  beginning_liability: number;
  interest_expense: number;
  principal_payment: number;
  ending_liability: number;
  beginning_asset: number;
  amortization: number;
  ending_asset: number;
}

interface AmortizationSummary {
  lease_liability_initial: number;
  right_of_use_asset_initial: number;
  total_interest_expense: number;
  total_principal_payments: number;
  total_lease_payments: number;
  effective_interest_rate_annual: number;
  effective_interest_rate_monthly: number;
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseAmortizationDataOptions {
  contractId: string;
  page?: number;
  limit?: number;
  enableCache?: boolean;
  autoFetch?: boolean;
}

interface UseAmortizationDataReturn {
  // Data
  data: AmortizationPeriod[];
  summary: AmortizationSummary | null;
  pagination: PaginationInfo | null;
  
  // Loading states
  loading: boolean;
  summaryLoading: boolean;
  
  // Error states
  error: string | null;
  summaryError: string | null;
  
  // Actions
  fetchData: (page?: number) => Promise<void>;
  fetchSummary: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Cache utilities
  clearCache: () => void;
  isCached: boolean;
}

export function useAmortizationData({
  contractId,
  page = 1,
  limit = 12,
  enableCache = true,
  autoFetch = true,
}: UseAmortizationDataOptions): UseAmortizationDataReturn {
  const [data, setData] = useState<AmortizationPeriod[]>([]);
  const [summary, setSummary] = useState<AmortizationSummary | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const { getCachedData, setCachedData, hasCachedData, clearContractCache } = useAmortizationCache();

  // Memoized cache keys
  const dataCacheKey = useMemo(
    () => `amortization:${contractId}:${page}:${limit}`,
    [contractId, page, limit]
  );
  
  const summaryCacheKey = useMemo(
    () => `amortization:summary:${contractId}`,
    [contractId]
  );

  // Check if data is cached
  const isCached = useMemo(() => {
    return enableCache && hasCachedData(dataCacheKey);
  }, [enableCache, hasCachedData, dataCacheKey]);

  // Fetch amortization data
  const fetchData = useCallback(async (targetPage: number = page) => {
    if (!contractId) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (enableCache) {
        const cacheKey = `amortization:${contractId}:${targetPage}:${limit}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          setData(cachedData.data);
          setPagination(cachedData.pagination);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await fetch(
        `/api/contracts/${contractId}/amortization?page=${targetPage}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch amortization data: ${response.statusText}`);
      }

      const result = await response.json();
      
      setData(result.data);
      setPagination(result.pagination);

      // Cache the result
      if (enableCache) {
        const cacheKey = `amortization:${contractId}:${targetPage}:${limit}`;
        setCachedData(cacheKey, result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contractId, page, limit, enableCache, getCachedData, setCachedData]);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    if (!contractId) return;

    try {
      setSummaryLoading(true);
      setSummaryError(null);

      // Check cache first
      if (enableCache) {
        const cachedSummary = getCachedData(summaryCacheKey);
        
        if (cachedSummary) {
          setSummary(cachedSummary.summary);
          setSummaryLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await fetch(`/api/contracts/${contractId}/amortization/summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch summary data: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSummary(result.summary);

      // Cache the result
      if (enableCache) {
        setCachedData(summaryCacheKey, result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSummaryError(errorMessage);
    } finally {
      setSummaryLoading(false);
    }
  }, [contractId, enableCache, getCachedData, setCachedData, summaryCacheKey]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([fetchData(page), fetchSummary()]);
  }, [fetchData, fetchSummary, page]);

  // Clear cache
  const clearCache = useCallback(() => {
    clearContractCache(contractId);
  }, [clearContractCache, contractId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && contractId) {
      fetchData(page);
      fetchSummary();
    }
  }, [autoFetch, contractId, page, fetchData, fetchSummary]);

  return {
    data,
    summary,
    pagination,
    loading,
    summaryLoading,
    error,
    summaryError,
    fetchData,
    fetchSummary,
    refresh,
    clearCache,
    isCached,
  };
}
