/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

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

interface VirtualAmortizationTableProps {
  contractId: string;
  currencyCode?: string;
  height?: number;
  itemHeight?: number;
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

export default function VirtualAmortizationTable({
  contractId,
  currencyCode = 'BRL',
  height = 600,
  itemHeight = 50,
}: VirtualAmortizationTableProps) {
  const [amortizationData, setAmortizationData] = useState<AmortizationPeriod[]>([]);
  const [summary, setSummary] = useState<AmortizationSummary | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  }, [currencyCode]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  // Fetch amortization data
  const fetchAmortizationData = useCallback(async (page: number = 1, limit: number = 100) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/contracts/${contractId}/amortization?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch amortization data');
      }

      const result = await response.json();
      setAmortizationData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/amortization/summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary data');
      }

      const result = await response.json();
      setSummary(result.summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, [contractId]);

  // Load data on mount
  useEffect(() => {
    fetchAmortizationData(currentPage);
    fetchSummary();
  }, [fetchAmortizationData, fetchSummary, currentPage]);

  // Row renderer for virtual scrolling
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const period = amortizationData[index];
    
    if (!period) {
      return (
        <div style={style} className="flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
        </div>
      );
    }

    return (
      <div style={style} className="flex items-center border-b border-gray-200 hover:bg-gray-50">
        <div className="flex-1 px-6 py-3 text-sm font-medium text-gray-900">
          {period.period}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-500">
          {formatDate(period.date)}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-900 text-right">
          {formatCurrency(period.beginning_liability)}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-900 text-right">
          {formatCurrency(period.interest_expense)}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-900 text-right">
          {formatCurrency(period.principal_payment)}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-900 text-right">
          {formatCurrency(period.ending_liability)}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-900 text-right">
          {formatCurrency(period.beginning_asset)}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-900 text-right">
          {formatCurrency(period.amortization)}
        </div>
        <div className="flex-1 px-6 py-3 text-sm text-gray-900 text-right">
          {formatCurrency(period.ending_asset)}
        </div>
      </div>
    );
  }, [amortizationData, formatCurrency, formatDate]);

  // Header component
  const TableHeader = useMemo(() => (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="flex items-center">
        <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Período
        </div>
        <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Data
        </div>
        <div className="flex-1 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Passivo Inicial
        </div>
        <div className="flex-1 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Juros
        </div>
        <div className="flex-1 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Principal
        </div>
        <div className="flex-1 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Passivo Final
        </div>
        <div className="flex-1 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ativo Inicial
        </div>
        <div className="flex-1 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Amortização
        </div>
        <div className="flex-1 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ativo Final
        </div>
      </div>
    </div>
  ), []);

  if (loading && amortizationData.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tabela de Amortização IFRS 16</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tabela de Amortização IFRS 16</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Erro ao carregar dados: {error}</p>
            <button
              onClick={() => fetchAmortizationData(currentPage)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Tabela de Amortização IFRS 16</h3>
          {pagination && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {pagination.totalItems} períodos
              </span>
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Virtual scrolling table */}
      <div className="overflow-hidden">
        {TableHeader}
        <List
          height={height}
          itemCount={amortizationData.length}
          itemSize={itemHeight}
          width="100%"
        >
          {Row}
        </List>
      </div>

      {/* Summary Footer */}
      {summary && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total de Juros:</span>
              <div className="font-medium text-gray-900">
                {formatCurrency(summary.total_interest_expense)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Total Principal:</span>
              <div className="font-medium text-gray-900">
                {formatCurrency(summary.total_principal_payments)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Total Pagamentos:</span>
              <div className="font-medium text-gray-900">
                {formatCurrency(summary.total_lease_payments)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Taxa Efetiva:</span>
              <div className="font-medium text-gray-900">
                {summary.effective_interest_rate_annual.toFixed(4)}% a.a.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
