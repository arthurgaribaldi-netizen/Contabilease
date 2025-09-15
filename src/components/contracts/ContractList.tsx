'use client';

import { Contract } from '@/lib/contracts';
import { useState } from 'react';

interface ContractListProps {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onView: (contract: Contract) => void;
  isLoading?: boolean;
}

export default function ContractList({
  contracts,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}: ContractListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Rascunho' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluído' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleDeleteClick = (contract: Contract) => {
    setDeleteConfirm(contract.id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      const contract = contracts.find(c => c.id === deleteConfirm);
      if (contract) {
        onDelete(contract);
      }
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          </div>
        </div>
        <div className='divide-y divide-gray-200'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='px-6 py-4'>
              <div className='animate-pulse space-y-2'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
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
        <p className='mt-2 text-gray-500'>Crie seu primeiro contrato de leasing para começar</p>
      </div>
    );
  }

  return (
    <>
      <div className='card shadow-elevated overflow-hidden'>
        <div className='px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50'>
          <h3 className='text-lg font-semibold text-gray-900'>Meus Contratos</h3>
          <p className='text-sm text-muted-foreground mt-1'>
            {contracts.length} contrato(s) encontrado(s)
          </p>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-slate-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                  Título
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                  Moeda
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                  Criado em
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-slate-200'>
              {contracts.map(contract => (
                <tr key={contract.id} className='hover:bg-slate-50 transition-colors duration-150'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-semibold text-slate-900'>{contract.title}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(contract.status)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-slate-700'>
                    {contract.currency_code || 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-slate-500'>
                    {formatDate(contract.created_at)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-3'>
                      <button
                        onClick={() => onView(contract)}
                        className='text-blue-600 hover:text-blue-800 transition-colors duration-150 font-medium'
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => onEdit(contract)}
                        className='text-indigo-600 hover:text-indigo-800 transition-colors duration-150 font-medium'
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(contract)}
                        className='text-red-600 hover:text-red-800 transition-colors duration-150 font-medium'
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4'>
          <div className='relative bg-white rounded-lg shadow-floating w-full max-w-md slide-in'>
            <div className='p-6 text-center'>
              <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4'>
                <svg
                  className='h-8 w-8 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-slate-900 mb-2'>Confirmar exclusão</h3>
              <p className='text-sm text-slate-600 mb-6'>
                Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
              </p>
              <div className='flex justify-center space-x-3'>
                <button onClick={handleDeleteCancel} className='btn-secondary'>
                  Cancelar
                </button>
                <button onClick={handleDeleteConfirm} className='btn-destructive'>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
