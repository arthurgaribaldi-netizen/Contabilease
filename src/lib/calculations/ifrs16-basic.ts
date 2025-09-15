/**
 * Basic IFRS 16 Calculation Engine
 *
 * This module provides core IFRS 16 lease accounting calculations including:
 * - Lease liability calculation
 * - Right-of-use asset calculation
 * - Interest expense and principal payment calculations
 * - Amortization schedule generation
 */

import { Contract } from '@/lib/contracts';

export interface IFRS16CalculationResult {
  lease_liability_initial: number;
  right_of_use_asset_initial: number;
  lease_liability_current: number;
  right_of_use_asset_current: number;
  monthly_interest_expense: number;
  monthly_principal_payment: number;
  monthly_amortization: number;
  total_interest_expense: number;
  total_principal_payments: number;
  total_lease_payments: number;
  effective_interest_rate_annual: number;
  effective_interest_rate_monthly: number;
  amortization_schedule: AmortizationPeriod[];
}

export interface AmortizationPeriod {
  period: number;
  date: string;
  beginning_liability: number;
  interest_expense: number;
  principal_payment: number;
  ending_liability: number;
  beginning_asset: number;
  amortization: number;
  ending_asset: number;
}

export class BasicIFRS16Calculator {
  private contract: Contract;
  private monthlyRate: number;

  constructor(contract: Contract) {
    this.contract = contract;
    // Convert annual interest rate to monthly rate
    this.monthlyRate = (contract.implicit_interest_rate || 0) / 100 / 12;
  }

  /**
   * Calculate the initial lease liability using present value of lease payments
   */
  calculateInitialLeaseLiability(): number {
    const _contractValue = this.contract.contract_value || 0;
    const termMonths = this.contract.contract_term_months || 0;
    const monthlyPayment = this.calculateMonthlyPayment();

    if (this.monthlyRate === 0) {
      // If no interest rate, liability is simply total payments
      return monthlyPayment * termMonths;
    }

    // Present value of annuity formula: PV = PMT * [1 - (1 + r)^(-n)] / r
    const presentValueOfPayments =
      (monthlyPayment * (1 - Math.pow(1 + this.monthlyRate, -termMonths))) / this.monthlyRate;

    // Add guaranteed residual value (present value)
    const guaranteedResidual = this.contract.guaranteed_residual_value || 0;
    const presentValueOfResidual = guaranteedResidual / Math.pow(1 + this.monthlyRate, termMonths);

    return presentValueOfPayments + presentValueOfResidual;
  }

  /**
   * Calculate the initial right-of-use asset
   */
  calculateInitialRightOfUseAsset(): number {
    const leaseLiability = this.calculateInitialLeaseLiability();

    // Right-of-use asset = Lease liability + Initial direct costs - Lease incentives
    // For simplicity, we'll assume no initial direct costs or lease incentives for now
    return leaseLiability;
  }

  /**
   * Calculate monthly payment amount
   */
  private calculateMonthlyPayment(): number {
    const _contractValue = this.contract.contract_value || 0;
    const termMonths = this.contract.contract_term_months || 0;

    if (termMonths === 0) return 0;

    // Simple calculation: divide contract value by term
    // In a real implementation, this would be more complex based on payment frequency
    return _contractValue / termMonths;
  }

  /**
   * Generate complete amortization schedule
   */
  generateAmortizationSchedule(): AmortizationPeriod[] {
    const schedule: AmortizationPeriod[] = [];
    const termMonths = this.contract.contract_term_months || 0;
    const monthlyPayment = this.calculateMonthlyPayment();

    let currentLiability = this.calculateInitialLeaseLiability();
    let currentAsset = this.calculateInitialRightOfUseAsset();

    const monthlyAmortization = currentAsset / termMonths;

    for (let period = 1; period <= termMonths; period++) {
      const interestExpense = currentLiability * this.monthlyRate;
      const principalPayment = monthlyPayment - interestExpense;

      // Handle final period adjustments
      const actualPrincipalPayment =
        period === termMonths ? currentLiability : Math.min(principalPayment, currentLiability);

      const endingLiability = currentLiability - actualPrincipalPayment;
      const endingAsset = currentAsset - monthlyAmortization;

      schedule.push({
        period,
        date: this.calculatePeriodDate(period),
        beginning_liability: currentLiability,
        interest_expense: interestExpense,
        principal_payment: actualPrincipalPayment,
        ending_liability: endingLiability,
        beginning_asset: currentAsset,
        amortization: monthlyAmortization,
        ending_asset: endingAsset,
      });

      currentLiability = endingLiability;
      currentAsset = endingAsset;
    }

    return schedule;
  }

  /**
   * Calculate period date based on lease start date
   */
  private calculatePeriodDate(period: number): string {
    const startDate = this.contract.lease_start_date
      ? new Date(this.contract.lease_start_date)
      : new Date();
    const periodDate = new Date(startDate);
    periodDate.setMonth(periodDate.getMonth() + period - 1);
    return periodDate.toISOString().split('T')[0] ?? '';
  }

  /**
   * Perform all IFRS 16 calculations
   */
  calculateAll(): IFRS16CalculationResult {
    const leaseLiabilityInitial = this.calculateInitialLeaseLiability();
    const rightOfUseAssetInitial = this.calculateInitialRightOfUseAsset();
    const amortizationSchedule = this.generateAmortizationSchedule();

    // Calculate totals
    const totalInterestExpense = amortizationSchedule.reduce(
      (sum, period) => sum + period.interest_expense,
      0
    );
    const totalPrincipalPayments = amortizationSchedule.reduce(
      (sum, period) => sum + period.principal_payment,
      0
    );
    const totalLeasePayments = totalInterestExpense + totalPrincipalPayments;

    // Current values (assuming we're at the beginning)
    const leaseLiabilityCurrent = leaseLiabilityInitial;
    const rightOfUseAssetCurrent = rightOfUseAssetInitial;
    const monthlyInterestExpense = amortizationSchedule[0]?.interest_expense || 0;
    const monthlyPrincipalPayment = amortizationSchedule[0]?.principal_payment || 0;
    const monthlyAmortization = amortizationSchedule[0]?.amortization || 0;

    return {
      lease_liability_initial: leaseLiabilityInitial,
      right_of_use_asset_initial: rightOfUseAssetInitial,
      lease_liability_current: leaseLiabilityCurrent,
      right_of_use_asset_current: rightOfUseAssetCurrent,
      monthly_interest_expense: monthlyInterestExpense,
      monthly_principal_payment: monthlyPrincipalPayment,
      monthly_amortization: monthlyAmortization,
      total_interest_expense: totalInterestExpense,
      total_principal_payments: totalPrincipalPayments,
      total_lease_payments: totalLeasePayments,
      effective_interest_rate_annual: this.contract.implicit_interest_rate || 0,
      effective_interest_rate_monthly: this.monthlyRate * 100,
      amortization_schedule: amortizationSchedule,
    };
  }

  /**
   * Validate contract data for IFRS 16 calculations
   */
  validateContractData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.contract.contract_value || this.contract.contract_value <= 0) {
      errors.push('Contract value must be greater than 0');
    }

    if (!this.contract.contract_term_months || this.contract.contract_term_months <= 0) {
      errors.push('Contract term must be greater than 0 months');
    }

    if (
      this.contract.implicit_interest_rate === undefined ||
      this.contract.implicit_interest_rate === null ||
      this.contract.implicit_interest_rate < 0
    ) {
      errors.push('Implicit interest rate must be provided and non-negative');
    }

    if (
      this.contract.guaranteed_residual_value !== undefined &&
      this.contract.guaranteed_residual_value !== null &&
      this.contract.guaranteed_residual_value < 0
    ) {
      errors.push('Guaranteed residual value must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
