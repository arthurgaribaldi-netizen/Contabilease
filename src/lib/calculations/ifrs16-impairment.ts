/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

/**
 * IFRS 16 Impairment Testing Engine
 *
 * Implements impairment testing per IFRS 16.40:
 * - Right-of-use asset impairment indicators
 * - Recoverable amount calculation
 * - Impairment loss recognition
 * - Impairment reversal testing
 */

import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';
import { IFRS16CalculationEngine } from './ifrs16-engine';

export interface ImpairmentIndicator {
  indicator_type: 'external' | 'internal' | 'asset_specific';
  description: string;
  severity: 'high' | 'medium' | 'low';
  impact_on_value: 'significant' | 'moderate' | 'minimal';
  evidence: string[];
  assessment_date: string;
}

export interface RecoverableAmount {
  value_in_use: number;
  fair_value_less_costs_to_sell: number;
  recoverable_amount: number;
  calculation_method: 'value_in_use' | 'fair_value_less_costs_to_sell';
  assumptions: {
    discount_rate: number;
    growth_rate: number;
    useful_life: number;
    residual_value: number;
  };
  calculation_date: string;
}

export interface ImpairmentTest {
  test_date: string;
  carrying_amount: number;
  recoverable_amount: number;
  impairment_loss: number;
  indicators_present: ImpairmentIndicator[];
  recoverable_amount_calculation: RecoverableAmount;
  conclusion: 'impaired' | 'not_impaired';
  next_test_date?: string;
}

export interface ImpairmentReversal {
  reversal_date: string;
  previous_impairment_loss: number;
  new_recoverable_amount: number;
  reversal_amount: number;
  reversal_reason: string;
  evidence: string[];
}

export interface ImpairmentAnalysis {
  contract_id: string;
  asset_description: string;
  current_tests: ImpairmentTest[];
  reversal_history: ImpairmentReversal[];
  impairment_status: 'not_impaired' | 'impaired' | 'reversed';
  total_impairment_loss: number;
  net_carrying_amount: number;
  analysis_date: string;
  next_required_test?: string;
}

export class IFRS16ImpairmentEngine {
  private contractData: IFRS16CompleteData;
  private calculationEngine: IFRS16CalculationEngine;

  constructor(contractData: IFRS16CompleteData) {
    this.contractData = contractData;
    this.calculationEngine = new IFRS16CalculationEngine(this.convertToLeaseFormData(contractData));
  }

  private convertToLeaseFormData(completeData: IFRS16CompleteData): any {
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
   * Identify impairment indicators (IFRS 16.40)
   */
  identifyImpairmentIndicators(): ImpairmentIndicator[] {
    const indicators: ImpairmentIndicator[] = [];
    const _currentDate = new Date();
    const _leaseStartDate = new Date(this.contractData.lease_start_date);    
    const _leaseEndDate = new Date(this.contractData.lease_end_date);

    // External indicators
    indicators.push(...this.identifyExternalIndicators());

    // Internal indicators
    indicators.push(...this.identifyInternalIndicators());

    // Asset-specific indicators
    indicators.push(...this.identifyAssetSpecificIndicators());

    return indicators.filter(indicator => indicator.severity !== 'low');
  }

  /**
   * Calculate recoverable amount
   */
  calculateRecoverableAmount(): RecoverableAmount {
    const valueInUse = this.calculateValueInUse();
    const fairValueLessCostsToSell = this.calculateFairValueLessCostsToSell();

    const recoverableAmount = Math.max(valueInUse, fairValueLessCostsToSell);
    const calculationMethod =
      valueInUse >= fairValueLessCostsToSell ? 'value_in_use' : 'fair_value_less_costs_to_sell';

    return {
      value_in_use: valueInUse,
      fair_value_less_costs_to_sell: fairValueLessCostsToSell,
      recoverable_amount: recoverableAmount,
      calculation_method: calculationMethod,
      assumptions: {
        discount_rate: this.contractData.discount_rate_annual,
        growth_rate: this.calculateGrowthRate(),
        useful_life: this.contractData.lease_term_months,
        residual_value: this.contractData.asset_residual_value || 0,
      },
      calculation_date: new Date().toISOString().split('T')[0] ?? '',
    };
  }

  /**
   * Perform impairment test
   */
  performImpairmentTest(): ImpairmentTest {
    const testDate = new Date().toISOString().split('T')[0];
    const indicators = this.identifyImpairmentIndicators();
    const recoverableAmount = this.calculateRecoverableAmount();

    // Get current carrying amount from calculation engine
    const calculationResult = this.calculationEngine.calculateAll();
    const carryingAmount = calculationResult.right_of_use_asset_current;

    const impairmentLoss = Math.max(0, carryingAmount - recoverableAmount.recoverable_amount);
    const conclusion = impairmentLoss > 0 ? 'impaired' : 'not_impaired';

    // Determine next test date (annually or when indicators change)
    const nextTestDate = this.calculateNextTestDate(indicators);

    return {
      test_date: testDate ?? '',
      carrying_amount: carryingAmount,
      recoverable_amount: recoverableAmount.recoverable_amount,
      impairment_loss: impairmentLoss,
      indicators_present: indicators,
      recoverable_amount_calculation: recoverableAmount,
      conclusion,
      next_test_date: nextTestDate,
    };
  }

  /**
   * Perform complete impairment analysis
   */
  performImpairmentAnalysis(): ImpairmentAnalysis {
    const currentTest = this.performImpairmentTest();
    const reversalHistory: ImpairmentReversal[] = []; // Would be populated from historical data

    const impairmentStatus = this.determineImpairmentStatus(currentTest, reversalHistory);
    const totalImpairmentLoss = this.calculateTotalImpairmentLoss([currentTest], reversalHistory);
    const netCarryingAmount = currentTest.carrying_amount - totalImpairmentLoss;

    return {
      contract_id: this.contractData.contract_id,
      asset_description: this.contractData.asset?.asset_description || 'Ativo não especificado',
      current_tests: [currentTest],
      reversal_history: reversalHistory,
      impairment_status: impairmentStatus,
      total_impairment_loss: totalImpairmentLoss,
      net_carrying_amount: netCarryingAmount,
      analysis_date: new Date().toISOString().split('T')[0] ?? '',
      next_required_test: currentTest.next_test_date,
    };
  }

  // Private helper methods

  private identifyExternalIndicators(): ImpairmentIndicator[] {
    const indicators: ImpairmentIndicator[] = [];

    // Market value decline
    if (this.contractData.asset_fair_value) {
      const marketValue = this.contractData.asset_fair_value;
      const carryingAmount = this.calculationEngine.calculateAll().right_of_use_asset_current;

      if (marketValue < carryingAmount * 0.8) {
        indicators.push({
          indicator_type: 'external',
          description: 'Declínio significativo no valor de mercado do ativo',
          severity: 'high',
          impact_on_value: 'significant',
          evidence: [`Valor de mercado: ${marketValue}`, `Valor contábil: ${carryingAmount}`],
          assessment_date: new Date().toISOString().split('T')[0] ?? '',
        });
      }
    }

    // Interest rate changes
    const currentRate = this.contractData.discount_rate_annual;
    const marketRate = this.estimateMarketRate();

    if (Math.abs(currentRate - marketRate) > 2) {
      indicators.push({
        indicator_type: 'external',
        description: 'Mudanças significativas nas taxas de juros de mercado',
        severity: 'medium',
        impact_on_value: 'moderate',
        evidence: [`Taxa contratual: ${currentRate}%`, `Taxa de mercado: ${marketRate}%`],
        assessment_date: new Date().toISOString().split('T')[0],
      });
    }

    // Economic conditions
    indicators.push({
      indicator_type: 'external',
      description: 'Condições econômicas adversas no setor',
      severity: 'medium',
      impact_on_value: 'moderate',
      evidence: ['Análise de mercado setorial', 'Indicadores econômicos'],
      assessment_date: new Date().toISOString().split('T')[0],
    });

    return indicators;
  }

  private identifyInternalIndicators(): ImpairmentIndicator[] {
    const indicators: ImpairmentIndicator[] = [];

    // Asset obsolescence
    const assetAge = this.calculateAssetAge();
    const usefulLife = this.contractData.lease_term_months;

    if (assetAge > usefulLife * 0.7) {
      indicators.push({
        indicator_type: 'internal',
        description: 'Ativo próximo ao fim de sua vida útil',
        severity: 'medium',
        impact_on_value: 'moderate',
        evidence: [`Idade do ativo: ${assetAge} meses`, `Vida útil: ${usefulLife} meses`],
        assessment_date: new Date().toISOString().split('T')[0],
      });
    }

    // Usage patterns
    indicators.push({
      indicator_type: 'internal',
      description: 'Mudanças significativas no padrão de uso do ativo',
      severity: 'medium',
      impact_on_value: 'moderate',
      evidence: ['Análise de utilização', 'Relatórios operacionais'],
      assessment_date: new Date().toISOString().split('T')[0],
    });

    // Physical damage
    indicators.push({
      indicator_type: 'internal',
      description: 'Evidência de danos físicos ou deterioração',
      severity: 'high',
      impact_on_value: 'significant',
      evidence: ['Inspeção física', 'Relatórios de manutenção'],
      assessment_date: new Date().toISOString().split('T')[0],
    });

    return indicators;
  }

  private identifyAssetSpecificIndicators(): ImpairmentIndicator[] {
    const indicators: ImpairmentIndicator[] = [];

    // Technology obsolescence
    if (this.contractData.asset?.asset_type === 'technology') {
      indicators.push({
        indicator_type: 'asset_specific',
        description: 'Risco de obsolescência tecnológica',
        severity: 'high',
        impact_on_value: 'significant',
        evidence: ['Análise de tecnologia', 'Tendências do mercado'],
        assessment_date: new Date().toISOString().split('T')[0],
      });
    }

    // Regulatory changes
    indicators.push({
      indicator_type: 'asset_specific',
      description: 'Mudanças regulatórias que afetam o uso do ativo',
      severity: 'medium',
      impact_on_value: 'moderate',
      evidence: ['Análise regulatória', 'Impacto no negócio'],
      assessment_date: new Date().toISOString().split('T')[0],
    });

    return indicators;
  }

  private calculateValueInUse(): number {
    // Simplified value in use calculation
    // In practice, this would involve detailed cash flow projections
    const monthlyPayment = this.contractData.monthly_payment;
    const remainingTerm = this.calculateRemainingTerm();
    const discountRate = this.contractData.discount_rate_annual / 100 / 12; // Monthly rate

    let valueInUse = 0;
    for (let i = 1; i <= remainingTerm; i++) {
      valueInUse += monthlyPayment / Math.pow(1 + discountRate, i);
    }

    // Add residual value
    const residualValue = this.contractData.asset_residual_value || 0;
    valueInUse += residualValue / Math.pow(1 + discountRate, remainingTerm);

    return valueInUse;
  }

  private calculateFairValueLessCostsToSell(): number {
    const fairValue = this.contractData.asset_fair_value || 0;
    const costsToSell = fairValue * 0.05; // Assume 5% costs to sell

    return Math.max(0, fairValue - costsToSell);
  }

  private calculateGrowthRate(): number {
    // Simplified growth rate calculation
    // In practice, this would be based on market analysis
    return 0.02; // 2% annual growth rate
  }

  private calculateAssetAge(): number {
    const startDate = new Date(this.contractData.lease_start_date);
    const currentDate = new Date();

    const monthsDiff =
      (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth());

    return Math.max(0, monthsDiff);
  }

  private calculateRemainingTerm(): number {
    const endDate = new Date(this.contractData.lease_end_date);
    const currentDate = new Date();

    if (currentDate >= endDate) {
      return 0;
    }

    const monthsDiff =
      (endDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (endDate.getMonth() - currentDate.getMonth());

    return Math.max(0, monthsDiff);
  }

  private estimateMarketRate(): number {
    // Simplified market rate estimation
    // In practice, this would be based on market data
    return this.contractData.discount_rate_annual + 1; // Assume 1% higher than contract rate
  }

  private calculateNextTestDate(indicators: ImpairmentIndicator[]): string {
    const currentDate = new Date();

    // If significant indicators present, test more frequently
    const hasSignificantIndicators = indicators.some(ind => ind.severity === 'high');

    if (hasSignificantIndicators) {
      // Test in 6 months
      currentDate.setMonth(currentDate.getMonth() + 6);
    } else {
      // Annual test
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    return currentDate.toISOString().split('T')[0] ?? '';
  }

  private determineImpairmentStatus(
    currentTest: ImpairmentTest,
    reversalHistory: ImpairmentReversal[]
  ): ImpairmentAnalysis['impairment_status'] {
    if (currentTest.impairment_loss > 0) {
      return 'impaired';
    } else if (reversalHistory.length > 0) {
      return 'reversed';
    } else {
      return 'not_impaired';
    }
  }

  private calculateTotalImpairmentLoss(
    tests: ImpairmentTest[],
    reversals: ImpairmentReversal[]
  ): number {
    const totalImpairment = tests.reduce((sum, test) => sum + test.impairment_loss, 0);
    const totalReversals = reversals.reduce((sum, reversal) => sum + reversal.reversal_amount, 0);

    return Math.max(0, totalImpairment - totalReversals);
  }

  /**
   * Test for impairment reversal
   */
  testImpairmentReversal(previousImpairmentLoss: number): ImpairmentReversal | null {
    const currentRecoverableAmount = this.calculateRecoverableAmount();
    const carryingAmount = this.calculationEngine.calculateAll().right_of_use_asset_current;

    // Impairment can only be reversed up to the original carrying amount
    const maxReversal = Math.min(
      previousImpairmentLoss,
      carryingAmount - currentRecoverableAmount.recoverable_amount
    );

    if (maxReversal > 0) {
      return {
        reversal_date: new Date().toISOString().split('T')[0] ?? '',
        previous_impairment_loss: previousImpairmentLoss,
        new_recoverable_amount: currentRecoverableAmount.recoverable_amount,
        reversal_amount: maxReversal,
        reversal_reason: 'Recuperação do valor do ativo devido a mudanças nas condições',
        evidence: ['Análise de mercado atualizada', 'Melhoria nas condições econômicas'],
      };
    }

    return null;
  }
}
