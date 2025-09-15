'use client';

// import LightweightDashboard from '@/components/dashboard/LightweightDashboard';
// import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { SkipLink } from '@/components/ui/skip-link';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAIPersonalization } from '@/lib/ai-personalization';
import { useSustainableDesign } from '@/lib/sustainable-design';
import { cn, formatCurrency } from '@/lib/utils';
import {
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
    BuildingOfficeIcon,
    CalculatorIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentChartBarIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    PlusIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { lazy, Suspense, useEffect, useState } from 'react';

// Lazy load heavy components
const AmortizationChart = lazy(() => import('@/components/charts/AmortizationChart'));
const ComplianceChart = lazy(() => import('@/components/charts/ComplianceChart'));
const FinancialOverviewChart = lazy(() => import('@/components/charts/FinancialOverviewChart'));
const OnboardingTour = lazy(() => import('@/components/onboarding/OnboardingTour'));
const OptimizedOnboarding = lazy(() => import('@/components/onboarding/OptimizedOnboarding'));
const WelcomeModal = lazy(() => import('@/components/onboarding/WelcomeModal'));
const Chart3D = lazy(() => import('@/components/ui/3d-chart').then(module => ({ default: module.Chart3D })));
const BentoCard = lazy(() => import('@/components/ui/bento-card').then(module => ({ default: module.BentoCard })));
const BentoGrid = lazy(() => import('@/components/ui/bento-card').then(module => ({ default: module.BentoGrid })));
// const EnergyIndicator = lazy(() => import('@/components/ui/energy-indicator').then(module => ({ default: module.EnergyIndicator })));
const ParticleField = lazy(() => import('@/components/ui/floating-elements').then(module => ({ default: module.ParticleField })));
const SmartRecommendations = lazy(() => import('@/components/ui/smart-recommendations').then(module => ({ default: module.SmartRecommendations })));

interface DashboardStats {
  totalContracts: number;
  compliantContracts: number;
  contractsExpiringSoon: number;
  totalLeaseLiability: number;
  totalRightOfUseAsset: number;
  monthlyPayments: number;
  compliancePercentage: number;
  totalInterestExpense: number;
  totalDepreciationExpense: number;
  contractsWithModifications: number;
  averageContractTerm: number;
  contractsByStatus: {
    active: number;
    draft: number;
    completed: number;
    cancelled: number;
  };
}

interface ContractSummary {
  id: string;
  title: string;
  status: 'active' | 'expired' | 'pending';
  monthlyPayment: number;
  endDate: string;
  complianceStatus: 'compliant' | 'warning' | 'error';
}

interface AmortizationData {
  period: number;
  date: string;
  leaseLiability: number;
  rightOfUseAsset: number;
  interestExpense: number;
  depreciationExpense: number;
}

interface ComplianceData {
  compliant: number;
  warnings: number;
  errors: number;
  total: number;
}

interface FinancialData {
  period: string;
  leaseLiability: number;
  rightOfUseAsset: number;
  interestExpense: number;
  depreciationExpense: number;
  totalExpenses: number;
}

interface PersonalizedLayout {
  showAdvancedMetrics: boolean;
  showQuickActions: boolean;
  showRecommendations: boolean;
  preferredChartType: string;
  showTutorials: boolean;
}

export default function DashboardClient() {
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContracts, setRecentContracts] = useState<ContractSummary[]>([]);
  const [amortizationData, setAmortizationData] = useState<AmortizationData[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: showError } = useToast();
  const { 
    isTourOpen, 
    startTour, 
    closeTour, 
    completeTour, 
    shouldShowWelcome, 
    markWelcomeSeen,
    shouldShowOptimizedOnboarding,
    completeOptimizedOnboarding,
    achieveFirstVictory,
    hasAchievedFirstVictory
  } = useOnboarding();

  // AI Personalization
  const { updateBehavior, getPersonalizedLayout } = useAIPersonalization();

  // Sustainable Design
  const { config: sustainableConfig } = useSustainableDesign();

  useEffect(() => {
    loadDashboardData();
    updateBehavior('page-view', { page: 'dashboard' });
    
    // Load advanced features after initial render
    const timer = setTimeout(() => {
      setShowAdvancedFeatures(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get personalized layout with proper typing
  const getLayout = (): PersonalizedLayout => {
    const layout = getPersonalizedLayout();
    return {
      showAdvancedMetrics: Boolean(layout['showAdvancedMetrics']),
      showQuickActions: Boolean(layout['showQuickActions']),
      showRecommendations: Boolean(layout['showRecommendations']),
      preferredChartType: String(layout['preferredChartType'] || 'simple'),
      showTutorials: Boolean(layout['showTutorials']),
    };
  };

  const personalizedLayout = getLayout();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // Simular carregamento de dados - em produção, fazer chamadas para API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dados mockados para demonstração
      setStats({
        totalContracts: 12,
        compliantContracts: 10,
        contractsExpiringSoon: 3,
        totalLeaseLiability: 2450000,
        totalRightOfUseAsset: 2100000,
        monthlyPayments: 185000,
        compliancePercentage: 83.3,
        totalInterestExpense: 294000,
        totalDepreciationExpense: 2100000,
        contractsWithModifications: 2,
        averageContractTerm: 36,
        contractsByStatus: {
          active: 8,
          draft: 2,
          completed: 1,
          cancelled: 1,
        },
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

      // Mock data for charts
      setAmortizationData([
        {
          period: 1,
          date: '2024-01-01',
          leaseLiability: 2450000,
          rightOfUseAsset: 2100000,
          interestExpense: 24500,
          depreciationExpense: 175000,
        },
        {
          period: 2,
          date: '2024-02-01',
          leaseLiability: 2425500,
          rightOfUseAsset: 1925000,
          interestExpense: 24255,
          depreciationExpense: 175000,
        },
        {
          period: 3,
          date: '2024-03-01',
          leaseLiability: 2400755,
          rightOfUseAsset: 1750000,
          interestExpense: 24008,
          depreciationExpense: 175000,
        },
        {
          period: 4,
          date: '2024-04-01',
          leaseLiability: 2375763,
          rightOfUseAsset: 1575000,
          interestExpense: 23758,
          depreciationExpense: 175000,
        },
        {
          period: 5,
          date: '2024-05-01',
          leaseLiability: 2350521,
          rightOfUseAsset: 1400000,
          interestExpense: 23505,
          depreciationExpense: 175000,
        },
        {
          period: 6,
          date: '2024-06-01',
          leaseLiability: 2325026,
          rightOfUseAsset: 1225000,
          interestExpense: 23250,
          depreciationExpense: 175000,
        },
      ]);

      setComplianceData({
        compliant: 10,
        warnings: 2,
        errors: 0,
        total: 12,
      });

      setFinancialData([
        {
          period: '2024',
          leaseLiability: 2450000,
          rightOfUseAsset: 2100000,
          interestExpense: 294000,
          depreciationExpense: 2100000,
          totalExpenses: 2394000,
        },
        {
          period: '2025',
          leaseLiability: 1800000,
          rightOfUseAsset: 1400000,
          interestExpense: 216000,
          depreciationExpense: 1400000,
          totalExpenses: 1616000,
        },
        {
          period: '2026',
          leaseLiability: 1200000,
          rightOfUseAsset: 700000,
          interestExpense: 144000,
          depreciationExpense: 700000,
          totalExpenses: 844000,
        },
      ]);
    } catch (err) {
      showError('Erro ao carregar dados', 'Não foi possível carregar as informações do dashboard');
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
        return <ClockIcon className='h-4 w-4' />;
    }
  };

  return (
    <div className='space-y-6 relative'>
      {/* Performance Monitoring */}
      {/* <PerformanceMonitor /> */}
      
      {/* Skip Link for Accessibility */}
      <SkipLink href='#main-content'>Pular para conteúdo principal</SkipLink>

      {/* Show lightweight dashboard first for better LCP */}
      {/* <LightweightDashboard /> */}

      {/* Advanced Features - Load after initial render */}
      {showAdvancedFeatures && (
        <Suspense fallback={<div className='h-64 bg-muted rounded animate-pulse' />}>
          {/* Particle Field Background */}
          {sustainableConfig.energyMode !== 'eco' && (
            <ParticleField count={15} className='opacity-20' />
          )}
        </Suspense>
      )}

      {/* Advanced Bento Grid Layout - Load after initial render */}
      {showAdvancedFeatures && (
        <Suspense fallback={<div className='h-96 bg-muted rounded animate-pulse' />}>
          <BentoGrid columns={12} gap='md' id='main-content'>
            {/* Main Stats Card - 8 columns */}
            <BentoCard span={8} className='p-8'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-heading font-heading text-foreground'>Visão Geral</h2>
                  <p className='text-body text-muted-foreground mt-1'>
                    Resumo dos principais indicadores IFRS 16
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='h-3 w-3 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-sm text-muted-foreground'>Sistema Online</span>
                </div>
              </div>

              <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-primary mb-2'>
                    {stats?.totalContracts || 0}
                  </div>
                  <div className='text-sm text-muted-foreground'>Total Contratos</div>
                  <div className='text-xs text-green-600 mt-1'>+2 este mês</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-green-600 mb-2'>
                    {stats ? `${stats.compliancePercentage.toFixed(1)}%` : '0%'}
                  </div>
                  <div className='text-sm text-muted-foreground'>Conformidade</div>
                  <div className='text-xs text-green-600 mt-1'>Excelente</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-yellow-600 mb-2'>
                    {stats?.contractsExpiringSoon || 0}
                  </div>
                  <div className='text-sm text-muted-foreground'>Vencendo</div>
                  <div className='text-xs text-yellow-600 mt-1'>Requer atenção</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600 mb-2'>
                    {stats ? formatCurrency(stats.monthlyPayments) : 'R$ 0,00'}
                  </div>
                  <div className='text-sm text-muted-foreground'>Pagamentos</div>
                  <div className='text-xs text-purple-600 mt-1'>Mensais</div>
                </div>
              </div>
            </BentoCard>

        {/* Compliance Status Card - 4 columns */}
        <BentoCard span={4} className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>Conformidade</h3>
            <ShieldCheckIcon className='h-6 w-6 text-green-600' />
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Conformes</span>
              <span className='text-sm font-semibold text-green-600'>
                {complianceData?.compliant || 0}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Atenção</span>
              <span className='text-sm font-semibold text-yellow-600'>
                {complianceData?.warnings || 0}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Erros</span>
              <span className='text-sm font-semibold text-red-600'>
                {complianceData?.errors || 0}
              </span>
            </div>
          </div>
          <div className='mt-4 pt-4 border-t border-border'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-foreground'>Status Geral</span>
              <span className='text-sm font-semibold text-green-600'>Excelente</span>
            </div>
          </div>
        </BentoCard>

        {/* Quick Actions Card - 4 columns */}
        <BentoCard span={4} className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>Ações Rápidas</h3>
            <CalculatorIcon className='h-6 w-6 text-primary' />
          </div>
          <div className='space-y-3'>
            <Button asChild variant='outline' className='w-full justify-start'>
              <Link href='/contracts/new'>
                <PlusIcon className='h-4 w-4 mr-2' />
                Novo Contrato
              </Link>
            </Button>
            <Button asChild variant='outline' className='w-full justify-start'>
              <Link href='/ifrs16-demo'>
                <CheckCircleIcon className='h-4 w-4 mr-2' />
                Verificar Conformidade
              </Link>
            </Button>
            <Button asChild variant='outline' className='w-full justify-start'>
              <Link href='/reports'>
                <DocumentChartBarIcon className='h-4 w-4 mr-2' />
                Relatórios
              </Link>
            </Button>
          </div>
        </BentoCard>

        {/* Financial Metrics Cards - 3 columns each */}
        <BentoCard span={3} className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <BuildingOfficeIcon className='h-8 w-8 text-indigo-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-green-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-foreground'>
              {stats ? formatCurrency(stats.totalLeaseLiability) : 'R$ 0,00'}
            </div>
            <div className='text-sm text-muted-foreground'>Passivo de Arrendamento</div>
            <div className='text-xs text-green-600'>+5.2% vs mês anterior</div>
          </div>
        </BentoCard>

        <BentoCard span={3} className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <ChartBarIcon className='h-8 w-8 text-emerald-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-green-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-foreground'>
              {stats ? formatCurrency(stats.totalRightOfUseAsset) : 'R$ 0,00'}
            </div>
            <div className='text-sm text-muted-foreground'>Ativo de Direito de Uso</div>
            <div className='text-xs text-green-600'>+3.8% vs mês anterior</div>
          </div>
        </BentoCard>

        <BentoCard span={3} className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <ArrowTrendingUpIcon className='h-8 w-8 text-red-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-red-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-foreground'>
              {stats ? formatCurrency(stats.totalInterestExpense) : 'R$ 0,00'}
            </div>
            <div className='text-sm text-muted-foreground'>Despesa de Juros</div>
            <div className='text-xs text-red-600'>+2.1% vs mês anterior</div>
          </div>
        </BentoCard>

        <BentoCard span={3} className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <ArrowTrendingDownIcon className='h-8 w-8 text-orange-600' />
            <ArrowTrendingUpIcon className='h-4 w-4 text-orange-600' />
          </div>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-foreground'>
              {stats ? formatCurrency(stats.totalDepreciationExpense) : 'R$ 0,00'}
            </div>
            <div className='text-sm text-muted-foreground'>Depreciação</div>
            <div className='text-xs text-orange-600'>+1.5% vs mês anterior</div>
          </div>
        </BentoCard>

        {/* Recent Contracts Card - 8 columns */}
        <BentoCard span={8} className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-foreground'>Contratos Recentes</h3>
            <Button asChild variant='ghost' size='sm'>
              <Link href='/contracts'>Ver todos</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map(i => (
                <div key={i} className='animate-pulse'>
                  <div className='h-4 bg-muted rounded w-3/4 mb-2'></div>
                  <div className='h-3 bg-muted rounded w-1/2'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-4'>
              {recentContracts.map(contract => (
                <motion.div
                  key={contract.id}
                  className='flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors'
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
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
                        <EyeIcon className='h-4 w-4' />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </BentoCard>

        {/* Smart Recommendations Card - 4 columns */}
        {personalizedLayout.showRecommendations && (
          <BentoCard span={4} className='p-6'>
            <SmartRecommendations maxItems={2} />
          </BentoCard>
        )}

        {/* Alerts Card - 4 columns */}
        <BentoCard span={4} className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>Alertas</h3>
            <ExclamationTriangleIcon className='h-6 w-6 text-yellow-600' />
          </div>
          <div className='space-y-3'>
            <div className='flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
              <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600 mt-0.5' />
              <div>
                <div className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                  Contratos vencendo
                </div>
                <div className='text-xs text-yellow-700 dark:text-yellow-300'>
                  {stats?.contractsExpiringSoon || 0} contratos vencem em 90 dias
                </div>
              </div>
            </div>
            <div className='flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <CheckCircleIcon className='h-5 w-5 text-blue-600 mt-0.5' />
              <div>
                <div className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                  Sistema atualizado
                </div>
                <div className='text-xs text-blue-700 dark:text-blue-300'>
                  Todas as normas IFRS 16 estão atualizadas
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

          {/* Charts Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Suspense fallback={<div className='h-64 bg-muted rounded animate-pulse' />}>
              <AmortizationChart data={amortizationData} />
            </Suspense>
            <Suspense fallback={<div className='h-64 bg-muted rounded animate-pulse' />}>
              <ComplianceChart
                data={complianceData || { compliant: 0, warnings: 0, errors: 0, total: 0 }}
              />
            </Suspense>
          </div>

          {/* Financial Overview Chart */}
          <Suspense fallback={<div className='h-64 bg-muted rounded animate-pulse' />}>
            <FinancialOverviewChart data={financialData} />
          </Suspense>

          {/* 3D Chart Section */}
          {personalizedLayout.showAdvancedMetrics && sustainableConfig.energyMode !== 'eco' && (
            <div className='bg-card border border-border rounded-lg p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-lg font-semibold text-foreground'>
                    Visualização 3D dos Contratos
                  </h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Explore seus dados em três dimensões
                  </p>
                </div>
              </div>

              <Suspense fallback={<div className='h-96 bg-muted rounded animate-pulse' />}>
                <Chart3D
                  data={[
                    {
                      x: -3,
                      y: 0,
                      z: -3,
                      value: stats?.totalContracts ?? 0,
                      label: 'Total',
                      color: '#3b82f6',
                    },
                    {
                      x: 0,
                      y: 0,
                      z: -3,
                      value: stats?.compliantContracts ?? 0,
                      label: 'Conformes',
                      color: '#10b981',
                    },
                    {
                      x: 3,
                      y: 0,
                      z: -3,
                      value: stats?.contractsExpiringSoon ?? 0,
                      label: 'Vencendo',
                      color: '#f59e0b',
                    },
                    {
                      x: -3,
                      y: 0,
                      z: 0,
                      value: Math.round((stats?.monthlyPayments ?? 0) / 1000),
                      label: 'Pagamentos',
                      color: '#8b5cf6',
                    },
                    {
                      x: 0,
                      y: 0,
                      z: 0,
                      value: Math.round((stats?.totalLeaseLiability ?? 0) / 100000),
                      label: 'Passivo',
                      color: '#ef4444',
                    },
                    {
                      x: 3,
                      y: 0,
                      z: 0,
                      value: Math.round((stats?.totalRightOfUseAsset ?? 0) / 100000),
                      label: 'Ativo',
                      color: '#06b6d4',
                    },
                  ]}
                  height={400}
                  animated={!sustainableConfig.reducedMotion}
                />
              </Suspense>
            </div>
          )}
          </BentoGrid>
        </Suspense>
      )}

      {/* Onboarding Modals - Load after initial render */}
      {showAdvancedFeatures && (
        <Suspense fallback={null}>
          {/* Show optimized onboarding for new users */}
          {shouldShowOptimizedOnboarding() ? (
            <OptimizedOnboarding
              isOpen={true}
              onClose={() => completeOptimizedOnboarding()}
              onComplete={() => completeOptimizedOnboarding()}
              onFirstVictory={achieveFirstVictory}
            />
          ) : (
            <>
              <WelcomeModal
                isOpen={shouldShowWelcome()}
                onClose={markWelcomeSeen}
                onStartTour={startTour}
              />
              <OnboardingTour isOpen={isTourOpen} onClose={closeTour} onComplete={completeTour} />
            </>
          )}
        </Suspense>
      )}
    </div>
  );
}
