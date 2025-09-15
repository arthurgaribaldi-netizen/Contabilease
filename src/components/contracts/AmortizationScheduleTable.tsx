'use client';

import { AMORTIZATION_CONSTANTS } from '@/lib/constants/amortization';
import { IFRS16CalculationResult } from '@/lib/schemas/ifrs16-lease';
import { useCallback, useEffect, useState } from 'react';

interface AmortizationScheduleTableProps {
  calculationResult?: IFRS16CalculationResult;
  contractId?: string;
  currencyCode?: string;
  enableLazyLoading?: boolean;
  itemsPerPage?: number;
}

export default function AmortizationScheduleTable({
  calculationResult,
  contractId,
  currencyCode = 'BRL',
  enableLazyLoading = false,
  itemsPerPage: propItemsPerPage = 12,
}: AmortizationScheduleTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(propItemsPerPage);
  const [lazyData, setLazyData] = useState<unknown[]>([]);
  const [lazySummary, setLazySummary] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Fetch lazy data
  const fetchLazyData = useCallback(async (page: number) => {
    if (!contractId || !enableLazyLoading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/contracts/${contractId}/amortization?page=${page}&limit=${itemsPerPage}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch amortization data');
      }

      const result = await response.json();
      setLazyData(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [contractId, enableLazyLoading, itemsPerPage]);

  // Fetch summary data for lazy loading
  const fetchLazySummary = useCallback(async () => {
    if (!contractId || !enableLazyLoading) return;

    try {
      const response = await fetch(`/api/contracts/${contractId}/amortization/summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary data');
      }

      const result = await response.json();
      setLazySummary(result.summary);
    } catch (err) {
      // Error is handled by the calling component
    }
  }, [contractId, enableLazyLoading]);

  // Load data on mount and page change
  useEffect(() => {
    if (enableLazyLoading && contractId) {
      void fetchLazyData(currentPage);
      void fetchLazySummary();
    }
  }, [enableLazyLoading, contractId, currentPage, fetchLazyData, fetchLazySummary]);

  // Determine data source and calculations
  const isLazyLoading = enableLazyLoading && contractId;
  const scheduleData = isLazyLoading ? lazyData : (calculationResult?.amortization_schedule ?? []);
  const summaryData = isLazyLoading ? lazySummary : calculationResult;
  
  const calculatedTotalPages = isLazyLoading 
    ? totalPages 
    : Math.ceil((calculationResult?.amortization_schedule.length ?? 0) / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchedule = isLazyLoading 
    ? scheduleData 
    : scheduleData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, calculatedTotalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(calculatedTotalPages, prev + 1));
  };

  // Show loading state
  if (loading && currentSchedule.length === 0) {
    return (
      <div className='bg-white shadow rounded-lg'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>Tabela de Amortização IFRS 16</h3>
        </div>
        <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
          <span className='ml-2 text-gray-600'>Carregando dados...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='bg-white shadow rounded-lg'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>Tabela de Amortização IFRS 16</h3>
        </div>
        <div className='flex items-center justify-center h-64'>
          <div className='text-red-600'>
            <svg className='w-8 h-8 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <p className='text-sm'>Erro ao carregar dados: {error}</p>
            <button
              onClick={() => void fetchLazyData(currentPage)}
              className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
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
            <span className='text-sm text-gray-500'>
              Página {currentPage} de {calculatedTotalPages}
            </span>
            {loading && (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600' />
            )}
            <div className='flex space-x-1'>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className='px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === calculatedTotalPages}
                className='px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
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
          <tbody className='bg-white divide-y divide-gray-200'>
            {currentSchedule.map(period => (
              <tr key={period.period} className='hover:bg-gray-50'>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {summaryData && (
        <div className='bg-gray-50 px-6 py-4 border-t border-gray-200'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='text-gray-500'>Total de Juros:</span>
              <div className='font-medium text-gray-900'>
                {formatCurrency(summaryData.total_interest_expense)}
              </div>
            </div>
            <div>
              <span className='text-gray-500'>Total Principal:</span>
              <div className='font-medium text-gray-900'>
                {formatCurrency(summaryData.total_principal_payments)}
              </div>
            </div>
            <div>
              <span className='text-gray-500'>Total Pagamentos:</span>
              <div className='font-medium text-gray-900'>
                {formatCurrency(summaryData.total_lease_payments)}
              </div>
            </div>
            <div>
              <span className='text-gray-500'>Taxa Efetiva:</span>
              <div className='font-medium text-gray-900'>
                {summaryData.effective_interest_rate_annual.toFixed(AMORTIZATION_CONSTANTS.DECIMAL_PLACES)}% a.a.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {calculatedTotalPages > 1 && (
        <div className='bg-white px-6 py-3 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Anterior
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === calculatedTotalPages}
                className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Próximo
              </button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>
                  Mostrando <span className='font-medium'>{startIndex + 1}</span> a{' '}
                  <span className='font-medium'>
                    {Math.min(endIndex, scheduleData.length)}
                  </span>{' '}
                  de{' '}
                  <span className='font-medium'>
                    {scheduleData.length}
                  </span>{' '}
                  períodos
                </p>
              </div>
              <div>
                <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
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
                  {Array.from({ length: Math.min(AMORTIZATION_CONSTANTS.MAX_PAGINATION_BUTTONS, calculatedTotalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(calculatedTotalPages - AMORTIZATION_CONSTANTS.PAGINATION_OFFSET, currentPage - 2)) + i;
                    if (pageNum > calculatedTotalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === calculatedTotalPages}
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
