/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { VirtualizedList } from '@/components/ui/VirtualizedList';
import { useDebounce } from '@/hooks/usePerformance';
import { Contract } from '@/lib/contracts';
import { useMemo, useState } from 'react';

interface OptimizedContractListProps {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onView: (contract: Contract) => void;
  isLoading?: boolean;
  searchTerm?: string;
}

export default function OptimizedContractList({
  contracts,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  searchTerm = '',
}: OptimizedContractListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter contracts based on search term
  const filteredContracts = useMemo(() => {
    if (!debouncedSearchTerm) return contracts;
    
    return contracts.filter(contract =>
      contract.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      contract.status.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (contract.currency_code && contract.currency_code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [contracts, debouncedSearchTerm]);

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

  const formatCurrency = (value: number | null, currency: string | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(value);
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

  const renderContractItem = (contract: Contract, index: number) => (
    <div
      key={contract.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {contract.title}
            </h3>
            {getStatusBadge(contract.status)}
          </div>
          
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Valor:</span>{' '}
              {formatCurrency(contract.contract_value, contract.currency_code)}
            </div>
            <div>
              <span className="font-medium">Prazo:</span>{' '}
              {contract.contract_term_months ? `${contract.contract_term_months} meses` : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Criado:</span>{' '}
              {formatDate(contract.created_at)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onView(contract)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ver
          </button>
          <button
            onClick={() => onEdit(contract)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Editar
          </button>
          <button
            onClick={() => handleDeleteClick(contract)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (filteredContracts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          {searchTerm ? 'Nenhum contrato encontrado para a busca.' : 'Nenhum contrato encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          {filteredContracts.length} contrato{filteredContracts.length !== 1 ? 's' : ''} encontrado{filteredContracts.length !== 1 ? 's' : ''}
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      </div>

      <VirtualizedList
        items={filteredContracts}
        itemHeight={120}
        containerHeight={600}
        renderItem={renderContractItem}
        overscan={5}
        className="space-y-4"
      />

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita."
      />
    </>
  );
}
