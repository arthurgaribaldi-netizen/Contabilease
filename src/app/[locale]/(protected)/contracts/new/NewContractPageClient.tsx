'use client';

import ContractWizard from '@/components/contracts/ContractWizard';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/Toast';
import { createContract } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { ContractFormData } from '@/lib/schemas/contract';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewContractPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: showError } = useToast();

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Contratos', href: '/contracts' },
    { name: 'Novo Contrato', current: true },
  ];

  const handleSubmit = async (data: ContractFormData) => {
    setIsLoading(true);
    try {
      await createContract(data);
      success('Contrato criado', 'O contrato foi criado com sucesso!');
      router.push('/contracts');
    } catch (error) {
      logger.error(
        'Error creating contract:',
        {
          component: 'newcontractpageclient',
          operation: 'createContract',
        },
        error as Error
      );
      showError('Erro ao criar contrato', 'Não foi possível criar o contrato. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/contracts');
  };

  return (
    <div className='space-y-6'>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className='md:flex md:items-center md:justify-between'>
        <div className='min-w-0 flex-1'>
          <h1 className='text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>
            Novo Contrato de Leasing
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Crie um novo contrato de leasing com cálculos automáticos IFRS 16
          </p>
        </div>
      </div>

      <ContractWizard onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
    </div>
  );
}
