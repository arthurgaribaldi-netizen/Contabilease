'use client';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { cn, formatCurrency } from '@/lib/utils';
import {
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardSkeleton from './DashboardSkeleton';

interface DashboardStats {
  totalContracts: number;
  compliantContracts: number;
  contractsExpiringSoon: number;
  totalLeaseLiability: number;
  totalRightOfUseAsset: number;
  monthlyPayments: number;
  compliancePercentage: number;
}

interface ContractSummary {
  id: string;
  title: string;
  status: 'active' | 'expired' | 'pending';
  monthlyPayment: number;
  endDate: string;
  complianceStatus: 'compliant' | 'warning' | 'error';
}

export default function LightweightDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContracts, setRecentContracts] = useState<ContractSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // Reduced delay for better LCP
      await new Promise(resolve => setTimeout(resolve, 300));

      setStats({
        totalContracts: 12,
        compliantContracts: 10,
        contractsExpiringSoon: 3,
        totalLeaseLiability: 2450000,
        totalRightOfUseAsset: 2100000,
        monthlyPayments: 185000,
        compliancePercentage: 83.3,
      });

      setRecentContracts([
        {
          id: '1',
          title: 'Contrato Escritório Principal',
          status: 'active',
          monthlyPayment: 15000,
          endDate: '2025-12-31',
          complianceStatus: 'compliant',
        },
        {
          id: '2',
          title: 'Veículos Corporativos',
          status: 'active',
          monthlyPayment: 8500,
          endDate: '2025-06-30',
          complianceStatus: 'warning',
        },
        {
          id: '3',
          title: 'Equipamentos TI',
          status: 'pending',
          monthlyPayment: 3200,
          endDate: '2026-03-15',
          complianceStatus: 'compliant',
        },
      ]);
    } catch (err) {
      logger.error(
        'Erro ao carregar dados do dashboard',
        {
          component: 'lightweight-dashboard',
          operation: 'loadDashboardData',
        },
        err as Error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'expired':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'pending':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className='h-4 w-4' />;
      case 'warning':
        return <ExclamationTriangleIcon className='h-4 w-4' />;
      case 'error':
        return <ExclamationTriangleIcon className='h-4 w-4' />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='md:flex md:items-center md:justify-between'>
        <div className='min-w-0 flex-1'>
          <h1 className='text-3xl font-bold text-foreground'>Dashboard IFRS 16</h1>
          <p className='mt-2 text-lg text-muted-foreground'>
            Visão geral dos contratos de leasing e conformidade IFRS 16
          </p>
        </div>
        <div className='mt-4 flex md:ml-4 md:mt-0 space-x-3'>
          <Button asChild>
            <Link href='/contracts/new' className='flex items-center'>
              <PlusIcon className='h-4 w-4 mr-2' />
              Novo Contrato
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-card border border-border rounded-lg p-6'>
          <div className='flex items-center justify-between mb-3'>
            <BuildingOfficeIcon className='h-8 w-8 text-indigo-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-green-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-foreground'>{stats?.totalContracts || 0}</div>
            <div className='text-sm text-muted-foreground'>Total Contratos</div>
            <div className='text-xs text-green-600'>+2 este mês</div>
          </div>
        </div>

        <div className='bg-card border border-border rounded-lg p-6'>
          <div className='flex items-center justify-between mb-3'>
            <ShieldCheckIcon className='h-8 w-8 text-green-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-green-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-green-600'>
              {stats ? `${stats.compliancePercentage.toFixed(1)}%` : '0%'}
            </div>
            <div className='text-sm text-muted-foreground'>Conformidade</div>
            <div className='text-xs text-green-600'>Excelente</div>
          </div>
        </div>

        <div className='bg-card border border-border rounded-lg p-6'>
          <div className='flex items-center justify-between mb-3'>
            <ExclamationTriangleIcon className='h-8 w-8 text-yellow-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-yellow-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats?.contractsExpiringSoon || 0}
            </div>
            <div className='text-sm text-muted-foreground'>Vencendo</div>
            <div className='text-xs text-yellow-600'>Requer atenção</div>
          </div>
        </div>

        <div className='bg-card border border-border rounded-lg p-6'>
          <div className='flex items-center justify-between mb-3'>
            <ChartBarIcon className='h-8 w-8 text-purple-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-purple-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-purple-600'>
              {stats ? formatCurrency(stats.monthlyPayments) : 'R$ 0,00'}
            </div>
            <div className='text-sm text-muted-foreground'>Pagamentos</div>
            <div className='text-xs text-purple-600'>Mensais</div>
          </div>
        </div>
      </div>

      {/* Recent Contracts */}
      <div className='bg-card border border-border rounded-lg p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-foreground'>Contratos Recentes</h3>
          <Button asChild variant='ghost' size='sm'>
            <Link href='/contracts'>Ver todos</Link>
          </Button>
        </div>

        <div className='space-y-4'>
          {recentContracts.map(contract => (
            <div
              key={contract.id}
              className='flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors'
            >
              <div className='flex-1'>
                <div className='flex items-center'>
                  <h4 className='text-sm font-medium text-foreground'>{contract.title}</h4>
                  <span
                    className={cn(
                      'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(contract.status)
                    )}
                  >
                    {contract.status === 'active'
                      ? 'Ativo'
                      : contract.status === 'expired'
                        ? 'Expirado'
                        : 'Pendente'}
                  </span>
                </div>
                <div className='mt-1 flex items-center text-sm text-muted-foreground'>
                  <span>{formatCurrency(contract.monthlyPayment)}/mês</span>
                  <span className='mx-2'>•</span>
                  <span>Vence em {new Date(contract.endDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getComplianceColor(contract.complianceStatus)
                  )}
                >
                  {getComplianceIcon(contract.complianceStatus)}
                  <span className='ml-1'>
                    {contract.complianceStatus === 'compliant'
                      ? 'Conforme'
                      : contract.complianceStatus === 'warning'
                        ? 'Atenção'
                        : 'Erro'}
                  </span>
                </span>
                <Button asChild variant='ghost' size='icon'>
                  <Link href={`/contracts/${contract.id}`}>
                    <span className='sr-only'>Ver contrato</span>
                    <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
