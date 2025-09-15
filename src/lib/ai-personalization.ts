'use client';

import { useCallback, useEffect, useState } from 'react';

interface UserBehavior {
  pageViews: Record<string, number>;
  timeSpent: Record<string, number>;
  actions: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
  lastActive: Date;
}

interface Recommendation {
  id: string;
  type: 'contract' | 'report' | 'action' | 'tip';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

interface AIPersonalizationHook {
  userBehavior: UserBehavior;
  recommendations: Recommendation[];
  isLoading: boolean;
  updateBehavior: (action: string, data?: Record<string, unknown>) => void;
  dismissRecommendation: (id: string) => void;
  getPersonalizedLayout: () => Record<string, unknown>;
}

const defaultBehavior: UserBehavior = {
  pageViews: {},
  timeSpent: {},
  actions: [],
  preferences: {
    theme: 'system',
    language: 'pt-BR',
    notifications: true,
  },
  lastActive: new Date(),
};

export function useAIPersonalization(): AIPersonalizationHook {
  const [userBehavior, setUserBehavior] = useState<UserBehavior>(defaultBehavior);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user behavior from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user-behavior');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserBehavior({
          ...parsed,
          lastActive: new Date(parsed.lastActive),
        });
      } catch (error) {
        console.error('Error loading user behavior:', error);
      }
    }
  }, []);

  // Save user behavior to localStorage
  useEffect(() => {
    localStorage.setItem('user-behavior', JSON.stringify(userBehavior));
  }, [userBehavior]);

  // Generate recommendations based on user behavior
  const generateRecommendations = useCallback((behavior: UserBehavior): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Analyze page views
    const mostViewedPage = Object.entries(behavior.pageViews).sort(([, a], [, b]) => b - a)[0];

    if (mostViewedPage && mostViewedPage[1] > 5) {
      recs.push({
        id: 'frequent-page',
        type: 'tip',
        title: 'Página Favorita',
        description: `Você visita "${mostViewedPage[0]}" frequentemente. Considere adicioná-la aos favoritos.`,
        priority: 'low',
      });
    }

    // Analyze time spent
    const avgTimeSpent =
      Object.values(behavior.timeSpent).reduce((a, b) => a + b, 0) /
      Object.keys(behavior.timeSpent).length;
    if (avgTimeSpent > 300) {
      // 5 minutes
      recs.push({
        id: 'time-spent',
        type: 'tip',
        title: 'Usuário Engajado',
        description:
          'Você passa bastante tempo analisando os dados. Que tal criar relatórios personalizados?',
        priority: 'medium',
        actionUrl: '/reports',
        actionLabel: 'Criar Relatório',
      });
    }

    // Analyze actions
    const contractActions = behavior.actions.filter(action => action.includes('contract')).length;
    if (contractActions > 3) {
      recs.push({
        id: 'contract-expert',
        type: 'action',
        title: 'Especialista em Contratos',
        description:
          'Você trabalha muito com contratos. Considere usar nossos templates avançados.',
        priority: 'high',
        actionUrl: '/contracts/templates',
        actionLabel: 'Ver Templates',
      });
    }

    // Check for compliance issues
    const complianceActions = behavior.actions.filter(action =>
      action.includes('compliance')
    ).length;
    if (complianceActions === 0) {
      recs.push({
        id: 'compliance-check',
        type: 'action',
        title: 'Verificação de Conformidade',
        description:
          'Você ainda não verificou a conformidade dos seus contratos. Recomendamos fazer isso regularmente.',
        priority: 'high',
        actionUrl: '/ifrs16-demo',
        actionLabel: 'Verificar Conformidade',
      });
    }

    return recs;
  }, []);

  // Update recommendations when behavior changes
  useEffect(() => {
    const newRecommendations = generateRecommendations(userBehavior);
    setRecommendations(newRecommendations);
  }, [userBehavior, generateRecommendations]);

  const updateBehavior = useCallback((action: string, data?: Record<string, unknown>) => {
    setUserBehavior(prev => ({
      ...prev,
      actions: [...prev.actions, action],
      lastActive: new Date(),
    }));

    // Track page views
    if (action === 'page-view' && data?.page) {
      setUserBehavior(prev => ({
        ...prev,
        pageViews: {
          ...prev.pageViews,
          [data.page]: (prev.pageViews[data.page] || 0) + 1,
        },
      }));
    }

    // Track time spent
    if (action === 'time-spent' && data?.page && data?.time) {
      setUserBehavior(prev => ({
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [data.page]: (prev.timeSpent[data.page] || 0) + data.time,
        },
      }));
    }
  }, []);

  const dismissRecommendation = useCallback((id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  }, []);

  const getPersonalizedLayout = useCallback(() => {
    // Analyze user behavior to determine optimal layout
    const totalPageViews = Object.values(userBehavior.pageViews).reduce((a, b) => a + b, 0);
    const avgTimePerPage =
      Object.values(userBehavior.timeSpent).reduce((a, b) => a + b, 0) /
      Math.max(Object.keys(userBehavior.timeSpent).length, 1);

    return {
      showAdvancedMetrics: totalPageViews > 10,
      showQuickActions: avgTimePerPage < 60, // Less than 1 minute per page
      showRecommendations: recommendations.length > 0,
      preferredChartType: avgTimePerPage > 120 ? 'detailed' : 'simple',
      showTutorials: userBehavior.actions.length < 5,
    };
  }, [userBehavior, recommendations]);

  return {
    userBehavior,
    recommendations,
    isLoading,
    updateBehavior,
    dismissRecommendation,
    getPersonalizedLayout,
  };
}
