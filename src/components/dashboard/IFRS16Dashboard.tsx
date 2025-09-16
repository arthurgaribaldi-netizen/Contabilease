'use client';

import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowTrendingUpIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardMetrics {
  totalContracts: number;
  activeContracts: number;
  complianceRate: number;
  upcomingExpirations: number;
  monthlyCalculations: number;
  timeSaved: number;
  errorReduction: number;
  userSatisfaction: number;
}

interface ContractSummary {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'expired';
  monthlyPayment: number;
  remainingMonths: number;
  complianceStatus: 'compliant' | 'warning' | 'error';
}

export default function IFRS16Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalContracts: 0,
    activeContracts: 0,
    complianceRate: 0,
    upcomingExpirations: 0,
    monthlyCalculations: 0,
    timeSaved: 0,
    errorReduction: 0,
    userSatisfaction: 0,
  });

  const [recentContracts, setRecentContracts] = useState<ContractSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadDashboardData = async () => {
      setIsLoading(true);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMetrics({
        totalContracts: 24,
        activeContracts: 18,
        complianceRate: 95,
        upcomingExpirations: 3,
        monthlyCalculations: 156,
        timeSaved: 48, // horas
        errorReduction: 89,
        userSatisfaction: 92,
      });

      setRecentContracts([
        {
          id: '1',
          title: 'Leasing Veículo Executivo',
          status: 'active',
          monthlyPayment: 2500,
          remainingMonths: 18,
          complianceStatus: 'compliant',
        },
        {
          id: '2',
          title: 'Arrendamento Escritório',
          status: 'active',
          monthlyPayment: 8500,
          remainingMonths: 36,
          complianceStatus: 'warning',
        },
        {
          id: '3',
          title: 'Equipamentos TI',
          status: 'draft',
          monthlyPayment: 1200,
          remainingMonths: 24,
          complianceStatus: 'compliant',
        },
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardHeader className='pb-2'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              </CardHeader>
              <CardContent>
                <div className='h-8 bg-gray-200 rounded w-1/2'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard IFRS 16</h1>
          <p className='text-gray-600 mt-1'>Visão geral dos seus contratos de leasing</p>
        </div>
        <div className='flex gap-3'>
          <Button asChild>
            <Link href='/contracts/new'>
              <DocumentTextIcon className='h-4 w-4 mr-2' />
              Novo Contrato
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/ifrs16-demo'>
              <CalculatorIcon className='h-4 w-4 mr-2' />
              Demo IFRS 16
            </Link>
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total de Contratos</CardTitle>
            <DocumentTextIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalContracts}</div>
            <p className='text-xs text-muted-foreground'>{metrics.activeContracts} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Conformidade IFRS</CardTitle>
            <CheckCircleIcon className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.complianceRate}%</div>
            <Progress value={metrics.complianceRate} className='mt-2' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tempo Economizado</CardTitle>
            <ClockIcon className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.timeSaved}h</div>
            <p className='text-xs text-muted-foreground'>Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Redução de Erros</CardTitle>
            <ArrowTrendingUpIcon className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.errorReduction}%</div>
            <p className='text-xs text-muted-foreground'>vs. cálculos manuais</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600' />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {metrics.upcomingExpirations > 0 && (
              <div className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <ClockIcon className='h-4 w-4 text-yellow-600' />
                  <span className='text-sm font-medium'>Vencimentos Próximos</span>
                </div>
                <Badge variant='outline' className='text-yellow-600'>
                  {metrics.upcomingExpirations} contratos
                </Badge>
              </div>
            )}

            <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
              <div className='flex items-center gap-2'>
                <CheckCircleIcon className='h-4 w-4 text-green-600' />
                <span className='text-sm font-medium'>Cálculos Mensais</span>
              </div>
              <Badge variant='outline' className='text-green-600'>
                {metrics.monthlyCalculations} realizados
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center gap-2'>
                <UsersIcon className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium'>Satisfação do Usuário</span>
              </div>
              <Badge variant='outline' className='text-blue-600'>
                {metrics.userSatisfaction}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Atalhos para tarefas comuns</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button className='w-full justify-start' asChild>
              <Link href='/contracts/new'>
                <DocumentTextIcon className='h-4 w-4 mr-2' />
                Criar Novo Contrato
              </Link>
            </Button>
            <Button variant='outline' className='w-full justify-start' asChild>
              <Link href='/contracts'>
                <ChartBarIcon className='h-4 w-4 mr-2' />
                Ver Todos os Contratos
              </Link>
            </Button>
            <Button variant='outline' className='w-full justify-start' asChild>
              <Link href='/ifrs16-demo'>
                <CalculatorIcon className='h-4 w-4 mr-2' />
                Demo de Cálculos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contratos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Contratos Recentes</CardTitle>
          <CardDescription>Últimos contratos criados ou modificados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentContracts.map(contract => (
              <div
                key={contract.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-medium text-gray-900'>{contract.title}</h3>
                    <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                  </div>
                  <div className='mt-1 flex items-center gap-4 text-sm text-gray-600'>
                    <span>R$ {contract.monthlyPayment.toLocaleString('pt-BR')}/mês</span>
                    <span>{contract.remainingMonths} meses restantes</span>
                    <span
                      className={`flex items-center gap-1 ${getComplianceColor(contract.complianceStatus)}`}
                    >
                      <CheckCircleIcon className='h-3 w-3' />
                      {contract.complianceStatus === 'compliant'
                        ? 'Conforme'
                        : contract.complianceStatus === 'warning'
                          ? 'Atenção'
                          : 'Erro'}
                    </span>
                  </div>
                </div>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/contracts/${contract.id}`}>Ver Detalhes</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
