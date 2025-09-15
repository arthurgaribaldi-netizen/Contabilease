'use client';

import ContractList from '@/components/contracts/ContractList';
import ContractModal from '@/components/contracts/ContractModal';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { LoadingButton } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { Contract } from '@/lib/contracts';
import { ContractFormData } from '@/lib/schemas/contract';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ContractsPageClientProps {
  initialContracts: Contract[];
  initialError: string | null;
}

export default function ContractsPageClient({
  initialContracts,
  initialError,
}: ContractsPageClientProps) {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const breadcrumbItems: BreadcrumbItem[] = [{ name: 'Contratos', current: true }];

  const handleCreateContract = () => {
    router.push('/contracts/new');
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleViewContract = (contract: Contract) => {
    router.push(`/contracts/${contract.id}`);
  };

  const handleDeleteContract = async (contract: Contract) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir contrato');
      }

      // Remove o contrato da lista local
      setContracts(prev => prev.filter(c => c.id !== contract.id));
      success('Contrato excluído', 'O contrato foi excluído com sucesso');
    } catch (err) {
      console.error('Error deleting contract:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir contrato';
      setError(errorMessage);
      showError('Erro ao excluir', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitContract = async (data: ContractFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingContract ? `/api/contracts/${editingContract.id}` : '/api/contracts';
      const method = editingContract ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
      const newContract = result.contract;

      if (editingContract) {
        // Atualizar contrato existente
        setContracts(prev => prev.map(c => (c.id === editingContract.id ? newContract : c)));
      } else {
        // Adicionar novo contrato
        setContracts(prev => [newContract, ...prev]);
      }

      setIsModalOpen(false);
      setEditingContract(undefined);
      success(
        'Contrato salvo',
        editingContract ? 'Contrato atualizado com sucesso' : 'Novo contrato criado com sucesso'
      );
    } catch (err) {
      console.error('Error submitting contract:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar contrato';
      setError(errorMessage);
      showError('Erro ao salvar', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContract(undefined);
  };

  return (
    <div className='space-y-6'>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className='md:flex md:items-center md:justify-between'>
        <div className='min-w-0 flex-1'>
          <h1 className='text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>
            Contratos de Leasing
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Gerencie seus contratos de leasing e conformidade IFRS 16
          </p>
        </div>
        <div className='mt-4 flex md:ml-4 md:mt-0'>
          <LoadingButton
            onClick={handleCreateContract}
            isLoading={false}
            className='inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
          >
            <PlusIcon className='h-4 w-4 mr-2' />
            Novo Contrato
          </LoadingButton>
        </div>
      </div>

      {/* Error State */}
      {error && (
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
              <h3 className='text-sm font-medium text-red-800'>Erro ao carregar contratos</h3>
              <div className='mt-2 text-sm text-red-700'>
                <p>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contracts List */}
      {!error && (
        <>
          {contracts.length === 0 ? (
            /* Empty State */
            <div className='text-center py-12'>
              <div className='mx-auto h-24 w-24 text-gray-400'>
                <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <h3 className='mt-4 text-lg font-medium text-gray-900'>Nenhum contrato encontrado</h3>
              <p className='mt-2 text-gray-500'>
                Crie seu primeiro contrato de leasing para começar
              </p>
              <div className='mt-6'>
                <button
                  onClick={handleCreateContract}
                  className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Criar Primeiro Contrato
                </button>
              </div>
            </div>
          ) : (
            <ContractList
              contracts={contracts}
              onEdit={handleEditContract}
              onDelete={handleDeleteContract}
              onView={handleViewContract}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Contract Modal */}
      {isModalOpen && (
        <ContractModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          {...(editingContract && { contract: editingContract })}
          onSubmit={handleSubmitContract}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
