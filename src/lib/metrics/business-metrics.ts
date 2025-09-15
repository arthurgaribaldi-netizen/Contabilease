/**
 * Sistema de Métricas de Negócio - Micro SaaS 2025
 * 
 * Implementa as métricas essenciais para micro SaaS:
 * - MRR (Monthly Recurring Revenue)
 * - CAC (Customer Acquisition Cost)
 * - LTV (Lifetime Value)
 * - Churn Rate
 * - Conversion Funnel
 * - Product-Market Fit Score
 */

export interface BusinessMetrics {
  // Métricas de Receita
  mrr: number;
  arr: number;
  revenueGrowth: number;
  
  // Métricas de Clientes
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  
  // Métricas de Conversão
  trialToPaidConversion: number;
  freeToPaidConversion: number;
  upgradeRate: number;
  
  // Métricas de Aquisição
  cac: number;
  cacPaybackPeriod: number;
  ltvcacRatio: number;
  
  // Métricas de Retenção
  monthlyChurnRate: number;
  annualChurnRate: number;
  customerLifetimeValue: number;
  
  // Métricas de Produto
  productMarketFitScore: number;
  netPromoterScore: number;
  customerSatisfactionScore: number;
  
  // Métricas de Engajamento
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  featureAdoptionRate: number;
}

export interface ConversionFunnel {
  visitors: number;
  signups: number;
  trials: number;
  paidCustomers: number;
  
  // Taxas de conversão
  visitorToSignup: number;
  signupToTrial: number;
  trialToPaid: number;
  overallConversion: number;
}

export interface CohortAnalysis {
  cohort: string; // YYYY-MM
  initialCustomers: number;
  month1: number;
  month2: number;
  month3: number;
  month6: number;
  month12: number;
}

export class BusinessMetricsCalculator {
  /**
   * Calcula MRR (Monthly Recurring Revenue)
   */
  static calculateMRR(subscriptions: Array<{
    monthlyPrice: number;
    status: 'active' | 'cancelled' | 'paused';
  }>): number {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => total + sub.monthlyPrice, 0);
  }

  /**
   * Calcula ARR (Annual Recurring Revenue)
   */
  static calculateARR(mrr: number): number {
    return mrr * 12;
  }

  /**
   * Calcula CAC (Customer Acquisition Cost)
   */
  static calculateCAC(
    totalMarketingSpend: number,
    totalSalesSpend: number,
    newCustomers: number
  ): number {
    if (newCustomers === 0) return 0;
    return (totalMarketingSpend + totalSalesSpend) / newCustomers;
  }

  /**
   * Calcula LTV (Lifetime Value)
   */
  static calculateLTV(
    averageRevenuePerUser: number,
    grossMargin: number,
    churnRate: number
  ): number {
    if (churnRate === 0) return Infinity;
    return (averageRevenuePerUser * grossMargin) / churnRate;
  }

  /**
   * Calcula Taxa de Churn
   */
  static calculateChurnRate(
    customersAtStart: number,
    customersLost: number
  ): number {
    if (customersAtStart === 0) return 0;
    return customersLost / customersAtStart;
  }

  /**
   * Calcula Product-Market Fit Score
   * Baseado na metodologia de Sean Ellis
   */
  static calculateProductMarketFitScore(
    surveyResponses: Array<{
      wouldBeDisappointed: boolean;
      neutral: boolean;
      wouldNotMiss: boolean;
    }>
  ): number {
    const totalResponses = surveyResponses.length;
    if (totalResponses === 0) return 0;

    const disappointedCount = surveyResponses.filter(r => r.wouldBeDisappointed).length;
    return (disappointedCount / totalResponses) * 100;
  }

  /**
   * Calcula Net Promoter Score (NPS)
   */
  static calculateNPS(
    promoters: number,
    detractors: number,
    totalResponses: number
  ): number {
    if (totalResponses === 0) return 0;
    return ((promoters - detractors) / totalResponses) * 100;
  }

  /**
   * Calcula métricas de funil de conversão
   */
  static calculateConversionFunnel(
    visitors: number,
    signups: number,
    trials: number,
    paidCustomers: number
  ): ConversionFunnel {
    return {
      visitors,
      signups,
      trials,
      paidCustomers,
      visitorToSignup: visitors > 0 ? (signups / visitors) * 100 : 0,
      signupToTrial: signups > 0 ? (trials / signups) * 100 : 0,
      trialToPaid: trials > 0 ? (paidCustomers / trials) * 100 : 0,
      overallConversion: visitors > 0 ? (paidCustomers / visitors) * 100 : 0,
    };
  }

  /**
   * Calcula análise de coorte
   */
  static calculateCohortAnalysis(
    cohorts: Array<{
      cohort: string;
      customers: Array<{
        id: string;
        signupDate: Date;
        lastActiveDate: Date;
        status: 'active' | 'churned';
      }>;
    }>
  ): CohortAnalysis[] {
    return cohorts.map(cohort => {
      const initialCustomers = cohort.customers.length;
      const now = new Date();
      
      const month1 = cohort.customers.filter(c => {
        const month1Date = new Date(c.signupDate);
        month1Date.setMonth(month1Date.getMonth() + 1);
        return c.lastActiveDate >= month1Date && c.status === 'active';
      }).length;

      const month2 = cohort.customers.filter(c => {
        const month2Date = new Date(c.signupDate);
        month2Date.setMonth(month2Date.getMonth() + 2);
        return c.lastActiveDate >= month2Date && c.status === 'active';
      }).length;

      const month3 = cohort.customers.filter(c => {
        const month3Date = new Date(c.signupDate);
        month3Date.setMonth(month3Date.getMonth() + 3);
        return c.lastActiveDate >= month3Date && c.status === 'active';
      }).length;

      const month6 = cohort.customers.filter(c => {
        const month6Date = new Date(c.signupDate);
        month6Date.setMonth(month6Date.getMonth() + 6);
        return c.lastActiveDate >= month6Date && c.status === 'active';
      }).length;

      const month12 = cohort.customers.filter(c => {
        const month12Date = new Date(c.signupDate);
        month12Date.setMonth(month12Date.getMonth() + 12);
        return c.lastActiveDate >= month12Date && c.status === 'active';
      }).length;

      return {
        cohort: cohort.cohort,
        initialCustomers,
        month1,
        month2,
        month3,
        month6,
        month12,
      };
    });
  }

  /**
   * Calcula métricas de saúde do negócio
   */
  static calculateBusinessHealth(metrics: BusinessMetrics): {
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    recommendations: string[];
  } {
    let score = 0;
    const recommendations: string[] = [];

    // MRR Growth (25 pontos)
    if (metrics.revenueGrowth > 20) {
      score += 25;
    } else if (metrics.revenueGrowth > 10) {
      score += 20;
    } else if (metrics.revenueGrowth > 5) {
      score += 15;
      recommendations.push('MRR crescendo lentamente - considere otimizar conversão');
    } else {
      score += 5;
      recommendations.push('MRR estagnado - revisar estratégia de crescimento');
    }

    // Churn Rate (25 pontos)
    if (metrics.monthlyChurnRate < 2) {
      score += 25;
    } else if (metrics.monthlyChurnRate < 5) {
      score += 20;
    } else if (metrics.monthlyChurnRate < 10) {
      score += 15;
      recommendations.push('Churn alto - melhorar experiência do cliente');
    } else {
      score += 5;
      recommendations.push('Churn crítico - investigar causas de cancelamento');
    }

    // LTV:CAC Ratio (25 pontos)
    if (metrics.ltvcacRatio > 3) {
      score += 25;
    } else if (metrics.ltvcacRatio > 2) {
      score += 20;
    } else if (metrics.ltvcacRatio > 1) {
      score += 15;
      recommendations.push('LTV:CAC baixo - otimizar aquisição ou aumentar LTV');
    } else {
      score += 5;
      recommendations.push('LTV:CAC insustentável - revisar modelo de negócio');
    }

    // Product-Market Fit (25 pontos)
    if (metrics.productMarketFitScore > 40) {
      score += 25;
    } else if (metrics.productMarketFitScore > 30) {
      score += 20;
    } else if (metrics.productMarketFitScore > 20) {
      score += 15;
      recommendations.push('PMF moderado - focar em melhorias de produto');
    } else {
      score += 5;
      recommendations.push('PMF baixo - revisar proposta de valor');
    }

    let status: 'excellent' | 'good' | 'warning' | 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'warning';
    else status = 'critical';

    return { score, status, recommendations };
  }
}

/**
 * Hook para métricas de negócio em tempo real
 */
export function useBusinessMetrics() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Simular API call - substituir por chamada real
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados para demonstração
        const mockMetrics: BusinessMetrics = {
          mrr: 4850,
          arr: 58200,
          revenueGrowth: 15.2,
          totalCustomers: 156,
          activeCustomers: 142,
          newCustomers: 23,
          churnedCustomers: 8,
          trialToPaidConversion: 18.5,
          freeToPaidConversion: 12.3,
          upgradeRate: 8.7,
          cac: 127,
          cacPaybackPeriod: 3.2,
          ltvcacRatio: 2.8,
          monthlyChurnRate: 4.2,
          annualChurnRate: 35.1,
          customerLifetimeValue: 356,
          productMarketFitScore: 38.5,
          netPromoterScore: 52,
          customerSatisfactionScore: 4.2,
          dailyActiveUsers: 89,
          monthlyActiveUsers: 142,
          averageSessionDuration: 12.5,
          featureAdoptionRate: 67.8,
        };

        setMetrics(mockMetrics);
      } catch (err) {
        setError('Erro ao carregar métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}
