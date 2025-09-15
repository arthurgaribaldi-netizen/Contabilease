/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { ContractModificationFormData } from '@/lib/schemas/contract-modification';

interface ContractModificationHistoryProps {
  modifications: ContractModificationFormData[];
  onApprove?: (modificationId: string) => void;
  onActivate?: (modificationId: string) => void;
  isLoading?: boolean;
}

export default function ContractModificationHistory({
  modifications,
  onApprove,
  onActivate,
  isLoading = false,
}: ContractModificationHistoryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'effective':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'effective':
        return 'Efetivo';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getModificationTypeText = (type: string) => {
    switch (type) {
      case 'term_extension':
        return 'Extensão de Prazo';
      case 'term_reduction':
        return 'Redução de Prazo';
      case 'payment_change':
        return 'Mudança no Pagamento';
      case 'rate_change':
        return 'Mudança na Taxa';
      case 'asset_change':
        return 'Mudança no Ativo';
      case 'termination':
        return 'Rescisão';
      case 'renewal':
        return 'Renovação';
      case 'other':
        return 'Outras';
      default:
        return type;
    }
  };

  const renderModificationDetails = (modification: ContractModificationFormData) => {
    const details = [];

    if (modification.new_term_months) {
      details.push(`Novo prazo: ${modification.new_term_months} meses`);
    }
    if (modification.term_change_months) {
      const change = modification.term_change_months > 0 ? '+' : '';
      details.push(`Mudança no prazo: ${change}${modification.term_change_months} meses`);
    }

    if (modification.new_monthly_payment) {
      details.push(`Novo pagamento: ${formatCurrency(modification.new_monthly_payment)}`);
    }
    if (modification.payment_change_amount) {
      const change = modification.payment_change_amount > 0 ? '+' : '';
      details.push(
        `Mudança no pagamento: ${change}${formatCurrency(modification.payment_change_amount)}`
      );
    }
    if (modification.payment_change_percentage) {
      const change = modification.payment_change_percentage > 0 ? '+' : '';
      details.push(`Mudança no pagamento: ${change}${modification.payment_change_percentage}%`);
    }

    if (modification.new_discount_rate_annual) {
      details.push(`Nova taxa: ${modification.new_discount_rate_annual}%`);
    }
    if (modification.rate_change_amount) {
      const change = modification.rate_change_amount > 0 ? '+' : '';
      details.push(`Mudança na taxa: ${change}${modification.rate_change_amount}%`);
    }
    if (modification.rate_change_percentage) {
      const change = modification.rate_change_percentage > 0 ? '+' : '';
      details.push(`Mudança na taxa: ${change}${modification.rate_change_percentage}%`);
    }

    if (modification.termination_date) {
      details.push(`Data de término: ${formatDate(modification.termination_date)}`);
    }
    if (modification.termination_fee) {
      details.push(`Taxa de rescisão: ${formatCurrency(modification.termination_fee)}`);
    }

    if (modification.renewal_term_months) {
      details.push(`Prazo de renovação: ${modification.renewal_term_months} meses`);
    }
    if (modification.renewal_monthly_payment) {
      details.push(
        `Pagamento da renovação: ${formatCurrency(modification.renewal_monthly_payment)}`
      );
    }

    if (modification.modification_fee) {
      details.push(`Taxa de modificação: ${formatCurrency(modification.modification_fee)}`);
    }
    if (modification.additional_costs) {
      details.push(`Custos adicionais: ${formatCurrency(modification.additional_costs)}`);
    }
    if (modification.incentives_received) {
      details.push(`Incentivos recebidos: ${formatCurrency(modification.incentives_received)}`);
    }

    return details;
  };

  if (modifications.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Histórico de Modificações</h3>
        <div className='text-center py-8'>
          <div className='text-gray-400 mb-4'>
            <svg
              className='mx-auto h-12 w-12'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <p className='text-gray-500'>Nenhuma modificação registrada</p>
          <p className='text-sm text-gray-400 mt-1'>
            As modificações do contrato aparecerão aqui quando forem criadas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Histórico de Modificações ({modifications.length})
        </h3>
      </div>

      <div className='divide-y divide-gray-200'>
        {modifications.map((modification, index) => (
          <div key={index} className='p-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center space-x-3 mb-2'>
                  <h4 className='text-sm font-medium text-gray-900'>
                    {getModificationTypeText(modification.modification_type)}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(modification.status)}`}
                  >
                    {getStatusText(modification.status)}
                  </span>
                </div>

                <p className='text-sm text-gray-600 mb-3'>{modification.description}</p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <span className='text-xs font-medium text-gray-500'>Data da Modificação:</span>
                    <p className='text-sm text-gray-900'>
                      {formatDate(modification.modification_date)}
                    </p>
                  </div>
                  <div>
                    <span className='text-xs font-medium text-gray-500'>Data de Vigência:</span>
                    <p className='text-sm text-gray-900'>
                      {formatDate(modification.effective_date)}
                    </p>
                  </div>
                </div>

                {renderModificationDetails(modification).length > 0 && (
                  <div className='mb-4'>
                    <span className='text-xs font-medium text-gray-500'>Detalhes:</span>
                    <ul className='mt-1 text-sm text-gray-600'>
                      {renderModificationDetails(modification).map((detail, detailIndex) => (
                        <li key={detailIndex}>• {detail}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {modification.notes && (
                  <div className='mb-4'>
                    <span className='text-xs font-medium text-gray-500'>Observações:</span>
                    <p className='text-sm text-gray-600 mt-1'>{modification.notes}</p>
                  </div>
                )}

                {modification.approved_by && (
                  <div className='text-xs text-gray-500'>
                    Aprovado por: {modification.approved_by} em{' '}
                    {modification.approval_date && formatDate(modification.approval_date)}
                  </div>
                )}
              </div>

              <div className='ml-4 flex space-x-2'>
                {modification.status === 'pending' && onApprove && (
                  <button
                    onClick={() => onApprove(modification.id || '')}
                    disabled={isLoading}
                    className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
                  >
                    Aprovar
                  </button>
                )}
                {modification.status === 'approved' && onActivate && (
                  <button
                    onClick={() => onActivate(modification.id || '')}
                    disabled={isLoading}
                    className='px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50'
                  >
                    Ativar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
