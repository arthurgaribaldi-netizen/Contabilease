/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

'use client';

import { Contract } from '@/lib/contracts';
import { ContractFormData } from '@/lib/schemas/contract';
import ContractForm from './ContractForm';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract;
  onSubmit: (data: ContractFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ContractModal({
  isOpen,
  onClose,
  contract,
  onSubmit,
  isLoading = false,
}: ContractModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              {contract ? 'Editar Contrato' : 'Novo Contrato'}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
              disabled={isLoading}
            >
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <ContractForm
            contract={contract}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
