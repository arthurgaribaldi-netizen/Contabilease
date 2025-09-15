/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary IFRS 16 calculation algorithms.
 * Unauthorized copying, distribution, or modification is prohibited.
 * 
 * PROPRIETARY ALGORITHMS:
 * - IFRS 16 Lease Liability calculations
 * - Right-of-use Asset computations
 * - Amortization schedule generation
 * - Financial validation algorithms
 */

import { IFRS16CalculationResult, IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';

/**
 * IFRS 16 Lease Calculation Engine
 *
 * This engine implements the core calculations required by IFRS 16 for lease accounting:
 * - Lease Liability calculation
 * - Right-of-use Asset calculation
 * - Monthly amortization and interest expense
 * - Amortization schedule generation
 */
export class IFRS16CalculationEngine {
  private leaseData: IFRS16LeaseFormData;

  constructor(leaseData: IFRS16LeaseFormData) {
    this.leaseData = leaseData;
  }

  /**
   * Calculate the monthly discount rate from annual rate
   */
  private calculateMonthlyDiscountRate(): number {
    const annualRate = this.leaseData.discount_rate_annual / 100;
    return Math.pow(1 + annualRate, 1 / 12) - 1;
  }

  /**
   * Calculate the initial lease liability using present value of lease payments
   */
  calculateInitialLeaseLiability(): number {
    const monthlyRate = this.calculateMonthlyDiscountRate();
    const leaseTermMonths = this.leaseData.lease_term_months;
    const monthlyPayment = this.leaseData.monthly_payment;
    const paymentTiming = this.leaseData.payment_timing;

    // Calculate present value of lease payments
    let presentValue: number;

    // Handle zero interest rate case
    if (monthlyRate === 0) {
      presentValue = monthlyPayment * leaseTermMonths;
    } else if (paymentTiming === 'beginning') {
      // Payments at beginning of period (annuity due)
      presentValue =
        monthlyPayment *
        ((1 - Math.pow(1 + monthlyRate, -leaseTermMonths)) / monthlyRate) *
        (1 + monthlyRate);
    } else {
      // Payments at end of period (ordinary annuity)
      presentValue =
        monthlyPayment * ((1 - Math.pow(1 + monthlyRate, -leaseTermMonths)) / monthlyRate);
    }

    // Add initial payment if present
    if (this.leaseData.initial_payment) {
      presentValue += this.leaseData.initial_payment;
    }

    // Add guaranteed residual value if present
    if (this.leaseData.guaranteed_residual_value) {
      const residualValuePV =
        this.leaseData.guaranteed_residual_value * Math.pow(1 + monthlyRate, -leaseTermMonths);
      presentValue += residualValuePV;
    }

    // Add variable payments if present
    if (this.leaseData.variable_payments) {
      const variablePaymentsPV = this.leaseData.variable_payments.reduce((total, payment) => {
        const paymentDate = new Date(payment.date);
        const leaseStartDate = new Date(this.leaseData.lease_start_date);
        const monthsFromStart = this.getMonthsDifference(leaseStartDate, paymentDate);

        if (monthsFromStart >= 0 && monthsFromStart < leaseTermMonths) {
          return total + payment.amount * Math.pow(1 + monthlyRate, -monthsFromStart);
        }
        return total;
      }, 0);
      presentValue += variablePaymentsPV;
    }

    return Math.round(presentValue * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate the initial right-of-use asset
   */
  calculateInitialRightOfUseAsset(): number {
    const leaseLiability = this.calculateInitialLeaseLiability();
    let rightOfUseAsset = leaseLiability;

    // Add initial direct costs
    if (this.leaseData.initial_direct_costs) {
      rightOfUseAsset += this.leaseData.initial_direct_costs;
    }

    // Subtract lease incentives
    if (this.leaseData.lease_incentives) {
      rightOfUseAsset -= this.leaseData.lease_incentives;
    }

    return Math.round(rightOfUseAsset * 100) / 100;
  }

  /**
   * Generate the complete amortization schedule
   */
  generateAmortizationSchedule(): Array<{
    period: number;
    date: string;
    beginning_liability: number;
    interest_expense: number;
    principal_payment: number;
    ending_liability: number;
    beginning_asset: number;
    amortization: number;
    ending_asset: number;
  }> {
    const schedule: Array<{
      period: number;
      date: string;
      beginning_liability: number;
      interest_expense: number;
      principal_payment: number;
      ending_liability: number;
      beginning_asset: number;
      amortization: number;
      ending_asset: number;
    }> = [];

    const monthlyRate = this.calculateMonthlyDiscountRate();
    const leaseTermMonths = this.leaseData.lease_term_months;
    const monthlyPayment = this.leaseData.monthly_payment;
    const paymentTiming = this.leaseData.payment_timing;

    let currentLiability = this.calculateInitialLeaseLiability();
    let currentAsset = this.calculateInitialRightOfUseAsset();
    const monthlyAmortization = currentAsset / leaseTermMonths;

    const leaseStartDate = new Date(this.leaseData.lease_start_date);

    for (let period = 1; period <= leaseTermMonths; period++) {
      const periodDate = new Date(leaseStartDate);
      periodDate.setMonth(periodDate.getMonth() + period - 1);

      // Calculate interest expense
      const interestExpense = currentLiability * monthlyRate;

      // Calculate principal payment
      let principalPayment = monthlyPayment - interestExpense;

      // Handle payment timing
      if (paymentTiming === 'beginning' && period === 1) {
        // First payment at beginning reduces liability immediately
        currentLiability -= monthlyPayment;
        principalPayment = monthlyPayment - interestExpense;
      } else {
        // Regular payment reduces liability after interest calculation
        currentLiability -= principalPayment;
      }

      // Ensure liability doesn't go negative
      if (currentLiability < 0) {
        principalPayment += currentLiability;
        currentLiability = 0;
      }

      // Calculate asset amortization
      const assetAmortization = Math.min(monthlyAmortization, currentAsset);
      currentAsset -= assetAmortization;

      schedule.push({
        period,
        date: periodDate.toISOString().split('T')[0] ?? '',
        beginning_liability: currentLiability + principalPayment, // Liability before payment
        interest_expense: Math.round(interestExpense * 100) / 100,
        principal_payment: Math.round(principalPayment * 100) / 100,
        ending_liability: Math.round(currentLiability * 100) / 100,
        beginning_asset: currentAsset + assetAmortization, // Asset before amortization
        amortization: Math.round(assetAmortization * 100) / 100,
        ending_asset: Math.round(currentAsset * 100) / 100,
      });
    }

    return schedule;
  }

  /**
   * Calculate total interest expense over lease term
   */
  calculateTotalInterestExpense(): number {
    const schedule = this.generateAmortizationSchedule();
    return schedule.reduce((total, period) => total + period.interest_expense, 0);
  }

  /**
   * Calculate total principal payments over lease term
   */
  calculateTotalPrincipalPayments(): number {
    const schedule = this.generateAmortizationSchedule();
    return schedule.reduce((total, period) => total + period.principal_payment, 0);
  }

  /**
   * Calculate total lease payments over lease term
   */
  calculateTotalLeasePayments(): number {
    const monthlyPayments = this.leaseData.monthly_payment * this.leaseData.lease_term_months;
    const initialPayment = this.leaseData.initial_payment || 0;
    const variablePayments =
      this.leaseData.variable_payments?.reduce((total, payment) => total + payment.amount, 0) || 0;
    const guaranteedResidual = this.leaseData.guaranteed_residual_value || 0;

    return monthlyPayments + initialPayment + variablePayments + guaranteedResidual;
  }

  /**
   * Calculate effective interest rate (monthly)
   */
  calculateEffectiveInterestRate(): number {
    const monthlyRate = this.calculateMonthlyDiscountRate();
    return Math.round(monthlyRate * 10000) / 100; // Convert to percentage with 4 decimal places
  }

  /**
   * Calculate effective interest rate (annual)
   */
  calculateEffectiveInterestRateAnnual(): number {
    const monthlyRate = this.calculateMonthlyDiscountRate();
    const annualRate = Math.pow(1 + monthlyRate, 12) - 1;
    return Math.round(annualRate * 10000) / 100; // Convert to percentage with 4 decimal places
  }

  /**
   * Get current lease liability (for a specific period)
   */
  getCurrentLeaseLiability(period: number): number {
    const schedule = this.generateAmortizationSchedule();
    const periodData = schedule.find(p => p.period === period);
    return periodData ? periodData.ending_liability : 0;
  }

  /**
   * Get current right-of-use asset (for a specific period)
   */
  getCurrentRightOfUseAsset(period: number): number {
    const schedule = this.generateAmortizationSchedule();
    const periodData = schedule.find(p => p.period === period);
    return periodData ? periodData.ending_asset : 0;
  }

  /**
   * Get monthly interest expense (for a specific period)
   */
  getMonthlyInterestExpense(period: number): number {
    const schedule = this.generateAmortizationSchedule();
    const periodData = schedule.find(p => p.period === period);
    return periodData ? periodData.interest_expense : 0;
  }

  /**
   * Get monthly amortization (for a specific period)
   */
  getMonthlyAmortization(period: number): number {
    const schedule = this.generateAmortizationSchedule();
    const periodData = schedule.find(p => p.period === period);
    return periodData ? periodData.amortization : 0;
  }

  /**
   * Perform complete IFRS 16 calculation
   */
  calculateAll(): IFRS16CalculationResult {
    const schedule = this.generateAmortizationSchedule();

    return {
      lease_liability_initial: this.calculateInitialLeaseLiability(),
      lease_liability_current: this.getCurrentLeaseLiability(1), // Current period

      right_of_use_asset_initial: this.calculateInitialRightOfUseAsset(),
      right_of_use_asset_current: this.getCurrentRightOfUseAsset(1), // Current period

      monthly_interest_expense: this.getMonthlyInterestExpense(1), // Current period
      monthly_principal_payment: schedule[0]?.principal_payment || 0,
      monthly_amortization: this.getMonthlyAmortization(1), // Current period

      amortization_schedule: schedule,

      total_interest_expense: this.calculateTotalInterestExpense(),
      total_principal_payments: this.calculateTotalPrincipalPayments(),
      total_lease_payments: this.calculateTotalLeasePayments(),

      effective_interest_rate_annual: this.calculateEffectiveInterestRateAnnual(),
      effective_interest_rate_monthly: this.calculateEffectiveInterestRate(),
    };
  }

  /**
   * Helper method to calculate months difference between two dates
   */
  private getMonthsDifference(date1: Date, date2: Date): number {
    const yearDiff = date2.getFullYear() - date1.getFullYear();
    const monthDiff = date2.getMonth() - date1.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  /**
   * Validate lease data for calculation
   */
  validateLeaseData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!this.leaseData.lease_start_date) {
      errors.push('Data de início do contrato é obrigatória');
    }
    if (!this.leaseData.lease_end_date) {
      errors.push('Data de fim do contrato é obrigatória');
    }
    if (!this.leaseData.monthly_payment || this.leaseData.monthly_payment <= 0) {
      errors.push('Pagamento mensal deve ser maior que zero');
    }
    if (!this.leaseData.lease_term_months || this.leaseData.lease_term_months <= 0) {
      errors.push('Prazo do contrato deve ser maior que zero');
    }
    if (this.leaseData.discount_rate_annual < 0 || this.leaseData.discount_rate_annual > 100) {
      errors.push('Taxa de desconto deve estar entre 0% e 100%');
    }

    // Check date consistency
    if (this.leaseData.lease_start_date && this.leaseData.lease_end_date) {
      const startDate = new Date(this.leaseData.lease_start_date);
      const endDate = new Date(this.leaseData.lease_end_date);

      if (endDate <= startDate) {
        errors.push('Data de fim deve ser posterior à data de início');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
