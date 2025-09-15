'use client';

import { useState } from 'react';
import { Contract } from '@/lib/contracts';
import { ContractFormData } from '@/lib/schemas/contract';
import IFRS16CalculationResults from './IFRS16CalculationResults';

interface ContractDetailsProps {
  contract: Contract;
  onUpdate: (contract: Contract) => void;
  onDelete: () => void;
  onSave: (data: ContractFormData) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

export default function ContractDetails({
  contract,
  onUpdate,
  onDelete,
  onSave,
  isLoading = false,
  isSaving = false,
}: ContractDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: contract.title,
    status: contract.status,
    currency_code: contract.currency_code || '',
    contract_value: contract.contract_value?.toString() || '',
    contract_term_months: contract.contract_term_months?.toString() || '',
    implicit_interest_rate: contract.implicit_interest_rate?.toString() || '',
    guaranteed_residual_value: contract.guaranteed_residual_value?.toString() || '',
    purchase_option_price: contract.purchase_option_price?.toString() || '',
    purchase_option_exercise_date: contract.purchase_option_exercise_date || '',
    lease_start_date: contract.lease_start_date || '',
    lease_end_date: contract.lease_end_date || '',
    payment_frequency: contract.payment_frequency || '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: contract.title,
      status: contract.status,
      currency_code: contract.currency_code || '',
      contract_value: contract.contract_value?.toString() || '',
      contract_term_months: contract.contract_term_months?.toString() || '',
      implicit_interest_rate: contract.implicit_interest_rate?.toString() || '',
      guaranteed_residual_value: contract.guaranteed_residual_value?.toString() || '',
      purchase_option_price: contract.purchase_option_price?.toString() || '',
      purchase_option_exercise_date: contract.purchase_option_exercise_date || '',
      lease_start_date: contract.lease_start_date || '',
      lease_end_date: contract.lease_end_date || '',
      payment_frequency: contract.payment_frequency || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: contract.title,
      status: contract.status,
      currency_code: contract.currency_code || '',
      contract_value: contract.contract_value?.toString() || '',
      contract_term_months: contract.contract_term_months?.toString() || '',
      implicit_interest_rate: contract.implicit_interest_rate?.toString() || '',
      guaranteed_residual_value: contract.guaranteed_residual_value?.toString() || '',
      purchase_option_price: contract.purchase_option_price?.toString() || '',
      purchase_option_exercise_date: contract.purchase_option_exercise_date || '',
      lease_start_date: contract.lease_start_date || '',
      lease_end_date: contract.lease_end_date || '',
      payment_frequency: contract.payment_frequency || '',
    });
  };

  const handleSave = async () => {
    try {
      // Format data for API
      const formattedData: ContractFormData = {
        title: editData.title,
        status: editData.status as 'draft' | 'active' | 'completed' | 'cancelled',
        currency_code: editData.currency_code || undefined,
        contract_value: editData.contract_value ? parseFloat(editData.contract_value) : undefined,
        contract_term_months: editData.contract_term_months
          ? parseInt(editData.contract_term_months)
          : undefined,
        implicit_interest_rate: editData.implicit_interest_rate
          ? parseFloat(editData.implicit_interest_rate)
          : undefined,
        guaranteed_residual_value: editData.guaranteed_residual_value
          ? parseFloat(editData.guaranteed_residual_value)
          : undefined,
        purchase_option_price: editData.purchase_option_price
          ? parseFloat(editData.purchase_option_price)
          : undefined,
        purchase_option_exercise_date: editData.purchase_option_exercise_date || undefined,
        lease_start_date: editData.lease_start_date || undefined,
        lease_end_date: editData.lease_end_date || undefined,
        payment_frequency:
          (editData.payment_frequency as 'monthly' | 'quarterly' | 'semi-annual' | 'annual') ||
          undefined,
      };

      await onSave(formattedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className='bg-white shadow rounded-lg overflow-hidden'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg font-medium text-gray-900'>Informações do Contrato</h2>
              <p className='text-sm text-gray-500 mt-1'>ID: {contract.id}</p>
            </div>
            <div className='flex space-x-2'>
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    disabled={isLoading}
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isLoading}
                    className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Excluir
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='px-6 py-6'>
          <dl className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {/* Title */}
            <div>
              <dt className='text-sm font-medium text-gray-500'>Título</dt>
              <dd className='mt-1'>
                {isEditing ? (
                  <input
                    type='text'
                    value={editData.title}
                    onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Digite o título do contrato'
                  />
                ) : (
                  <p className='text-sm text-gray-900'>{contract.title}</p>
                )}
              </dd>
            </div>

            {/* Status */}
            <div>
              <dt className='text-sm font-medium text-gray-500'>Status</dt>
              <dd className='mt-1'>
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={e => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='draft'>Rascunho</option>
                    <option value='active'>Ativo</option>
                    <option value='completed'>Concluído</option>
                    <option value='cancelled'>Cancelado</option>
                  </select>
                ) : (
                  <div>{getStatusBadge(contract.status)}</div>
                )}
              </dd>
            </div>

            {/* Currency */}
            <div>
              <dt className='text-sm font-medium text-gray-500'>Moeda</dt>
              <dd className='mt-1'>
                {isEditing ? (
                  <input
                    type='text'
                    value={editData.currency_code}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, currency_code: e.target.value }))
                    }
                    className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Ex: BRL, USD, EUR'
                  />
                ) : (
                  <p className='text-sm text-gray-900'>
                    {contract.currency_code || 'Não definida'}
                  </p>
                )}
              </dd>
            </div>

            {/* Created At */}
            <div>
              <dt className='text-sm font-medium text-gray-500'>Criado em</dt>
              <dd className='mt-1'>
                <p className='text-sm text-gray-900'>{formatDate(contract.created_at)}</p>
              </dd>
            </div>

            {/* Updated At */}
            <div>
              <dt className='text-sm font-medium text-gray-500'>Atualizado em</dt>
              <dd className='mt-1'>
                <p className='text-sm text-gray-900'>{formatDate(contract.updated_at)}</p>
              </dd>
            </div>

            {/* User ID */}
            <div>
              <dt className='text-sm font-medium text-gray-500'>ID do Usuário</dt>
              <dd className='mt-1'>
                <p className='text-sm text-gray-900 font-mono'>{contract.user_id}</p>
              </dd>
            </div>

            {/* Financial Fields */}
            {contract.contract_value && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Valor do Contrato</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <input
                      type='number'
                      value={editData.contract_value}
                      onChange={e =>
                        setEditData(prev => ({ ...prev, contract_value: e.target.value }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  ) : (
                    <p className='text-sm text-gray-900'>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: contract.currency_code || 'BRL',
                      }).format(contract.contract_value)}
                    </p>
                  )}
                </dd>
              </div>
            )}

            {contract.contract_term_months && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Prazo (meses)</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <input
                      type='number'
                      value={editData.contract_term_months}
                      onChange={e =>
                        setEditData(prev => ({ ...prev, contract_term_months: e.target.value }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      placeholder='12'
                      min='1'
                      max='600'
                    />
                  ) : (
                    <p className='text-sm text-gray-900'>{contract.contract_term_months} meses</p>
                  )}
                </dd>
              </div>
            )}

            {contract.implicit_interest_rate !== null && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Taxa de Juros Implícita</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <input
                      type='number'
                      value={editData.implicit_interest_rate}
                      onChange={e =>
                        setEditData(prev => ({ ...prev, implicit_interest_rate: e.target.value }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      placeholder='5.00'
                      step='0.01'
                      min='0'
                      max='100'
                    />
                  ) : (
                    <p className='text-sm text-gray-900'>{contract.implicit_interest_rate}%</p>
                  )}
                </dd>
              </div>
            )}

            {contract.guaranteed_residual_value && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Valor Residual Garantido</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <input
                      type='number'
                      value={editData.guaranteed_residual_value}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          guaranteed_residual_value: e.target.value,
                        }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  ) : (
                    <p className='text-sm text-gray-900'>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: contract.currency_code || 'BRL',
                      }).format(contract.guaranteed_residual_value)}
                    </p>
                  )}
                </dd>
              </div>
            )}

            {contract.purchase_option_price && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Preço da Opção de Compra</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <input
                      type='number'
                      value={editData.purchase_option_price}
                      onChange={e =>
                        setEditData(prev => ({ ...prev, purchase_option_price: e.target.value }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  ) : (
                    <p className='text-sm text-gray-900'>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: contract.currency_code || 'BRL',
                      }).format(contract.purchase_option_price)}
                    </p>
                  )}
                </dd>
              </div>
            )}

            {contract.payment_frequency && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Frequência de Pagamento</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <select
                      value={editData.payment_frequency}
                      onChange={e =>
                        setEditData(prev => ({ ...prev, payment_frequency: e.target.value }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value=''>Selecione...</option>
                      <option value='monthly'>Mensal</option>
                      <option value='quarterly'>Trimestral</option>
                      <option value='semi-annual'>Semestral</option>
                      <option value='annual'>Anual</option>
                    </select>
                  ) : (
                    <p className='text-sm text-gray-900'>
                      {contract.payment_frequency === 'monthly' && 'Mensal'}
                      {contract.payment_frequency === 'quarterly' && 'Trimestral'}
                      {contract.payment_frequency === 'semi-annual' && 'Semestral'}
                      {contract.payment_frequency === 'annual' && 'Anual'}
                    </p>
                  )}
                </dd>
              </div>
            )}

            {contract.lease_start_date && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Data de Início do Leasing</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <input
                      type='date'
                      value={editData.lease_start_date}
                      onChange={e =>
                        setEditData(prev => ({ ...prev, lease_start_date: e.target.value }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                  ) : (
                    <p className='text-sm text-gray-900'>
                      {new Date(contract.lease_start_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </dd>
              </div>
            )}

            {contract.lease_end_date && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Data de Fim do Leasing</dt>
                <dd className='mt-1'>
                  {isEditing ? (
                    <input
                      type='date'
                      value={editData.lease_end_date}
                      onChange={e =>
                        setEditData(prev => ({ ...prev, lease_end_date: e.target.value }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                  ) : (
                    <p className='text-sm text-gray-900'>
                      {new Date(contract.lease_end_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* IFRS 16 Calculation Results */}
      {contract.contract_value &&
        contract.contract_term_months &&
        contract.implicit_interest_rate !== null && (
          <div className='mt-8'>
            <IFRS16CalculationResults contract={contract} />
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3 text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
                <svg
                  className='h-6 w-6 text-red-600'
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
              <h3 className='text-lg font-medium text-gray-900 mt-4'>Confirmar exclusão</h3>
              <div className='mt-2 px-7 py-3'>
                <p className='text-sm text-gray-500'>
                  Tem certeza que deseja excluir o contrato{' '}
                  <strong>&ldquo;{contract.title}&rdquo;</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className='flex justify-center space-x-3 mt-4'>
                <button
                  onClick={handleDeleteCancel}
                  disabled={isLoading}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
