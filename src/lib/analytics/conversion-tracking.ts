/**
 * Sistema de Tracking de Conversão - Micro SaaS 2025
 *
 * Implementa tracking completo do funil de conversão:
 * - Visitor → Signup → Trial → Paid
 * - Métricas de engajamento
 * - Análise de coorte
 * - A/B Testing
 * - Heatmaps e comportamento
 */

import { logger } from '../logger';

export interface ConversionEvent {
  eventType:
    | 'page_view'
    | 'signup'
    | 'trial_start'
    | 'trial_end'
    | 'paid_conversion'
    | 'churn'
    | 'feature_usage';
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface FunnelStep {
  step: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface CohortData {
  cohort: string; // YYYY-MM
  users: number;
  retention: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
  };
  revenue: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
  };
}

export interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Array<{
    id: string;
    name: string;
    traffic: number; // percentage
    conversions: number;
    revenue: number;
  }>;
  startDate: Date;
  endDate?: Date;
  winner?: string;
  confidence: number;
}

export class ConversionTracker {
  private events: ConversionEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track a conversion event
   */
  track(eventType: ConversionEvent['eventType'], properties: Record<string, any> = {}): void {
    const event: ConversionEvent = {
      eventType,
      sessionId: this.sessionId,
      timestamp: new Date(),
      properties,
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties: Record<string, any> = {}): void {
    this.track('page_view', {
      page,
      ...properties,
    });
  }

  /**
   * Track signup
   */
  trackSignup(userId: string, properties: Record<string, any> = {}): void {
    this.track('signup', {
      userId,
      ...properties,
    });
  }

  /**
   * Track trial start
   */
  trackTrialStart(userId: string, properties: Record<string, any> = {}): void {
    this.track('trial_start', {
      userId,
      ...properties,
    });
  }

  /**
   * Track paid conversion
   */
  trackPaidConversion(
    userId: string,
    plan: string,
    revenue: number,
    properties: Record<string, any> = {}
  ): void {
    this.track('paid_conversion', {
      userId,
      plan,
      revenue,
      ...properties,
    });
  }

  /**
   * Track churn
   */
  trackChurn(userId: string, reason?: string, properties: Record<string, any> = {}): void {
    this.track('churn', {
      userId,
      reason,
      ...properties,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(userId: string, feature: string, properties: Record<string, any> = {}): void {
    this.track('feature_usage', {
      userId,
      feature,
      ...properties,
    });
  }

  /**
   * Calculate conversion funnel
   */
  calculateFunnel(steps: string[], dateRange?: { start: Date; end: Date }): FunnelStep[] {
    const filteredEvents = dateRange
      ? this.events.filter(e => e.timestamp >= dateRange.start && e.timestamp <= dateRange.end)
      : this.events;

    const funnel: FunnelStep[] = [];
    let previousVisitors = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepEvents = filteredEvents.filter(e => e.eventType === step);

      const visitors = i === 0 ? stepEvents.length : previousVisitors;
      const conversions = stepEvents.length;
      const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
      const dropOffRate = visitors > 0 ? ((visitors - conversions) / visitors) * 100 : 0;

      funnel.push({
        step,
        visitors,
        conversions,
        conversionRate,
        dropOffRate,
      });

      previousVisitors = conversions;
    }

    return funnel;
  }

  /**
   * Calculate cohort analysis
   */
  calculateCohortAnalysis(): CohortData[] {
    const cohorts = new Map<string, CohortData>();

    // Group events by cohort (signup month)
    this.events
      .filter(e => e.eventType === 'signup')
      .forEach(event => {
        const cohort = event.timestamp.toISOString().substring(0, 7); // YYYY-MM

        if (!cohorts.has(cohort)) {
          cohorts.set(cohort, {
            cohort,
            users: 0,
            retention: { day1: 0, day7: 0, day14: 0, day30: 0 },
            revenue: { day1: 0, day7: 0, day14: 0, day30: 0 },
          });
        }

        const cohortData = cohorts.get(cohort)!;
        cohortData.users++;
      });

    // Calculate retention and revenue for each cohort
    cohorts.forEach((cohortData, cohort) => {
      const cohortStart = new Date(cohort + '-01');

      // Get users who signed up in this cohort
      const cohortUsers = this.events
        .filter(
          e => e.eventType === 'signup' && e.timestamp.toISOString().substring(0, 7) === cohort
        )
        .map(e => e.properties.userId);

      // Calculate retention rates
      const day1 = this.calculateRetention(cohortUsers, cohortStart, 1);
      const day7 = this.calculateRetention(cohortUsers, cohortStart, 7);
      const day14 = this.calculateRetention(cohortUsers, cohortStart, 14);
      const day30 = this.calculateRetention(cohortUsers, cohortStart, 30);

      cohortData.retention = { day1, day7, day14, day30 };

      // Calculate revenue
      const day1Revenue = this.calculateRevenue(cohortUsers, cohortStart, 1);
      const day7Revenue = this.calculateRevenue(cohortUsers, cohortStart, 7);
      const day14Revenue = this.calculateRevenue(cohortUsers, cohortStart, 14);
      const day30Revenue = this.calculateRevenue(cohortUsers, cohortStart, 30);

      cohortData.revenue = {
        day1: day1Revenue,
        day7: day7Revenue,
        day14: day14Revenue,
        day30: day30Revenue,
      };
    });

    return Array.from(cohorts.values()).sort((a, b) => a.cohort.localeCompare(b.cohort));
  }

  private calculateRetention(userIds: string[], cohortStart: Date, days: number): number {
    const endDate = new Date(cohortStart);
    endDate.setDate(endDate.getDate() + days);

    const activeUsers = userIds.filter(userId => {
      const userEvents = this.events.filter(e => e.properties.userId === userId);
      return userEvents.some(e => e.timestamp >= cohortStart && e.timestamp <= endDate);
    });

    return userIds.length > 0 ? (activeUsers.length / userIds.length) * 100 : 0;
  }

  private calculateRevenue(userIds: string[], cohortStart: Date, days: number): number {
    const endDate = new Date(cohortStart);
    endDate.setDate(endDate.getDate() + days);

    return userIds.reduce((total, userId) => {
      const revenueEvents = this.events.filter(
        e =>
          e.properties.userId === userId &&
          e.eventType === 'paid_conversion' &&
          e.timestamp >= cohortStart &&
          e.timestamp <= endDate
      );

      const userRevenue = revenueEvents.reduce(
        (sum, event) => sum + (event.properties.revenue || 0),
        0
      );
      return total + userRevenue;
    }, 0);
  }

  /**
   * Run A/B test
   */
  runABTest(testId: string, userId: string, variants: string[]): string {
    // Simple hash-based assignment for consistency
    const hash = this.hashString(userId + testId);
    const variantIndex = hash % variants.length;
    const selectedVariant = variants[variantIndex];

    this.track('ab_test_assignment', {
      testId,
      userId,
      variant: selectedVariant,
    });

    return selectedVariant;
  }

  /**
   * Analyze A/B test results
   */
  analyzeABTest(testId: string): ABTest | null {
    const testEvents = this.events.filter(e => e.properties.testId === testId);

    if (testEvents.length === 0) return null;

    const variants = new Map<string, { conversions: number; revenue: number }>();

    testEvents.forEach(event => {
      const variant = event.properties.variant;
      if (!variants.has(variant)) {
        variants.set(variant, { conversions: 0, revenue: 0 });
      }

      const variantData = variants.get(variant)!;
      if (event.eventType === 'paid_conversion') {
        variantData.conversions++;
        variantData.revenue += event.properties.revenue || 0;
      }
    });

    const test: ABTest = {
      id: testId,
      name: `Test ${testId}`,
      status: 'running',
      variants: Array.from(variants.entries()).map(([id, data]) => ({
        id,
        name: `Variant ${id}`,
        traffic: 50, // Simplified
        conversions: data.conversions,
        revenue: data.revenue,
      })),
      startDate: testEvents[0].timestamp,
      confidence: this.calculateConfidence(variants),
    };

    return test;
  }

  private calculateConfidence(
    variants: Map<string, { conversions: number; revenue: number }>
  ): number {
    // Simplified confidence calculation
    const variantData = Array.from(variants.values());
    if (variantData.length < 2) return 0;

    const [variantA, variantB] = variantData;
    const totalConversions = variantA.conversions + variantB.conversions;

    if (totalConversions === 0) return 0;

    // Basic statistical significance calculation
    const difference = Math.abs(variantA.conversions - variantB.conversions);
    const confidence = Math.min(95, (difference / totalConversions) * 100);

    return confidence;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Send event to analytics service
   */
  private sendToAnalytics(event: ConversionEvent): void {
    // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
    logger.info(
      'Analytics Event',
      {
        component: 'conversion-tracking',
        operation: 'sendToAnalytics',
        eventType: event.eventType,
      },
      undefined,
      {
        event,
      }
    );

    // Example: Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.eventType, {
        event_category: 'conversion',
        event_label: event.properties.page || event.properties.feature,
        value: event.properties.revenue || 0,
        custom_map: event.properties,
      });
    }
  }

  /**
   * Get conversion metrics
   */
  getConversionMetrics(): {
    totalVisitors: number;
    totalSignups: number;
    totalTrials: number;
    totalPaid: number;
    signupRate: number;
    trialRate: number;
    paidRate: number;
    overallConversionRate: number;
  } {
    const visitors = this.events.filter(e => e.eventType === 'page_view').length;
    const signups = this.events.filter(e => e.eventType === 'signup').length;
    const trials = this.events.filter(e => e.eventType === 'trial_start').length;
    const paid = this.events.filter(e => e.eventType === 'paid_conversion').length;

    return {
      totalVisitors: visitors,
      totalSignups: signups,
      totalTrials: trials,
      totalPaid: paid,
      signupRate: visitors > 0 ? (signups / visitors) * 100 : 0,
      trialRate: signups > 0 ? (trials / signups) * 100 : 0,
      paidRate: trials > 0 ? (paid / trials) * 100 : 0,
      overallConversionRate: visitors > 0 ? (paid / visitors) * 100 : 0,
    };
  }
}

/**
 * Global conversion tracker instance
 */
export const conversionTracker = new ConversionTracker();

/**
 * React hook for conversion tracking
 */
export function useConversionTracking() {
  const trackPageView = (page: string, properties?: Record<string, any>) => {
    conversionTracker.trackPageView(page, properties);
  };

  const trackSignup = (userId: string, properties?: Record<string, any>) => {
    conversionTracker.trackSignup(userId, properties);
  };

  const trackTrialStart = (userId: string, properties?: Record<string, any>) => {
    conversionTracker.trackTrialStart(userId, properties);
  };

  const trackPaidConversion = (
    userId: string,
    plan: string,
    revenue: number,
    properties?: Record<string, any>
  ) => {
    conversionTracker.trackPaidConversion(userId, plan, revenue, properties);
  };

  const trackChurn = (userId: string, reason?: string, properties?: Record<string, any>) => {
    conversionTracker.trackChurn(userId, reason, properties);
  };

  const trackFeatureUsage = (userId: string, feature: string, properties?: Record<string, any>) => {
    conversionTracker.trackFeatureUsage(userId, feature, properties);
  };

  const getMetrics = () => {
    return conversionTracker.getConversionMetrics();
  };

  const getFunnel = (steps: string[]) => {
    return conversionTracker.calculateFunnel(steps);
  };

  const getCohortAnalysis = () => {
    return conversionTracker.calculateCohortAnalysis();
  };

  return {
    trackPageView,
    trackSignup,
    trackTrialStart,
    trackPaidConversion,
    trackChurn,
    trackFeatureUsage,
    getMetrics,
    getFunnel,
    getCohortAnalysis,
  };
}
