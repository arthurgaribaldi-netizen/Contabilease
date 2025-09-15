/**
 * IFRS 16 Sensitivity Analysis Engine
 *
 * Implements sensitivity analysis and stress testing for IFRS 16 lease contracts:
 * - Interest rate sensitivity
 * - Payment amount sensitivity
 * - Term sensitivity
 * - Stress scenarios
 * - Monte Carlo simulations
 */

import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';
import { IFRS16CalculationResult, IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { IFRS16CalculationEngine } from './ifrs16-engine';

export interface SensitivityParameter {
  parameter_name: string;
  base_value: number;
  unit: string;
  variations: number[];
}

export interface SensitivityResult {
  parameter: string;
  base_value: number;
  variations: Array<{
    variation_percent: number;
    new_value: number;
    lease_liability_change: number;
    right_of_use_asset_change: number;
    total_payment_change: number;
    impact_percentage: number;
  }>;
}

export interface StressScenario {
  scenario_name: string;
  scenario_type:
    | 'interest_rate_shock'
    | 'payment_reduction'
    | 'early_termination'
    | 'market_crash'
    | 'custom';
  description: string;
  probability: number; // 0-100%
  severity: 'low' | 'medium' | 'high' | 'extreme';
  parameters: {
    discount_rate_change?: number;
    payment_change_percent?: number;
    term_reduction_months?: number;
    market_value_decline?: number;
  };
  impact: {
    lease_liability_change: number;
    right_of_use_asset_change: number;
    total_financial_impact: number;
    probability_weighted_impact: number;
  };
}

export interface MonteCarloSimulation {
  simulation_name: string;
  iterations: number;
  parameters: {
    discount_rate_mean: number;
    discount_rate_std: number;
    payment_mean: number;
    payment_std: number;
    term_mean: number;
    term_std: number;
  };
  results: {
    lease_liability_stats: {
      mean: number;
      median: number;
      std_dev: number;
      min: number;
      max: number;
      percentile_5: number;
      percentile_95: number;
    };
    right_of_use_asset_stats: {
      mean: number;
      median: number;
      std_dev: number;
      min: number;
      max: number;
      percentile_5: number;
      percentile_95: number;
    };
    probability_distribution: Array<{
      range: string;
      probability: number;
      count: number;
    }>;
  };
}

export interface SensitivityAnalysis {
  contract_id: string;
  analysis_date: string;
  base_calculation: IFRS16CalculationResult;
  sensitivity_results: SensitivityResult[];
  stress_scenarios: StressScenario[];
  monte_carlo_simulation?: MonteCarloSimulation;
  key_findings: string[];
  recommendations: string[];
}

export class IFRS16SensitivityEngine {
  private contractData: IFRS16CompleteData;
  private calculationEngine: IFRS16CalculationEngine;

  constructor(contractData: IFRS16CompleteData) {
    this.contractData = contractData;
    this.calculationEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(contractData));
  }

  private convertToLeaseFormData(completeData: IFRS16CompleteData): IFRS16LeaseFormData {
    return {
      title: completeData.title,
      status: completeData.status as 'draft' | 'active' | 'completed' | 'cancelled',
      currency_code: completeData.currency_code,
      lease_start_date: completeData.lease_start_date,
      lease_end_date: completeData.lease_end_date,
      lease_term_months: completeData.lease_term_months,
      initial_payment: completeData.initial_payment,
      monthly_payment: completeData.monthly_payment,
      payment_frequency: completeData.payment_frequency,
      discount_rate_annual: completeData.discount_rate_annual,
      discount_rate_monthly: completeData.discount_rate_monthly,
      asset_fair_value: completeData.asset_fair_value,
      asset_residual_value: completeData.asset_residual_value,
      initial_direct_costs: completeData.initial_direct_costs,
      lease_incentives: completeData.lease_incentives,
      payment_timing: completeData.payment_timing,
      lease_classification: completeData.lease_classification,
      escalation_rate: completeData.escalation_rate,
      variable_payments: completeData.variable_payments,
      guaranteed_residual_value: completeData.guaranteed_residual_value,
      purchase_option_price: completeData.contract_options?.purchase_options?.[0]?.purchase_price,
      purchase_option_exercisable:
        completeData.contract_options?.purchase_options?.[0]?.exercisable,
      renewal_options: completeData.contract_options?.renewal_options?.map(opt => ({
        term_months: opt.new_term_months,
        monthly_payment: opt.new_monthly_payment,
        probability: opt.probability_percentage,
      })),
    };
  }

  /**
   * Perform comprehensive sensitivity analysis
   */
  performSensitivityAnalysis(): SensitivityAnalysis {
    const baseCalculation = this.calculationEngine.calculateAll();
    const sensitivityResults = this.calculateSensitivityResults(baseCalculation);
    const stressScenarios = this.generateStressScenarios(baseCalculation);
    const monteCarloSimulation = this.performMonteCarloSimulation();

    const keyFindings = this.generateKeyFindings(sensitivityResults, stressScenarios);
    const recommendations = this.generateRecommendations(sensitivityResults, stressScenarios);

    return {
      contract_id: this.contractData.contract_id,
      analysis_date: new Date().toISOString().split('T')[0],
      base_calculation: baseCalculation,
      sensitivity_results: sensitivityResults,
      stress_scenarios: stressScenarios,
      monte_carlo_simulation: monteCarloSimulation,
      key_findings: keyFindings,
      recommendations,
    };
  }

  /**
   * Calculate sensitivity to key parameters
   */
  private calculateSensitivityResults(
    baseCalculation: IFRS16CalculationResult
  ): SensitivityResult[] {
    const results: SensitivityResult[] = [];

    // Interest rate sensitivity
    results.push(this.calculateInterestRateSensitivity(baseCalculation));

    // Payment amount sensitivity
    results.push(this.calculatePaymentSensitivity(baseCalculation));

    // Term sensitivity
    results.push(this.calculateTermSensitivity(baseCalculation));

    return results;
  }

  /**
   * Calculate interest rate sensitivity
   */
  private calculateInterestRateSensitivity(
    baseCalculation: IFRS16CalculationResult
  ): SensitivityResult {
    const baseRate = this.contractData.discount_rate_annual;
    const variations = [-2, -1, -0.5, 0.5, 1, 2]; // Percentage points
    const variationResults: SensitivityResult['variations'] = [];

    variations.forEach(variation => {
      const newRate = baseRate + variation;
      const modifiedData = { ...this.contractData, discount_rate_annual: newRate };
      const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
      const modifiedCalculation = modifiedEngine.calculateAll();

      variationResults.push({
        variation_percent: variation,
        new_value: newRate,
        lease_liability_change:
          modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial,
        right_of_use_asset_change:
          modifiedCalculation.right_of_use_asset_initial -
          baseCalculation.right_of_use_asset_initial,
        total_payment_change:
          modifiedCalculation.total_lease_payments - baseCalculation.total_lease_payments,
        impact_percentage:
          ((modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial) /
            baseCalculation.lease_liability_initial) *
          100,
      });
    });

    return {
      parameter: 'Taxa de Desconto',
      base_value: baseRate,
      variations: variationResults,
    };
  }

  /**
   * Calculate payment amount sensitivity
   */
  private calculatePaymentSensitivity(baseCalculation: IFRS16CalculationResult): SensitivityResult {
    const basePayment = this.contractData.monthly_payment;
    const variations = [-20, -10, -5, 5, 10, 20]; // Percentage
    const variationResults: SensitivityResult['variations'] = [];

    variations.forEach(variation => {
      const newPayment = basePayment * (1 + variation / 100);
      const modifiedData = { ...this.contractData, monthly_payment: newPayment };
      const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
      const modifiedCalculation = modifiedEngine.calculateAll();

      variationResults.push({
        variation_percent: variation,
        new_value: newPayment,
        lease_liability_change:
          modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial,
        right_of_use_asset_change:
          modifiedCalculation.right_of_use_asset_initial -
          baseCalculation.right_of_use_asset_initial,
        total_payment_change:
          modifiedCalculation.total_lease_payments - baseCalculation.total_lease_payments,
        impact_percentage:
          ((modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial) /
            baseCalculation.lease_liability_initial) *
          100,
      });
    });

    return {
      parameter: 'Pagamento Mensal',
      base_value: basePayment,
      variations: variationResults,
    };
  }

  /**
   * Calculate term sensitivity
   */
  private calculateTermSensitivity(baseCalculation: IFRS16CalculationResult): SensitivityResult {
    const baseTerm = this.contractData.lease_term_months;
    const variations = [-12, -6, -3, 3, 6, 12]; // Months
    const variationResults: SensitivityResult['variations'] = [];

    variations.forEach(variation => {
      const newTerm = Math.max(1, baseTerm + variation);
      const modifiedData = { ...this.contractData, lease_term_months: newTerm };
      const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
      const modifiedCalculation = modifiedEngine.calculateAll();

      variationResults.push({
        variation_percent: (variation / baseTerm) * 100,
        new_value: newTerm,
        lease_liability_change:
          modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial,
        right_of_use_asset_change:
          modifiedCalculation.right_of_use_asset_initial -
          baseCalculation.right_of_use_asset_initial,
        total_payment_change:
          modifiedCalculation.total_lease_payments - baseCalculation.total_lease_payments,
        impact_percentage:
          ((modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial) /
            baseCalculation.lease_liability_initial) *
          100,
      });
    });

    return {
      parameter: 'Prazo do Contrato',
      base_value: baseTerm,
      variations: variationResults,
    };
  }

  /**
   * Generate stress scenarios
   */
  private generateStressScenarios(baseCalculation: IFRS16CalculationResult): StressScenario[] {
    const scenarios: StressScenario[] = [];

    // Interest rate shock scenario
    scenarios.push(this.createInterestRateShockScenario(baseCalculation));

    // Payment reduction scenario
    scenarios.push(this.createPaymentReductionScenario(baseCalculation));

    // Early termination scenario
    scenarios.push(this.createEarlyTerminationScenario(baseCalculation));

    // Market crash scenario
    scenarios.push(this.createMarketCrashScenario(baseCalculation));

    return scenarios;
  }

  private createInterestRateShockScenario(
    baseCalculation: IFRS16CalculationResult
  ): StressScenario {
    const shockRate = this.contractData.discount_rate_annual + 3; // +3 percentage points
    const modifiedData = { ...this.contractData, discount_rate_annual: shockRate };
    const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
    const modifiedCalculation = modifiedEngine.calculateAll();

    const liabilityChange =
      modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial;
    const assetChange =
      modifiedCalculation.right_of_use_asset_initial - baseCalculation.right_of_use_asset_initial;

    return {
      scenario_name: 'Choque de Taxa de Juros',
      scenario_type: 'interest_rate_shock',
      description: 'Aumento súbito de 3 pontos percentuais na taxa de desconto',
      probability: 15,
      severity: 'high',
      parameters: {
        discount_rate_change: 3,
      },
      impact: {
        lease_liability_change: liabilityChange,
        right_of_use_asset_change: assetChange,
        total_financial_impact: liabilityChange + assetChange,
        probability_weighted_impact: (liabilityChange + assetChange) * 0.15,
      },
    };
  }

  private createPaymentReductionScenario(baseCalculation: IFRS16CalculationResult): StressScenario {
    const reducedPayment = this.contractData.monthly_payment * 0.8; // 20% reduction
    const modifiedData = { ...this.contractData, monthly_payment: reducedPayment };
    const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
    const modifiedCalculation = modifiedEngine.calculateAll();

    const liabilityChange =
      modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial;
    const assetChange =
      modifiedCalculation.right_of_use_asset_initial - baseCalculation.right_of_use_asset_initial;

    return {
      scenario_name: 'Redução de Pagamentos',
      scenario_type: 'payment_reduction',
      description: 'Redução de 20% nos pagamentos mensais devido a dificuldades financeiras',
      probability: 10,
      severity: 'medium',
      parameters: {
        payment_change_percent: -20,
      },
      impact: {
        lease_liability_change: liabilityChange,
        right_of_use_asset_change: assetChange,
        total_financial_impact: liabilityChange + assetChange,
        probability_weighted_impact: (liabilityChange + assetChange) * 0.1,
      },
    };
  }

  private createEarlyTerminationScenario(baseCalculation: IFRS16CalculationResult): StressScenario {
    const reducedTerm = Math.max(1, this.contractData.lease_term_months - 12); // 12 months early
    const modifiedData = { ...this.contractData, lease_term_months: reducedTerm };
    const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
    const modifiedCalculation = modifiedEngine.calculateAll();

    const liabilityChange =
      modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial;
    const assetChange =
      modifiedCalculation.right_of_use_asset_initial - baseCalculation.right_of_use_asset_initial;

    return {
      scenario_name: 'Rescisão Antecipada',
      scenario_type: 'early_termination',
      description: 'Rescisão do contrato 12 meses antes do prazo original',
      probability: 5,
      severity: 'high',
      parameters: {
        term_reduction_months: -12,
      },
      impact: {
        lease_liability_change: liabilityChange,
        right_of_use_asset_change: assetChange,
        total_financial_impact: liabilityChange + assetChange,
        probability_weighted_impact: (liabilityChange + assetChange) * 0.05,
      },
    };
  }

  private createMarketCrashScenario(baseCalculation: IFRS16CalculationResult): StressScenario {
    const crashRate = this.contractData.discount_rate_annual + 5; // +5 percentage points
    const modifiedData = { ...this.contractData, discount_rate_annual: crashRate };
    const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
    const modifiedCalculation = modifiedEngine.calculateAll();

    const liabilityChange =
      modifiedCalculation.lease_liability_initial - baseCalculation.lease_liability_initial;
    const assetChange =
      modifiedCalculation.right_of_use_asset_initial - baseCalculation.right_of_use_asset_initial;

    return {
      scenario_name: 'Crise de Mercado',
      scenario_type: 'market_crash',
      description: 'Crise econômica com aumento de 5 pontos percentuais na taxa de desconto',
      probability: 3,
      severity: 'extreme',
      parameters: {
        discount_rate_change: 5,
        market_value_decline: 30,
      },
      impact: {
        lease_liability_change: liabilityChange,
        right_of_use_asset_change: assetChange,
        total_financial_impact: liabilityChange + assetChange,
        probability_weighted_impact: (liabilityChange + assetChange) * 0.03,
      },
    };
  }

  /**
   * Perform Monte Carlo simulation
   */
  private performMonteCarloSimulation(): MonteCarloSimulation {
    const iterations = 1000;
    const results: Array<{ lease_liability: number; right_of_use_asset: number }> = [];

    // Generate random variations for key parameters
    for (let i = 0; i < iterations; i++) {
      const discountRateVariation = this.generateNormalRandom(0, 1); // Mean 0, Std 1
      const paymentVariation = this.generateNormalRandom(0, 0.05); // Mean 0, Std 5%
      const termVariation = this.generateNormalRandom(0, 2); // Mean 0, Std 2 months

      const modifiedData = {
        ...this.contractData,
        discount_rate_annual: Math.max(
          0,
          this.contractData.discount_rate_annual + discountRateVariation
        ),
        monthly_payment: Math.max(0, this.contractData.monthly_payment * (1 + paymentVariation)),
        lease_term_months: Math.max(
          1,
          this.contractData.lease_term_months + Math.round(termVariation)
        ),
      };

      const modifiedEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(modifiedData));
      const calculation = modifiedEngine.calculateAll();

      results.push({
        lease_liability: calculation.lease_liability_initial,
        right_of_use_asset: calculation.right_of_use_asset_initial,
      });
    }

    // Calculate statistics
    const leaseLiabilityStats = this.calculateStatistics(results.map(r => r.lease_liability));
    const rightOfUseAssetStats = this.calculateStatistics(results.map(r => r.right_of_use_asset));

    // Generate probability distribution
    const probabilityDistribution = this.generateProbabilityDistribution(
      results.map(r => r.lease_liability)
    );

    return {
      simulation_name: 'Simulação Monte Carlo',
      iterations,
      parameters: {
        discount_rate_mean: this.contractData.discount_rate_annual,
        discount_rate_std: 1,
        payment_mean: this.contractData.monthly_payment,
        payment_std: this.contractData.monthly_payment * 0.05,
        term_mean: this.contractData.lease_term_months,
        term_std: 2,
      },
      results: {
        lease_liability_stats: leaseLiabilityStats,
        right_of_use_asset_stats: rightOfUseAssetStats,
        probability_distribution: probabilityDistribution,
      },
    };
  }

  /**
   * Generate key findings from analysis
   */
  private generateKeyFindings(
    sensitivityResults: SensitivityResult[],
    stressScenarios: StressScenario[]
  ): string[] {
    const findings: string[] = [];

    // Find most sensitive parameter
    const mostSensitive = sensitivityResults.reduce((max, result) => {
      const maxImpact = Math.max(...result.variations.map(v => Math.abs(v.impact_percentage)));
      const currentMaxImpact = Math.max(...max.variations.map(v => Math.abs(v.impact_percentage)));
      return maxImpact > currentMaxImpact ? result : max;
    });

    findings.push(
      `O parâmetro mais sensível é ${mostSensitive.parameter} com impacto máximo de ${Math.max(...mostSensitive.variations.map(v => Math.abs(v.impact_percentage))).toFixed(1)}%`
    );

    // Find highest risk scenario
    const highestRisk = stressScenarios.reduce((max, scenario) =>
      scenario.impact.total_financial_impact > max.impact.total_financial_impact ? scenario : max
    );

    findings.push(
      `O cenário de maior risco é "${highestRisk.scenario_name}" com impacto financeiro de ${highestRisk.impact.total_financial_impact.toLocaleString()} ${this.contractData.currency_code}`
    );

    // Calculate overall risk level
    const totalProbabilityWeightedImpact = stressScenarios.reduce(
      (sum, scenario) => sum + scenario.impact.probability_weighted_impact,
      0
    );

    if (totalProbabilityWeightedImpact > 10000) {
      findings.push(
        'Nível de risco geral: ALTO - Impacto financeiro significativo em cenários prováveis'
      );
    } else if (totalProbabilityWeightedImpact > 5000) {
      findings.push(
        'Nível de risco geral: MÉDIO - Impacto financeiro moderado em cenários prováveis'
      );
    } else {
      findings.push(
        'Nível de risco geral: BAIXO - Impacto financeiro limitado em cenários prováveis'
      );
    }

    return findings;
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    sensitivityResults: SensitivityResult[],
    stressScenarios: StressScenario[]
  ): string[] {
    const recommendations: string[] = [];

    // Interest rate sensitivity recommendations
    const interestRateResult = sensitivityResults.find(r => r.parameter === 'Taxa de Desconto');
    if (interestRateResult) {
      const maxImpact = Math.max(
        ...interestRateResult.variations.map(v => Math.abs(v.impact_percentage))
      );
      if (maxImpact > 10) {
        recommendations.push(
          'Considere hedge de taxa de juros devido à alta sensibilidade do contrato'
        );
      }
    }

    // Payment sensitivity recommendations
    const paymentResult = sensitivityResults.find(r => r.parameter === 'Pagamento Mensal');
    if (paymentResult) {
      const maxImpact = Math.max(
        ...paymentResult.variations.map(v => Math.abs(v.impact_percentage))
      );
      if (maxImpact > 15) {
        recommendations.push(
          'Implemente cláusulas de reajuste para mitigar riscos de variação de pagamentos'
        );
      }
    }

    // Stress scenario recommendations
    const extremeScenarios = stressScenarios.filter(s => s.severity === 'extreme');
    if (extremeScenarios.length > 0) {
      recommendations.push(
        'Desenvolva planos de contingência para cenários extremos identificados'
      );
    }

    const highProbabilityScenarios = stressScenarios.filter(s => s.probability > 10);
    if (highProbabilityScenarios.length > 0) {
      recommendations.push('Monitore indicadores de mercado para cenários de alta probabilidade');
    }

    return recommendations;
  }

  // Helper methods

  private generateNormalRandom(mean: number, stdDev: number): number {
    // Box-Muller transformation
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
  }

  private calculateStatistics(values: number[]): any {
    const sorted = values.sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      std_dev: stdDev,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentile_5: sorted[Math.floor(sorted.length * 0.05)],
      percentile_95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  private generateProbabilityDistribution(
    values: number[]
  ): Array<{ range: string; probability: number; count: number }> {
    const sorted = values.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const rangeSize = (max - min) / 10; // 10 buckets

    const distribution = [];
    for (let i = 0; i < 10; i++) {
      const rangeStart = min + i * rangeSize;
      const rangeEnd = min + (i + 1) * rangeSize;
      const count = sorted.filter(val => val >= rangeStart && val < rangeEnd).length;

      distribution.push({
        range: `${rangeStart.toFixed(0)} - ${rangeEnd.toFixed(0)}`,
        probability: (count / values.length) * 100,
        count,
      });
    }

    return distribution;
  }
}
