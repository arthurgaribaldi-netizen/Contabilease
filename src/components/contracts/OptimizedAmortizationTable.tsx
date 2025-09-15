/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { useAmortizationData } from '@/hooks/useAmortizationData';
import { useCallback, useMemo, useState } from 'react';

interface OptimizedAmortizationTableProps {
  contractId: string;
  currencyCode?: string;
  itemsPerPage?: number;
  enableCache?: boolean;
}

export default function OptimizedAmortizationTable({
  contractId,
  currencyCode = 'BRL',
  itemsPerPage = 12,
  enableCache = true,
}: OptimizedAmortizationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: amortizationData,
    summary,
    pagination,
    loading,
    summaryLoading,
    error,
    summaryError,
    fetchData,
    refresh,
    clearCache,
    isCached,
  } = useAmortizationData({
    contractId,
    page: currentPage,
    limit: itemsPerPage,
    enableCache,
    autoFetch: true,
  });

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  }, [currencyCode]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  const goToPage = useCallback((page: number) => {
    if (pagination) {
      setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
    }
  }, [pagination]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    if (pagination) {
      setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1));
    }
  }, [pagination]);

  // Memoized table header
  const tableHeader = useMemo(() => (
    <thead className='bg-gray-50'>
      <tr>
        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Período
        </th>
        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Data
        </th>
        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Passivo Inicial
        </th>
        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Juros
        </th>
        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Principal
        </th>
        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Passivo Final
        </th>
        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Ativo Inicial
        </th>
        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Amortização
        </th>
        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Ativo Final
        </th>
      </tr>
    </thead>
  ), []);

  // Memoized table rows
  const tableRows = useMemo(() => {
    if (loading && amortizationData.length === 0) {
      return Array.from({ length: itemsPerPage }, (_, i) => (
        <tr key={`loading-${i}`} className='animate-pulse'>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-8'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-24'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-24'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-24'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-24'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
          </td>
          <td className='px-6 py-4'>
            <div className='h-4 bg-gray-200 rounded w-24'></div>
          </td>
        </tr>
      ));
    }

    return amortizationData.map(period => (
      <tr key={period.period} className='hover:bg-gray-50 transition-colors'>
        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
          {period.period}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {formatDate(period.date)}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
          {formatCurrency(period.beginning_liability)}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
          {formatCurrency(period.interest_expense)}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
          {formatCurrency(period.principal_payment)}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
          {formatCurrency(period.ending_liability)}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
          {formatCurrency(period.beginning_asset)}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
          {formatCurrency(period.amortization)}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
          {formatCurrency(period.ending_asset)}
        </td>
      </tr>
    ));
  }, [amortizationData, loading, itemsPerPage, formatCurrency, formatDate]);

  // Memoized summary section
  const summarySection = useMemo(() => {
    if (!summary) return null;

    return (
      <div className='bg-gray-50 px-6 py-4 border-t border-gray-200'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <span className='text-gray-500'>Total de Juros:</span>
            <div className='font-medium text-gray-900'>
              {formatCurrency(summary.total_interest_expense)}
            </div>
          </div>
          <div>
            <span className='text-gray-500'>Total Principal:</span>
            <div className='font-medium text-gray-900'>
              {formatCurrency(summary.total_principal_payments)}
            </div>
          </div>
          <div>
            <span className='text-gray-500'>Total Pagamentos:</span>
            <div className='font-medium text-gray-900'>
              {formatCurrency(summary.total_lease_payments)}
            </div>
          </div>
          <div>
            <span className='text-gray-500'>Taxa Efetiva:</span>
            <div className='font-medium text-gray-900'>
              {summary.effective_interest_rate_annual.toFixed(4)}% a.a.
            </div>
          </div>
        </div>
      </div>
    );
  }, [summary, formatCurrency]);

  // Show error state
  if (error) {
    return (
      <div className='bg-white shadow rounded-lg'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>Tabela de Amortização IFRS 16</h3>
        </div>
        <div className='flex items-center justify-center h-64'>
          <div className='text-red-600 text-center'>
            <svg className='w-8 h-8 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <p className='text-sm mb-2'>Erro ao carregar dados: {error}</p>
            <button
              onClick={refresh}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>Tabela de Amortização IFRS 16</h3>
          <div className='flex items-center space-x-2'>
            {pagination && (
              <span className='text-sm text-gray-500'>
                Página {currentPage} de {pagination.totalPages}
              </span>
            )}
            {loading && (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
            )}
            {isCached && (
              <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded'>
                Cache
              </span>
            )}
            <button
              onClick={clearCache}
              className='text-xs text-gray-500 hover:text-gray-700'
              title='Limpar cache'
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          {tableHeader}
          <tbody className='bg-white divide-y divide-gray-200'>
            {tableRows}
          </tbody>
        </table>
      </div>

      {summarySection}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className='bg-white px-6 py-3 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || loading}
                className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Anterior
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === pagination.totalPages || loading}
                className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Próximo
              </button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>
                  Mostrando <span className='font-medium'>{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                  <span className='font-medium'>
                    {Math.min(currentPage * itemsPerPage, pagination.totalItems)}
                  </span>{' '}
                  de{' '}
                  <span className='font-medium'>{pagination.totalItems}</span> períodos
                </p>
              </div>
              <div>
                <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1 || loading}
                    className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        disabled={loading}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === pagination.totalPages || loading}
                    className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
