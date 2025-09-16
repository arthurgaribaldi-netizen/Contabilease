'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  ChartBarIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Interfaces específicas para contadores IFRS 16
interface IFRS16DashboardMetrics {
  totalContracts: number;
  activeContracts: number;
  complianceRate: number;
  upcomingExpirations: number;
  totalLeaseLiability: number;
  rightOfUseAssets: number;
  monthlyPayments: number;
  auditAlerts: number;
  timeSaved: number;
  errorReduction: number;
  userSatisfaction: number;
  esgCompliance: number;
  carbonFootprint: number;
  blockchainVerified: number;
}

interface ContractSummary {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'expired' | 'pending_approval';
  monthlyPayment: number;
  remainingMonths: number;
  complianceStatus: 'compliant' | 'warning' | 'error' | 'audit_required';
  leaseLiability: number;
  rightOfUseAsset: number;
  esgScore: number;
  lastAuditDate: string;
  nextPaymentDate: string;
}

interface AuditAlert {
  id: string;
  type: 'expiration' | 'compliance' | 'payment' | 'esg' | 'blockchain';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  contractId: string;
  dueDate: string;
  actionRequired: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  badge?: string;
}

export default function IFRS16SpecializedDashboard() {
  const [metrics, setMetrics] = useState<IFRS16DashboardMetrics>({
    totalContracts: 0,
    activeContracts: 0,
    complianceRate: 0,
    upcomingExpirations: 0,
    totalLeaseLiability: 0,
    rightOfUseAssets: 0,
    monthlyPayments: 0,
    auditAlerts: 0,
    timeSaved: 0,
    errorReduction: 0,
    userSatisfaction: 0,
    esgCompliance: 0,
    carbonFootprint: 0,
    blockchainVerified: 0,
  });

  const [recentContracts, setRecentContracts] = useState<ContractSummary[]>([]);
  const [auditAlerts, setAuditAlerts] = useState<AuditAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const quickActions: QuickAction[] = [
    {
      id: 'new-contract',
      title: 'Novo Contrato IFRS 16',
      description: 'Criar contrato com wizard inteligente',
      icon: DocumentTextIcon,
      href: '/contracts/new',
      color: 'blue',
      badge: 'IA',
    },
    {
      id: 'compliance-check',
      title: 'Verificar Conformidade',
      description: 'Auditoria automática de todos os contratos',
      icon: ShieldCheckIcon,
      href: '/ifrs16-demo',
      color: 'green',
      badge: '100%',
    },
    {
      id: 'esg-report',
      title: 'Relatório ESG',
      description: 'Análise de sustentabilidade e pegada de carbono',
      icon: ChartPieIcon,
      href: '/reports/esg',
      color: 'purple',
      badge: 'Verde',
    },
    {
      id: 'blockchain-audit',
      title: 'Auditoria Blockchain',
      description: 'Verificação imutável de transações',
      icon: ShieldCheckIcon,
      href: '/audit/blockchain',
      color: 'yellow',
      badge: 'Seguro',
    },
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      // Simular API call com dados realistas
      await new Promise(resolve => setTimeout(resolve, 1200));

      setMetrics({
        totalContracts: 47,
        activeContracts: 38,
        complianceRate: 98.5,
        upcomingExpirations: 5,
        totalLeaseLiability: 2847500,
        rightOfUseAssets: 3120000,
        monthlyPayments: 125000,
        auditAlerts: 3,
        timeSaved: 156, // horas
        errorReduction: 94,
        userSatisfaction: 96,
        esgCompliance: 87,
        carbonFootprint: 12.5, // toneladas CO2
        blockchainVerified: 100,
      });

      setRecentContracts([
        {
          id: '1',
          title: 'Leasing Veículo Executivo - BMW X5',
          status: 'active',
          monthlyPayment: 2500,
          remainingMonths: 18,
          complianceStatus: 'compliant',
          leaseLiability: 45000,
          rightOfUseAsset: 47000,
          esgScore: 85,
          lastAuditDate: '2025-01-15',
          nextPaymentDate: '2025-02-01',
        },
        {
          id: '2',
          title: 'Arrendamento Escritório - Torre Empresarial',
          status: 'active',
          monthlyPayment: 8500,
          remainingMonths: 36,
          complianceStatus: 'audit_required',
          leaseLiability: 306000,
          rightOfUseAsset: 320000,
          esgScore: 92,
          lastAuditDate: '2024-12-20',
          nextPaymentDate: '2025-02-15',
        },
        {
          id: '3',
          title: 'Equipamentos TI - Servidores Dell',
          status: 'pending_approval',
          monthlyPayment: 1200,
          remainingMonths: 24,
          complianceStatus: 'warning',
          leaseLiability: 28800,
          rightOfUseAsset: 30000,
          esgScore: 78,
          lastAuditDate: '2025-01-10',
          nextPaymentDate: '2025-02-20',
        },
      ]);

      setAuditAlerts([
        {
          id: '1',
          type: 'expiration',
          severity: 'medium',
          title: 'Vencimento Próximo',
          description: '3 contratos vencem nos próximos 60 dias',
          contractId: 'multiple',
          dueDate: '2025-03-15',
          actionRequired: 'Revisar termos de renovação',
        },
        {
          id: '2',
          type: 'compliance',
          severity: 'high',
          title: 'Auditoria Pendente',
          description: 'Contrato "Arrendamento Escritório" requer auditoria',
          contractId: '2',
          dueDate: '2025-02-01',
          actionRequired: 'Executar auditoria completa',
        },
        {
          id: '3',
          type: 'esg',
          severity: 'low',
          title: 'Relatório ESG',
          description: 'Relatório trimestral de sustentabilidade disponível',
          contractId: 'all',
          dueDate: '2025-02-28',
          actionRequired: 'Revisar e aprovar relatório',
        },
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending_approval':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'audit_required':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getActionColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20';
      case 'green':
        return 'bg-green-50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20';
      case 'yellow':
        return 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20';
      case 'purple':
        return 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20';
      default:
        return 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/10 dark:hover:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        {/* Header Skeleton */}
        <div className='flex justify-between items-center'>
          <div className='space-y-2'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse'></div>
          </div>
          <div className='flex gap-3'>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse'></div>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse'></div>
          </div>
        </div>

        {/* Metrics Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardHeader className='pb-2'>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
              </CardHeader>
              <CardContent>
                <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header Especializado */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Dashboard IFRS 16 Especializado
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Controle total dos seus contratos de leasing com conformidade automática
          </p>
        </div>
        <div className='flex gap-3'>
          <Button asChild className='bg-blue-600 hover:bg-blue-700'>
            <Link href='/contracts/new'>
              <DocumentTextIcon className='h-4 w-4 mr-2' />
              Novo Contrato
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/ifrs16-demo'>
              <CalculatorIcon className='h-4 w-4 mr-2' />
              Demo IA
            </Link>
          </Button>
        </div>
      </div>

      {/* Métricas Principais Especializadas */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total de Contratos</CardTitle>
            <DocumentTextIcon className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalContracts}</div>
            <p className='text-xs text-muted-foreground'>
              {metrics.activeContracts} ativos • {metrics.totalContracts - metrics.activeContracts}{' '}
              rascunhos
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Conformidade IFRS 16</CardTitle>
            <ShieldCheckIcon className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.complianceRate}%</div>
            <Progress value={metrics.complianceRate} className='mt-2' />
            <p className='text-xs text-green-600 mt-1'>✅ Auditoria automática ativa</p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Lease Liability Total</CardTitle>
            <CurrencyDollarIcon className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              R$ {(metrics.totalLeaseLiability / 1000000).toFixed(1)}M
            </div>
            <p className='text-xs text-muted-foreground'>
              R$ {metrics.monthlyPayments.toLocaleString('pt-BR')}/mês
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-orange-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tempo Economizado</CardTitle>
            <ClockIcon className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.timeSaved}h</div>
            <p className='text-xs text-muted-foreground'>
              {metrics.errorReduction}% menos erros • Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas ESG e Blockchain */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Conformidade ESG</CardTitle>
            <ChartPieIcon className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.esgCompliance}%</div>
            <p className='text-xs text-muted-foreground'>
              {metrics.carbonFootprint} ton CO₂ • Relatório verde
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-yellow-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Blockchain Verificado</CardTitle>
            <ShieldCheckIcon className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.blockchainVerified}%</div>
            <p className='text-xs text-muted-foreground'>
              Transações imutáveis • Auditoria transparente
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Satisfação do Usuário</CardTitle>
            <UsersIcon className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.userSatisfaction}%</div>
            <p className='text-xs text-muted-foreground'>NPS Score: 72 • Feedback positivo</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas Inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <LightBulbIcon className='h-5 w-5 text-yellow-600' />
            Ações Rápidas Inteligentes
          </CardTitle>
          <CardDescription>
            Atalhos otimizados com IA para tarefas comuns de contadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {quickActions.map(action => (
              <Button
                key={action.id}
                variant='outline'
                className={`h-auto p-4 flex flex-col items-start space-y-2 ${getActionColor(action.color)}`}
                asChild
              >
                <Link href={action.href}>
                  <div className='flex items-center gap-2 w-full'>
                    <action.icon className='h-5 w-5' />
                    <span className='font-medium'>{action.title}</span>
                    {action.badge && (
                      <Badge variant='secondary' className='ml-auto text-xs'>
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground text-left'>{action.description}</p>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Auditoria */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600' />
              Alertas de Auditoria
            </CardTitle>
            <CardDescription>Ações necessárias para manter conformidade IFRS 16</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {auditAlerts.map(alert => (
              <div
                key={alert.id}
                className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                    <ExclamationTriangleIcon className='h-4 w-4' />
                  </div>
                  <div>
                    <span className='text-sm font-medium'>{alert.title}</span>
                    <p className='text-xs text-muted-foreground'>{alert.description}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                  <p className='text-xs text-muted-foreground mt-1'>{alert.dueDate}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ChartBarIcon className='h-5 w-5 text-blue-600' />
              Insights Inteligentes
            </CardTitle>
            <CardDescription>Recomendações baseadas em IA para otimização</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <div className='flex items-center gap-2'>
                <ArrowTrendingUpIcon className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium'>Oportunidade de Economia</span>
              </div>
              <Badge variant='outline' className='text-blue-600'>
                R$ 15K/ano
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <div className='flex items-center gap-2'>
                <CheckCircleIcon className='h-4 w-4 text-green-600' />
                <span className='text-sm font-medium'>Conformidade Excelente</span>
              </div>
              <Badge variant='outline' className='text-green-600'>
                98.5%
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
              <div className='flex items-center gap-2'>
                <EyeIcon className='h-4 w-4 text-purple-600' />
                <span className='text-sm font-medium'>Próxima Auditoria</span>
              </div>
              <Badge variant='outline' className='text-purple-600'>
                15 dias
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contratos Recentes com Detalhes Avançados */}
      <Card>
        <CardHeader>
          <CardTitle>Contratos Recentes</CardTitle>
          <CardDescription>Últimos contratos com métricas de conformidade e ESG</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentContracts.map(contract => (
              <div
                key={contract.id}
                className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='font-medium text-gray-900 dark:text-white'>{contract.title}</h3>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant='outline'
                      className={getComplianceColor(contract.complianceStatus)}
                    >
                      {contract.complianceStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400'>
                    <div>
                      <span className='font-medium'>Pagamento:</span>
                      <br />
                      R$ {contract.monthlyPayment.toLocaleString('pt-BR')}/mês
                    </div>
                    <div>
                      <span className='font-medium'>Restante:</span>
                      <br />
                      {contract.remainingMonths} meses
                    </div>
                    <div>
                      <span className='font-medium'>Lease Liability:</span>
                      <br />
                      R$ {contract.leaseLiability.toLocaleString('pt-BR')}
                    </div>
                    <div>
                      <span className='font-medium'>ESG Score:</span>
                      <br />
                      {contract.esgScore}/100
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <Button variant='outline' size='sm' asChild>
                    <Link href={`/contracts/${contract.id}`}>
                      <EyeIcon className='h-4 w-4 mr-1' />
                      Ver Detalhes
                    </Link>
                  </Button>
                  <Button variant='outline' size='sm' asChild>
                    <Link href={`/contracts/${contract.id}/audit`}>
                      <ArrowPathIcon className='h-4 w-4 mr-1' />
                      Auditoria
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
