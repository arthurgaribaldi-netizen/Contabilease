/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

/**
 * IFRS 16 Advanced Disclosures Engine
 *
 * Implements advanced disclosure requirements per IFRS 16.51-53:
 * - Maturity analysis of lease liabilities
 * - Information about exercised options
 * - Significant contractual restrictions
 * - Subleased assets
 * - Additional qualitative disclosures
 */

import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';
import { IFRS16CalculationEngine } from './ifrs16-engine';

export interface MaturityAnalysisPeriod {
  period_start: string;
  period_end: string;
  lease_liability: number;
  interest_expense: number;
  principal_payment: number;
  total_payment: number;
}

export interface MaturityAnalysis {
  periods: MaturityAnalysisPeriod[];
  total_liability: number;
  total_interest: number;
  total_principal: number;
  analysis_date: string;
}

export interface ExercisedOption {
  option_type: 'renewal' | 'purchase' | 'termination' | 'extension';
  exercise_date: string;
  original_contract_id: string;
  new_terms: {
    term_months?: number;
    monthly_payment?: number;
    discount_rate?: number;
  };
  financial_impact: {
    liability_change: number;
    asset_change: number;
    payment_change: number;
  };
  justification: string;
}

export interface ContractualRestriction {
  restriction_type: 'financial_covenant' | 'use_restriction' | 'transfer_restriction' | 'other';
  description: string;
  impact_level: 'high' | 'medium' | 'low';
  monitoring_required: boolean;
  compliance_status: 'compliant' | 'non_compliant' | 'under_review';
  last_review_date?: string;
}

export interface SubleasedAsset {
  asset_id: string;
  sublease_start_date: string;
  sublease_end_date: string;
  sublease_monthly_payment: number;
  sublessee_name: string;
  sublease_status: 'active' | 'terminated' | 'expired';
  financial_impact: {
    income_per_month: number;
    total_income: number;
  };
}

export interface AdvancedDisclosures {
  maturity_analysis: MaturityAnalysis;
  exercised_options: ExercisedOption[];
  contractual_restrictions: ContractualRestriction[];
  subleased_assets: SubleasedAsset[];
  qualitative_disclosures: {
    lease_policy: string;
    significant_judgments: string[];
    future_commitments: string;
    risk_factors: string[];
  };
  disclosure_date: string;
  reporting_period: string;
}

export class IFRS16AdvancedDisclosuresEngine {
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
   * Generate maturity analysis of lease liabilities (IFRS 16.51)
   */
  generateMaturityAnalysis(): MaturityAnalysis {
    const amortizationSchedule = this.calculationEngine.generateAmortizationSchedule();
    const currentDate = new Date();

    // Group payments by year for maturity analysis
    const yearlyPayments = new Map<number, MaturityAnalysisPeriod>();

    amortizationSchedule.forEach(period => {
      const year = new Date(period.date).getFullYear();

      if (!yearlyPayments.has(year)) {
        yearlyPayments.set(year, {
          period_start: `${year}-01-01`,
          period_end: `${year}-12-31`,
          lease_liability: 0,
          interest_expense: 0,
          principal_payment: 0,
          total_payment: 0,
        });
      }

      const yearData = yearlyPayments.get(year)!;
      yearData.lease_liability += period.ending_liability;
      yearData.interest_expense += period.interest_expense;
      yearData.principal_payment += period.principal_payment;
      yearData.total_payment += period.interest_expense + period.principal_payment;
    });

    const periods = Array.from(yearlyPayments.values()).sort((a, b) =>
      a.period_start.localeCompare(b.period_start)
    );

    return {
      periods,
      total_liability: periods.reduce((sum, p) => sum + p.lease_liability, 0),
      total_interest: periods.reduce((sum, p) => sum + p.interest_expense, 0),
      total_principal: periods.reduce((sum, p) => sum + p.principal_payment, 0),
      analysis_date: currentDate.toISOString().split('T')[0] ?? '',
    };
  }

  /**
   * Analyze exercised options (IFRS 16.52)
   */
  analyzeExercisedOptions(): ExercisedOption[] {
    const exercisedOptions: ExercisedOption[] = [];

    // Check for modifications that represent exercised options
    if (this.contractData.modifications) {
      this.contractData.modifications.forEach(modification => {
        if (this.isExercisedOption(modification)) {
          exercisedOptions.push(this.createExercisedOptionFromModification(modification));
        }
      });
    }

    // Check contract options for exercised ones
    if (this.contractData.contract_options) {
      exercisedOptions.push(...this.analyzeContractOptions());
    }

    return exercisedOptions;
  }

  /**
   * Identify significant contractual restrictions (IFRS 16.53)
   */
  identifyContractualRestrictions(): ContractualRestriction[] {
    const restrictions: ContractualRestriction[] = [];

    // Financial covenants
    if (
      this.contractData.guaranteed_residual_value &&
      this.contractData.guaranteed_residual_value > 0
    ) {
      restrictions.push({
        restriction_type: 'financial_covenant',
        description: `Valor residual garantido de ${this.contractData.guaranteed_residual_value} ${this.contractData.currency_code}`,
        impact_level: 'high',
        monitoring_required: true,
        compliance_status: 'compliant',
      });
    }

    // Use restrictions based on asset type
    if (this.contractData.asset) {
      restrictions.push({
        restriction_type: 'use_restriction',
        description: `Restrições de uso específicas para ${this.contractData.asset.asset_type}`,
        impact_level: 'medium',
        monitoring_required: true,
        compliance_status: 'compliant',
      });
    }

    // Transfer restrictions
    restrictions.push({
      restriction_type: 'transfer_restriction',
      description: 'Restrições de transferência do ativo sem consentimento do arrendador',
      impact_level: 'medium',
      monitoring_required: false,
      compliance_status: 'compliant',
    });

    return restrictions;
  }

  /**
   * Analyze subleased assets (IFRS 16.53)
   */
  analyzeSubleasedAssets(): SubleasedAsset[] {
    const subleasedAssets: SubleasedAsset[] = [];

    // This would typically come from a separate sublease tracking system
    // For now, we'll provide a framework for future implementation

    return subleasedAssets;
  }

  /**
   * Generate qualitative disclosures
   */
  generateQualitativeDisclosures(): AdvancedDisclosures['qualitative_disclosures'] {
    return {
      lease_policy: this.generateLeasePolicy(),
      significant_judgments: this.identifySignificantJudgments(),
      future_commitments: this.generateFutureCommitments(),
      risk_factors: this.identifyRiskFactors(),
    };
  }

  /**
   * Generate complete advanced disclosures
   */
  generateAdvancedDisclosures(): AdvancedDisclosures {
    return {
      maturity_analysis: this.generateMaturityAnalysis(),
      exercised_options: this.analyzeExercisedOptions(),
      contractual_restrictions: this.identifyContractualRestrictions(),
      subleased_assets: this.analyzeSubleasedAssets(),
      qualitative_disclosures: this.generateQualitativeDisclosures(),
      disclosure_date: new Date().toISOString().split('T')[0] ?? '',
      reporting_period: this.getCurrentReportingPeriod(),
    };
  }

  // Private helper methods

  private isExercisedOption(modification: any): boolean {
    return (
      modification.modification_type === 'renewal' ||
      modification.modification_type === 'term_extension' ||
      modification.modification_type === 'termination'
    );
  }

  private createExercisedOptionFromModification(modification: any): ExercisedOption {
    return {
      option_type: this.mapModificationTypeToOptionType(modification.modification_type),
      exercise_date: modification.modification_date,
      original_contract_id: this.contractData.contract_id,
      new_terms: {
        term_months: modification.new_values?.lease_term_months,
        monthly_payment: modification.new_values?.monthly_payment,
        discount_rate: modification.new_values?.discount_rate_annual,
      },
      financial_impact: modification.financial_impact || {
        liability_change: 0,
        asset_change: 0,
        payment_change: 0,
      },
      justification: modification.justification || modification.description,
    };
  }

  private mapModificationTypeToOptionType(
    modificationType: string
  ): ExercisedOption['option_type'] {
    switch (modificationType) {
      case 'renewal':
      case 'term_extension':
        return 'renewal';
      case 'termination':
        return 'termination';
      default:
        return 'extension';
    }
  }

  private analyzeContractOptions(): ExercisedOption[] {
    const exercisedOptions: ExercisedOption[] = [];

    if (!this.contractData.contract_options) {
      return exercisedOptions;
    }

    // Check renewal options
    if (this.contractData.contract_options.renewal_options) {
      this.contractData.contract_options.renewal_options.forEach(option => {
        const exerciseDate = new Date(option.renewal_date);
        const currentDate = new Date();

        if (exerciseDate <= currentDate) {
          exercisedOptions.push({
            option_type: 'renewal',
            exercise_date: option.renewal_date,
            original_contract_id: this.contractData.contract_id,
            new_terms: {
              term_months: option.new_term_months,
              monthly_payment: option.new_monthly_payment,
            },
            financial_impact: {
              liability_change: 0, // Would be calculated based on new terms
              asset_change: 0,
              payment_change: option.new_monthly_payment - (this.contractData.monthly_payment || 0),
            },
            justification: `Opção de renovação exercida conforme contrato original`,
          });
        }
      });
    }

    return exercisedOptions;
  }

  private generateLeasePolicy(): string {
    return `A entidade aplica IFRS 16 para todos os contratos de arrendamento. Os contratos são classificados como arrendamentos operacionais ou financeiros com base na transferência de riscos e benefícios substanciais. O passivo de arrendamento é mensurado pelo valor presente dos pagamentos futuros, e o ativo de direito de uso é depreciado linearmente ao longo do prazo do contrato.`;
  }

  private identifySignificantJudgments(): string[] {
    const judgments: string[] = [];

    // Discount rate judgment
    judgments.push(
      `Taxa de desconto aplicada: ${this.contractData.discount_rate_annual}% a.a. - baseada na taxa incremental de empréstimo da entidade`
    );

    // Lease classification judgment
    if (this.contractData.lease_classification) {
      judgments.push(
        `Classificação do contrato: ${this.contractData.lease_classification} - baseada na análise de transferência de riscos e benefícios`
      );
    }

    // Asset fair value judgment
    if (this.contractData.asset_fair_value) {
      judgments.push(
        `Valor justo do ativo: ${this.contractData.asset_fair_value} ${this.contractData.currency_code} - baseado em avaliação independente`
      );
    }

    return judgments;
  }

  private generateFutureCommitments(): string {
    const totalPayments = this.calculationEngine.calculateTotalLeasePayments();
    const remainingTerm = this.calculateRemainingTerm();

    return `A entidade tem compromissos futuros de arrendamento totalizando ${totalPayments.toLocaleString()} ${this.contractData.currency_code} ao longo dos próximos ${remainingTerm} meses, incluindo pagamentos fixos e variáveis conforme contratos vigentes.`;
  }

  private identifyRiskFactors(): string[] {
    const risks: string[] = [];

    // Interest rate risk
    risks.push(
      'Risco de taxa de juros: Mudanças nas taxas de mercado podem afetar o valor presente dos passivos de arrendamento'
    );

    // Currency risk
    if (this.contractData.currency_code !== 'BRL') {
      risks.push(
        'Risco cambial: Exposição a flutuações cambiais nos contratos denominados em moeda estrangeira'
      );
    }

    // Credit risk
    risks.push('Risco de crédito: Dependência da capacidade de pagamento do arrendador');

    // Asset obsolescence risk
    risks.push(
      'Risco de obsolescência: Ativos podem tornar-se obsoletos antes do término do contrato'
    );

    return risks;
  }

  private calculateRemainingTerm(): number {
    const _startDate = new Date(this.contractData.lease_start_date);
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

  private getCurrentReportingPeriod(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    return `${year}-${month.toString().padStart(2, '0')}`;
  }
}
