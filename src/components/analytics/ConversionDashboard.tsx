'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import { CohortData, FunnelStep, useConversionTracking } from '@/lib/analytics/conversion-tracking';
import {
    ChartBarIcon,
    CreditCardIcon,
    EyeIcon,
    PlayIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function ConversionDashboard() {
  const { getMetrics, getFunnel, getCohortAnalysis } = useConversionTracking();
  const [metrics, setMetrics] = useState<any>(null);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados para demonstração
      const mockMetrics = {
        totalVisitors: 1250,
        totalSignups: 187,
        totalTrials: 89,
        totalPaid: 23,
        signupRate: 15.0,
        trialRate: 47.6,
        paidRate: 25.8,
        overallConversionRate: 1.8,
      };

      const mockFunnel: FunnelStep[] = [
        {
          step: 'page_view',
          visitors: 1250,
          conversions: 1250,
          conversionRate: 100,
          dropOffRate: 0,
        },
        {
          step: 'signup',
          visitors: 1250,
          conversions: 187,
          conversionRate: 15.0,
          dropOffRate: 85.0,
        },
        {
          step: 'trial_start',
          visitors: 187,
          conversions: 89,
          conversionRate: 47.6,
          dropOffRate: 52.4,
        },
        {
          step: 'paid_conversion',
          visitors: 89,
          conversions: 23,
          conversionRate: 25.8,
          dropOffRate: 74.2,
        },
      ];

      const mockCohorts: CohortData[] = [
        {
          cohort: '2024-12',
          users: 45,
          retention: { day1: 85, day7: 62, day14: 48, day30: 35 },
          revenue: { day1: 0, day7: 1250, day14: 2100, day30: 3200 },
        },
        {
          cohort: '2025-01',
          users: 67,
          retention: { day1: 88, day7: 68, day14: 52, day30: 38 },
          revenue: { day1: 0, day7: 1800, day14: 3100, day30: 4800 },
        },
      ];

      setMetrics(mockMetrics);
      setFunnel(mockFunnel);
      setCohorts(mockCohorts);
      setLoading(false);
    };

    loadData();
  }, []);

  const getConversionColor = (rate: number, type: 'signup' | 'trial' | 'paid' | 'overall') => {
    const thresholds = {
      signup: { good: 15, excellent: 25 },
      trial: { good: 40, excellent: 60 },
      paid: { good: 20, excellent: 35 },
      overall: { good: 2, excellent: 5 },
    };

    const threshold = thresholds[type];
    if (rate >= threshold.excellent) return 'text-green-600';
    if (rate >= threshold.good) return 'text-blue-600';
    return 'text-red-600';
  };

  const getConversionIcon = (rate: number, type: 'signup' | 'trial' | 'paid' | 'overall') => {
    const thresholds = {
      signup: { good: 15, excellent: 25 },
      trial: { good: 40, excellent: 60 },
      paid: { good: 20, excellent: 35 },
      overall: { good: 2, excellent: 5 },
    };

    const threshold = thresholds[type];
    if (rate >= threshold.excellent) return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (rate >= threshold.good) return <TrendingUpIcon className="h-4 w-4 text-blue-600" />;
    return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Dados não disponíveis</h3>
        <p className="text-gray-600">Não há dados de conversão para exibir</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Conversão</h1>
          <p className="text-gray-600 mt-1">Análise completa do funil de conversão</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          <TrendingUpIcon className="h-3 w-3 mr-1" />
          Crescimento +12%
        </Badge>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadastros</CardTitle>
            <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSignups}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getConversionIcon(metrics.signupRate, 'signup')}
              <span className="ml-1">{metrics.signupRate}% taxa de conversão</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trials</CardTitle>
            <PlayIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrials}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getConversionIcon(metrics.trialRate, 'trial')}
              <span className="ml-1">{metrics.trialRate}% taxa de conversão</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Pagos</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPaid}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getConversionIcon(metrics.paidRate, 'paid')}
              <span className="ml-1">{metrics.paidRate}% taxa de conversão</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>
            Análise detalhada de cada etapa do funil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {funnel.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connection Line */}
                {index < funnel.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                <div className="flex items-center space-x-4">
                  {/* Step Icon */}
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    {step.step === 'page_view' && <EyeIcon className="h-6 w-6 text-blue-600" />}
                    {step.step === 'signup' && <UserPlusIcon className="h-6 w-6 text-blue-600" />}
                    {step.step === 'trial_start' && <PlayIcon className="h-6 w-6 text-blue-600" />}
                    {step.step === 'paid_conversion' && <CreditCardIcon className="h-6 w-6 text-blue-600" />}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold capitalize">
                        {step.step.replace('_', ' ')}
                      </h3>
                      <Badge variant="outline">
                        {step.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Visitantes:</span>
                        <span className="ml-2 font-semibold">{step.visitors.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversões:</span>
                        <span className="ml-2 font-semibold">{step.conversions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Abandono:</span>
                        <span className="ml-2 font-semibold text-red-600">{step.dropOffRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Progress value={step.conversionRate} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Coorte */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Coorte</CardTitle>
          <CardDescription>
            Retenção de usuários por período de cadastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Coorte</th>
                  <th className="text-center py-3 px-4 font-semibold">Usuários</th>
                  <th className="text-center py-3 px-4 font-semibold">Dia 1</th>
                  <th className="text-center py-3 px-4 font-semibold">Dia 7</th>
                  <th className="text-center py-3 px-4 font-semibold">Dia 14</th>
                  <th className="text-center py-3 px-4 font-semibold">Dia 30</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.cohort} className="border-b">
                    <td className="py-3 px-4 font-medium">{cohort.cohort}</td>
                    <td className="py-3 px-4 text-center">{cohort.users}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={cohort.retention.day1 > 80 ? 'default' : 'outline'}>
                        {cohort.retention.day1}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={cohort.retention.day7 > 60 ? 'default' : 'outline'}>
                        {cohort.retention.day7}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={cohort.retention.day14 > 40 ? 'default' : 'outline'}>
                        {cohort.retention.day14}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={cohort.retention.day30 > 30 ? 'default' : 'outline'}>
                        {cohort.retention.day30}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão Geral</CardTitle>
            <CardDescription>
              Visitantes → Clientes Pagos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                <span className={getConversionColor(metrics.overallConversionRate, 'overall')}>
                  {metrics.overallConversionRate}%
                </span>
              </div>
              <Progress value={metrics.overallConversionRate * 20} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {metrics.totalPaid} de {metrics.totalVisitors} visitantes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Coorte</CardTitle>
            <CardDescription>
              Valor gerado por período de cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cohorts.map((cohort) => (
                <div key={cohort.cohort} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cohort.cohort}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      R$ {cohort.revenue.day30.toLocaleString('pt-BR')}
                    </span>
                    <Badge variant="outline">
                      R$ {(cohort.revenue.day30 / cohort.users).toFixed(0)}/usuário
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
