'use client';

import ContractDetails from '@/components/contracts/ContractDetails';
import { Contract } from '@/lib/contracts';
import { ContractFormData } from '@/lib/schemas/contract';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ContractDetailsPageClientProps {
  contractId: string;
  initialContract: Contract | null;
  initialError: string | null;
}

export default function ContractDetailsPageClient({
  contractId,
  initialContract,
  initialError,
}: ContractDetailsPageClientProps) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(initialContract);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleBackToList = () => {
    router.push('/contracts');
  };

  const handleContractUpdate = async (updatedContract: Contract) => {
    setContract(updatedContract);
  };

  const handleContractDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir contrato');
      }

      // Redirect back to contracts list after successful deletion
      router.push('/contracts');
    } catch (err) {
      console.error('Error deleting contract:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContract = async (data: ContractFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar contrato');
      }

      const result = await response.json();
      setContract(result.contract);
    } catch (err) {
      console.error('Error saving contract:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar contrato');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <button
              onClick={handleBackToList}
              className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
            >
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              Voltar para Contratos
            </button>
            <h1 className='text-2xl font-bold text-gray-900'>Detalhes do Contrato</h1>
          </div>
        </div>

        {/* Error State */}
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>Erro ao carregar contrato</h3>
              <div className='mt-2 text-sm text-red-700'>
                <p>{error}</p>
              </div>
              <button
                onClick={handleBackToList}
                className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
              >
                Voltar para lista de contratos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <button
              onClick={handleBackToList}
              className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
            >
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              Voltar para Contratos
            </button>
            <h1 className='text-2xl font-bold text-gray-900'>Detalhes do Contrato</h1>
          </div>
        </div>

        {/* Loading State */}
        <div className='bg-white shadow rounded-lg overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <div className='animate-pulse'>
              <div className='h-6 bg-gray-200 rounded w-1/3'></div>
            </div>
          </div>
          <div className='px-6 py-8'>
            <div className='animate-pulse space-y-4'>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <button
            onClick={handleBackToList}
            className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
          >
            <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Voltar para Contratos
          </button>
          <h1 className='text-2xl font-bold text-gray-900'>Detalhes do Contrato</h1>
        </div>
      </div>

      {/* Contract Details */}
      <ContractDetails
        contract={contract}
        onUpdate={handleContractUpdate}
        onDelete={handleContractDelete}
        onSave={handleSaveContract}
        isLoading={isLoading}
        isSaving={isSaving}
      />
    </div>
  );
}
