'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import { BusinessMetricsCalculator, useBusinessMetrics } from '@/lib/metrics/business-metrics';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function BusinessMetricsDashboard() {
  const { metrics, loading, error } = useBusinessMetrics();
  const [businessHealth, setBusinessHealth] = useState<{
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    if (metrics) {
      const health = BusinessMetricsCalculator.calculateBusinessHealth(metrics);
      setBusinessHealth(health);
    }
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleIcon className='h-5 w-5 text-green-600' />;
      case 'good':
        return <CheckCircleIcon className='h-5 w-5 text-blue-600' />;
      case 'warning':
        return <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600' />;
      case 'critical':
        return <ExclamationTriangleIcon className='h-5 w-5 text-red-600' />;
      default:
        return <ClockIcon className='h-5 w-5 text-gray-600' />;
    }
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(8)].map((_, i) => (
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

  if (error || !metrics) {
    return (
      <div className='text-center py-12'>
        <ExclamationTriangleIcon className='h-12 w-12 text-red-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Erro ao carregar métricas</h3>
        <p className='text-gray-600'>{error || 'Dados não disponíveis'}</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Métricas de Negócio</h1>
          <p className='text-gray-600 mt-1'>Visão geral das métricas essenciais do micro SaaS</p>
        </div>
        {businessHealth && (
          <div className='flex items-center gap-3'>
            <Badge className={getStatusColor(businessHealth.status)}>
              {getStatusIcon(businessHealth.status)}
              <span className='ml-1'>{businessHealth.score}/100</span>
            </Badge>
            <span className='text-sm text-gray-600 capitalize'>{businessHealth.status}</span>
          </div>
        )}
      </div>

      {/* Health Score */}
      {businessHealth && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ChartBarIcon className='h-5 w-5' />
              Saúde do Negócio
            </CardTitle>
            <CardDescription>
              Score baseado em MRR Growth, Churn Rate, LTV:CAC e Product-Market Fit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Score Geral</span>
                <span className='text-2xl font-bold'>{businessHealth.score}/100</span>
              </div>
              <Progress value={businessHealth.score} className='h-3' />

              {businessHealth.recommendations.length > 0 && (
                <div className='mt-4 p-4 bg-yellow-50 rounded-lg'>
                  <h4 className='font-semibold text-yellow-900 mb-2'>Recomendações:</h4>
                  <ul className='space-y-1'>
                    {businessHealth.recommendations.map((rec, index) => (
                      <li key={index} className='text-sm text-yellow-800'>
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>MRR</CardTitle>
            <CurrencyDollarIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>R$ {metrics.mrr.toLocaleString('pt-BR')}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              {metrics.revenueGrowth > 0 ? (
                <ArrowTrendingUpIcon className='h-3 w-3 text-green-600 mr-1' />
              ) : (
                <ArrowTrendingDownIcon className='h-3 w-3 text-red-600 mr-1' />
              )}
              {Math.abs(metrics.revenueGrowth)}% vs. mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>ARR</CardTitle>
            <CurrencyDollarIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>R$ {metrics.arr.toLocaleString('pt-BR')}</div>
            <p className='text-xs text-muted-foreground'>Receita anual recorrente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>LTV</CardTitle>
            <CurrencyDollarIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>R$ {metrics.customerLifetimeValue}</div>
            <p className='text-xs text-muted-foreground'>Valor vitalício do cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>CAC</CardTitle>
            <CurrencyDollarIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>R$ {metrics.cac}</div>
            <p className='text-xs text-muted-foreground'>Custo de aquisição</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Clientes</CardTitle>
            <UsersIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalCustomers}</div>
            <p className='text-xs text-muted-foreground'>{metrics.activeCustomers} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Novos Clientes</CardTitle>
            <ArrowTrendingUpIcon className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.newCustomers}</div>
            <p className='text-xs text-muted-foreground'>Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Churn Rate</CardTitle>
            <ArrowTrendingDownIcon className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.monthlyChurnRate}%</div>
            <p className='text-xs text-muted-foreground'>Taxa mensal de cancelamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>LTV:CAC</CardTitle>
            <ChartBarIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.ltvcacRatio}:1</div>
            <p className='text-xs text-muted-foreground'>
              {metrics.ltvcacRatio > 3
                ? 'Excelente'
                : metrics.ltvcacRatio > 2
                  ? 'Bom'
                  : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Trial to Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.trialToPaidConversion}%</div>
            <Progress value={metrics.trialToPaidConversion} className='mt-2' />
            <p className='text-xs text-muted-foreground mt-1'>Conversão de trial para pago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Product-Market Fit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.productMarketFitScore}%</div>
            <Progress value={metrics.productMarketFitScore} className='mt-2' />
            <p className='text-xs text-muted-foreground mt-1'>
              {metrics.productMarketFitScore > 40
                ? 'Excelente PMF'
                : metrics.productMarketFitScore > 30
                  ? 'Bom PMF'
                  : 'PMF baixo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Net Promoter Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.netPromoterScore}</div>
            <Progress value={Math.max(0, metrics.netPromoterScore)} className='mt-2' />
            <p className='text-xs text-muted-foreground mt-1'>
              {metrics.netPromoterScore > 50
                ? 'Excelente'
                : metrics.netPromoterScore > 0
                  ? 'Bom'
                  : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Engajamento</CardTitle>
          <CardDescription>Atividade e uso da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{metrics.dailyActiveUsers}</div>
              <p className='text-sm text-gray-600'>DAU</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{metrics.monthlyActiveUsers}</div>
              <p className='text-sm text-gray-600'>MAU</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{metrics.averageSessionDuration}min</div>
              <p className='text-sm text-gray-600'>Sessão Média</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{metrics.featureAdoptionRate}%</div>
              <p className='text-sm text-gray-600'>Adoção de Features</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
