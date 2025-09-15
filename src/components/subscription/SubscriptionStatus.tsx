'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Progress } from '@/components/ui/progress';
import { CheckIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    subscription_plans: {
      name: string;
      description: string;
      price_monthly: number;
      max_contracts: number;
      max_users: number;
      features: any;
    };
  };
  limits: {
    maxContracts: number;
    maxUsers: number;
    currentContracts: number;
    currentUsers: number;
    planName: string;
    canCreateContract: boolean;
    canAddUser: boolean;
  };
  features: {
    exportExcel: boolean;
    apiAccess: boolean;
    customReports: boolean;
    whiteLabel: boolean;
    prioritySupport: boolean;
  };
}

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export default function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const t = useTranslations('subscription');
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch subscription data');
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'past_due':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'canceled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Pagamento Pendente</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados da assinatura: {error}</p>
            <Button onClick={fetchSubscriptionData} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { subscription, limits, features } = data;
  const contractsUsagePercentage = getUsagePercentage(limits.currentContracts, limits.maxContracts);
  const usersUsagePercentage = getUsagePercentage(limits.currentUsers, limits.maxUsers);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{subscription.subscription_plans.name}</CardTitle>
              <CardDescription>{subscription.subscription_plans.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatPrice(subscription.subscription_plans.price_monthly)}</div>
              <div className="text-sm text-gray-500">por mês</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            {getStatusIcon(subscription.status)}
            <span className="font-medium">Status:</span>
            {getStatusBadge(subscription.status)}
          </div>
          
          {subscription.current_period_end && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Próxima cobrança: {formatDate(subscription.current_period_end)}</p>
              {subscription.cancel_at_period_end && (
                <p className="text-yellow-600 font-medium">Assinatura será cancelada no final do período</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Uso Atual</CardTitle>
          <CardDescription>Limites do seu plano atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contracts Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Contratos</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {limits.currentContracts} / {limits.maxContracts}
              </span>
            </div>
            <Progress 
              value={contractsUsagePercentage} 
              className="h-2"
            />
            {!limits.canCreateContract && (
              <p className="text-sm text-red-600 mt-1">
                Limite atingido. Faça upgrade para criar mais contratos.
              </p>
            )}
          </div>

          {/* Users Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Usuários</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {limits.currentUsers} / {limits.maxUsers}
              </span>
            </div>
            <Progress 
              value={usersUsagePercentage} 
              className="h-2"
            />
            {!limits.canAddUser && limits.maxUsers > 1 && (
              <p className="text-sm text-red-600 mt-1">
                Limite atingido. Faça upgrade para adicionar mais usuários.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Incluídos</CardTitle>
          <CardDescription>Funcionalidades disponíveis no seu plano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm">Cálculos IFRS 16</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm">Exportar PDF</span>
            </div>
            {features.exportExcel && (
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">Exportar Excel</span>
              </div>
            )}
            {features.customReports && (
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">Relatórios Personalizados</span>
              </div>
            )}
            {features.apiAccess && (
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">Acesso à API</span>
              </div>
            )}
            {features.whiteLabel && (
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">Marca Branca</span>
              </div>
            )}
            {features.prioritySupport && (
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">Suporte Prioritário</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Button */}
      {limits.planName !== 'Escritório' && (
        <div className="text-center">
          <Button onClick={onUpgrade} size="lg">
            Fazer Upgrade
          </Button>
        </div>
      )}
    </div>
  );
}
