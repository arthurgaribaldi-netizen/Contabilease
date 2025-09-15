/**
 * IFRS 16 Discount Rate Calculator
 * 
 * Calcula automaticamente a taxa de desconto conforme IFRS 16:
 * - Taxa incremental de empréstimo (incremental borrowing rate)
 * - Taxa implícita do arrendador (quando disponível)
 * - Taxas de referência de mercado
 * - Ajustes por risco específico do contrato
 */

import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';

export interface DiscountRateCalculationResult {
  calculated_rate: number;
  calculation_method: 'incremental_borrowing_rate' | 'implicit_rate' | 'market_rate' | 'risk_adjusted_rate';
  confidence_level: 'high' | 'medium' | 'low';
  calculation_details: {
    base_rate: number;
    risk_adjustments: RiskAdjustment[];
    final_rate: number;
    justification: string;
  };
  market_data: {
    reference_rate: number;
    credit_spread: number;
    asset_type_adjustment: number;
    term_adjustment: number;
  };
  validation_results: {
    is_reasonable: boolean;
    comparison_with_market: number;
    risk_assessment: string;
  };
}

export interface RiskAdjustment {
  factor: string;
  adjustment: number;
  justification: string;
}

export interface MarketRateData {
  base_rate: number;
  credit_spread: number;
  asset_type_multiplier: number;
  term_adjustment: number;
}

export class IFRS16DiscountRateCalculator {
  private contractData: IFRS16CompleteData;
  private marketData: MarketRateData;

  constructor(contractData: IFRS16CompleteData, marketData?: Partial<MarketRateData>) {
    this.contractData = contractData;
    this.marketData = {
      base_rate: marketData?.base_rate || this.getDefaultBaseRate(),
      credit_spread: marketData?.credit_spread || this.getDefaultCreditSpread(),
      asset_type_multiplier: marketData?.asset_type_multiplier || this.getAssetTypeMultiplier(),
      term_adjustment: marketData?.term_adjustment || this.getTermAdjustment(),
    };
  }

  /**
   * Calculate the appropriate discount rate for the lease
   */
  calculateDiscountRate(): DiscountRateCalculationResult {
    // Try different calculation methods in order of preference
    const methods = [
      () => this.calculateIncrementalBorrowingRate(),
      () => this.calculateImplicitRate(),
      () => this.calculateMarketBasedRate(),
    ];

    for (const method of methods) {
      try {
        const result = method();
        if (result.confidence_level === 'high' || result.confidence_level === 'medium') {
          return result;
        }
      } catch (error) {
        console.warn('Discount rate calculation method failed:', error);
      }
    }

    // Fallback to market-based rate
    return this.calculateMarketBasedRate();
  }

  /**
   * Calculate incremental borrowing rate (IFRS 16.26)
   */
  private calculateIncrementalBorrowingRate(): DiscountRateCalculationResult {
    const baseRate = this.marketData.base_rate;
    const riskAdjustments = this.calculateRiskAdjustments();
    
    const totalAdjustment = riskAdjustments.reduce((sum, adj) => sum + adj.adjustment, 0);
    const finalRate = baseRate + totalAdjustment;

    return {
      calculated_rate: finalRate,
      calculation_method: 'incremental_borrowing_rate',
      confidence_level: this.assessConfidenceLevel(finalRate),
      calculation_details: {
        base_rate: baseRate,
        risk_adjustments: riskAdjustments,
        final_rate: finalRate,
        justification: this.generateIncrementalBorrowingJustification(baseRate, riskAdjustments),
      },
      market_data: this.marketData,
      validation_results: this.validateRate(finalRate),
    };
  }

  /**
   * Calculate implicit rate (when available)
   */
  private calculateImplicitRate(): DiscountRateCalculationResult {
    // This would require the lessor's implicit rate, which is rarely available
    // For now, we'll use a simplified approach based on asset fair value
    const assetFairValue = this.contractData.asset_fair_value || 0;
    const monthlyPayment = this.contractData.monthly_payment;
    const termMonths = this.contractData.lease_term_months;

    if (assetFairValue <= 0) {
      throw new Error('Asset fair value required for implicit rate calculation');
    }

    // Simplified implicit rate calculation using present value formula
    const implicitRate = this.calculateImplicitRateFromPV(assetFairValue, monthlyPayment, termMonths);

    return {
      calculated_rate: implicitRate,
      calculation_method: 'implicit_rate',
      confidence_level: 'medium',
      calculation_details: {
        base_rate: implicitRate,
        risk_adjustments: [],
        final_rate: implicitRate,
        justification: `Taxa implícita calculada baseada no valor justo do ativo (${assetFairValue}) e pagamentos mensais (${monthlyPayment})`,
      },
      market_data: this.marketData,
      validation_results: this.validateRate(implicitRate),
    };
  }

  /**
   * Calculate market-based rate
   */
  private calculateMarketBasedRate(): DiscountRateCalculationResult {
    const baseRate = this.marketData.base_rate;
    const creditSpread = this.marketData.credit_spread;
    const assetAdjustment = this.marketData.asset_type_multiplier;
    const termAdjustment = this.marketData.term_adjustment;

    const finalRate = baseRate + creditSpread + assetAdjustment + termAdjustment;

    return {
      calculated_rate: finalRate,
      calculation_method: 'market_rate',
      confidence_level: 'medium',
      calculation_details: {
        base_rate: baseRate,
        risk_adjustments: [
          { factor: 'Credit Spread', adjustment: creditSpread, justification: 'Ajuste por risco de crédito' },
          { factor: 'Asset Type', adjustment: assetAdjustment, justification: 'Ajuste por tipo de ativo' },
          { factor: 'Term', adjustment: termAdjustment, justification: 'Ajuste por prazo do contrato' },
        ],
        final_rate: finalRate,
        justification: 'Taxa baseada em dados de mercado e ajustes por risco específico',
      },
      market_data: this.marketData,
      validation_results: this.validateRate(finalRate),
    };
  }

  /**
   * Calculate risk adjustments for incremental borrowing rate
   */
  private calculateRiskAdjustments(): RiskAdjustment[] {
    const adjustments: RiskAdjustment[] = [];

    // Credit risk adjustment
    const creditRisk = this.assessCreditRisk();
    adjustments.push({
      factor: 'Risco de Crédito',
      adjustment: creditRisk,
      justification: 'Ajuste baseado no perfil de crédito do arrendatário',
    });

    // Asset-specific risk
    const assetRisk = this.assessAssetRisk();
    adjustments.push({
      factor: 'Risco do Ativo',
      adjustment: assetRisk,
      justification: 'Ajuste baseado no tipo e características do ativo',
    });

    // Term risk
    const termRisk = this.assessTermRisk();
    adjustments.push({
      factor: 'Risco de Prazo',
      adjustment: termRisk,
      justification: 'Ajuste baseado no prazo do contrato',
    });

    // Currency risk (if applicable)
    if (this.contractData.currency_code !== 'BRL') {
      const currencyRisk = this.assessCurrencyRisk();
      adjustments.push({
        factor: 'Risco Cambial',
        adjustment: currencyRisk,
        justification: 'Ajuste por exposição a risco cambial',
      });
    }

    return adjustments;
  }

  /**
   * Assess credit risk adjustment
   */
  private assessCreditRisk(): number {
    // Simplified credit risk assessment
    // In a real implementation, this would use credit rating data
    const termMonths = this.contractData.lease_term_months;
    
    if (termMonths <= 12) return 0.5; // Low risk for short term
    if (termMonths <= 36) return 1.0; // Medium risk for medium term
    return 1.5; // Higher risk for long term
  }

  /**
   * Assess asset-specific risk
   */
  private assessAssetRisk(): number {
    const assetType = this.contractData.asset.asset_type;
    
    const riskMap: Record<string, number> = {
      'real_estate': 0.2,    // Low risk - stable value
      'equipment': 0.5,       // Medium risk
      'vehicle': 0.8,         // Higher risk - depreciation
      'machinery': 0.6,       // Medium-high risk
      'technology': 1.2,     // High risk - rapid obsolescence
      'other': 0.7,          // Default medium-high risk
    };

    return riskMap[assetType] || 0.7;
  }

  /**
   * Assess term risk
   */
  private assessTermRisk(): number {
    const termMonths = this.contractData.lease_term_months;
    
    if (termMonths <= 12) return 0.0;
    if (termMonths <= 24) return 0.2;
    if (termMonths <= 36) return 0.4;
    if (termMonths <= 60) return 0.6;
    return 0.8; // Long term risk
  }

  /**
   * Assess currency risk
   */
  private assessCurrencyRisk(): number {
    // Simplified currency risk assessment
    return 0.5; // Default currency risk adjustment
  }

  /**
   * Calculate implicit rate from present value
   */
  private calculateImplicitRateFromPV(fairValue: number, monthlyPayment: number, termMonths: number): number {
    // Use Newton-Raphson method to solve for the rate
    let rate = 0.01; // Start with 1% monthly rate
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const pv = this.calculatePresentValue(monthlyPayment, rate, termMonths);
      const derivative = this.calculatePresentValueDerivative(monthlyPayment, rate, termMonths);
      
      const newRate = rate - (pv - fairValue) / derivative;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 12 * 100; // Convert to annual percentage
      }
      
      rate = newRate;
    }

    return rate * 12 * 100; // Fallback
  }

  /**
   * Calculate present value of annuity
   */
  private calculatePresentValue(payment: number, monthlyRate: number, periods: number): number {
    if (monthlyRate === 0) return payment * periods;
    return payment * (1 - Math.pow(1 + monthlyRate, -periods)) / monthlyRate;
  }

  /**
   * Calculate derivative of present value
   */
  private calculatePresentValueDerivative(payment: number, monthlyRate: number, periods: number): number {
    if (monthlyRate === 0) return 0;
    const pv = this.calculatePresentValue(payment, monthlyRate, periods);
    return (payment * periods * Math.pow(1 + monthlyRate, -periods - 1) - pv) / monthlyRate;
  }

  /**
   * Assess confidence level of calculated rate
   */
  private assessConfidenceLevel(rate: number): 'high' | 'medium' | 'low' {
    if (rate >= 0 && rate <= 25) return 'high';
    if (rate > 25 && rate <= 50) return 'medium';
    return 'low';
  }

  /**
   * Validate calculated rate
   */
  private validateRate(rate: number) {
    const isReasonable = rate >= 0 && rate <= 100;
    const comparisonWithMarket = Math.abs(rate - this.marketData.base_rate);
    const riskAssessment = rate > this.marketData.base_rate + 5 ? 'Alto risco' : 'Risco moderado';

    return {
      is_reasonable: isReasonable,
      comparison_with_market: comparisonWithMarket,
      risk_assessment: riskAssessment,
    };
  }

  /**
   * Generate justification for incremental borrowing rate
   */
  private generateIncrementalBorrowingJustification(baseRate: number, adjustments: RiskAdjustment[]): string {
    const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0);
    return `Taxa incremental de empréstimo calculada como taxa base (${baseRate}%) mais ajustes por risco específico (${totalAdjustment}%). Método conforme IFRS 16.26.`;
  }

  /**
   * Get default base rate (SELIC or equivalent)
   */
  private getDefaultBaseRate(): number {
    // In a real implementation, this would fetch current market rates
    return 10.5; // Default SELIC rate
  }

  /**
   * Get default credit spread
   */
  private getDefaultCreditSpread(): number {
    return 2.0; // Default credit spread
  }

  /**
   * Get asset type multiplier
   */
  private getAssetTypeMultiplier(): number {
    return this.assessAssetRisk();
  }

  /**
   * Get term adjustment
   */
  private getTermAdjustment(): number {
    return this.assessTermRisk();
  }
}
