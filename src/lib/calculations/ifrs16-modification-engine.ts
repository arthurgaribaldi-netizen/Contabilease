/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary IFRS 16 contract modification algorithms.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import {
    ContractModificationFormData,
    ModificationCalculationResult,
} from '@/lib/schemas/contract-modification';
import { IFRS16CalculationResult, IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { IFRS16CalculationEngine } from './ifrs16-engine';

/**
 * IFRS 16 Contract Modification Engine
 *
 * This engine handles contract modifications including:
 * - Term extensions/reductions
 * - Payment amount changes
 * - Discount rate changes
 * - Asset modifications
 * - Contract terminations
 * - Renewals
 */
export class IFRS16ModificationEngine {
  private originalEngine: IFRS16CalculationEngine;
  private originalData: IFRS16LeaseFormData;
  private modifications: ContractModificationFormData[];

  constructor(
    originalData: IFRS16LeaseFormData,
    modifications: ContractModificationFormData[] = []
  ) {
    this.originalData = originalData;
    this.modifications = modifications;
    this.originalEngine = new IFRS16CalculationEngine(originalData);
  }

  /**
   * Apply all modifications to the original contract data
   */
  private applyModifications(): IFRS16LeaseFormData {
    let modifiedData = { ...this.originalData };

    // Sort modifications by effective date
    const sortedModifications = [...this.modifications].sort(
      (a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime()
    );

    for (const modification of sortedModifications) {
      if (modification.status !== 'effective') continue;

      modifiedData = this.applySingleModification(modifiedData, modification);
    }

    return modifiedData;
  }

  /**
   * Apply a single modification to contract data
   */
  private applySingleModification(
    data: IFRS16LeaseFormData,
    modification: ContractModificationFormData
  ): IFRS16LeaseFormData {
    const modifiedData = { ...data };

    switch (modification.modification_type) {
      case 'term_extension':
        if (modification.new_term_months) {
          modifiedData.lease_term_months = modification.new_term_months;
          // Extend end date
          const startDate = new Date(modifiedData.lease_start_date);
          startDate.setMonth(startDate.getMonth() + modification.new_term_months);
          modifiedData.lease_end_date = startDate.toISOString().split('T')[0];
        } else if (modification.term_change_months) {
          modifiedData.lease_term_months += modification.term_change_months;
          // Extend end date
          const startDate = new Date(modifiedData.lease_start_date);
          startDate.setMonth(startDate.getMonth() + modifiedData.lease_term_months);
          modifiedData.lease_end_date = startDate.toISOString().split('T')[0];
        }
        break;

      case 'term_reduction':
        if (modification.new_term_months) {
          modifiedData.lease_term_months = modification.new_term_months;
          // Adjust end date
          const startDate = new Date(modifiedData.lease_start_date);
          startDate.setMonth(startDate.getMonth() + modification.new_term_months);
          modifiedData.lease_end_date = startDate.toISOString().split('T')[0];
        } else if (modification.term_change_months) {
          modifiedData.lease_term_months += modification.term_change_months;
          // Adjust end date
          const startDate = new Date(modifiedData.lease_start_date);
          startDate.setMonth(startDate.getMonth() + modifiedData.lease_term_months);
          modifiedData.lease_end_date = startDate.toISOString().split('T')[0];
        }
        break;

      case 'payment_change':
        if (modification.new_monthly_payment) {
          modifiedData.monthly_payment = modification.new_monthly_payment;
        } else if (modification.payment_change_amount) {
          modifiedData.monthly_payment += modification.payment_change_amount;
        } else if (modification.payment_change_percentage) {
          modifiedData.monthly_payment *= 1 + modification.payment_change_percentage / 100;
        }
        break;

      case 'rate_change':
        if (modification.new_discount_rate_annual) {
          modifiedData.discount_rate_annual = modification.new_discount_rate_annual;
        } else if (modification.rate_change_amount) {
          modifiedData.discount_rate_annual += modification.rate_change_amount;
        } else if (modification.rate_change_percentage) {
          modifiedData.discount_rate_annual *= 1 + modification.rate_change_percentage / 100;
        }
        break;

      case 'asset_change':
        if (modification.new_asset_fair_value) {
          modifiedData.asset_fair_value = modification.new_asset_fair_value;
        } else if (modification.asset_change_amount) {
          modifiedData.asset_fair_value =
            (modifiedData.asset_fair_value || 0) + modification.asset_change_amount;
        }
        break;

      case 'renewal':
        if (modification.renewal_term_months) {
          modifiedData.lease_term_months += modification.renewal_term_months;
          // Extend end date
          const startDate = new Date(modifiedData.lease_start_date);
          startDate.setMonth(startDate.getMonth() + modifiedData.lease_term_months);
          modifiedData.lease_end_date = startDate.toISOString().split('T')[0];
        }
        if (modification.renewal_monthly_payment) {
          modifiedData.monthly_payment = modification.renewal_monthly_payment;
        }
        if (modification.renewal_discount_rate) {
          modifiedData.discount_rate_annual = modification.renewal_discount_rate;
        }
        break;

      case 'termination':
        // For termination, we'll handle this separately in calculateTerminationImpact
        break;
    }

    return modifiedData;
  }

  /**
   * Calculate the impact of a proposed modification
   */
  calculateModificationImpact(
    modification: ContractModificationFormData
  ): ModificationCalculationResult {
    // Get current state (with all previous modifications applied)
    const currentData = this.applyModifications();
    const currentEngine = new IFRS16CalculationEngine(currentData);
    const currentCalculation = currentEngine.calculateAll();

    // Calculate remaining term from effective date
    const effectiveDate = new Date(modification.effective_date);
    const leaseStartDate = new Date(currentData.lease_start_date);
    const monthsElapsed = this.getMonthsDifference(leaseStartDate, effectiveDate);
    const remainingTerm = Math.max(0, currentData.lease_term_months - monthsElapsed);

    // Apply the modification
    const modifiedData = this.applySingleModification(currentData, modification);
    const modifiedEngine = new IFRS16CalculationEngine(modifiedData);
    const modifiedCalculation = modifiedEngine.calculateAll();

    // Calculate impact
    const liabilityChange =
      modifiedCalculation.lease_liability_initial - currentCalculation.lease_liability_initial;
    const assetChange =
      modifiedCalculation.right_of_use_asset_initial -
      currentCalculation.right_of_use_asset_initial;
    const paymentChange = modifiedData.monthly_payment - currentData.monthly_payment;
    const rateChange = modifiedData.discount_rate_annual - currentData.discount_rate_annual;
    const termChange = modifiedData.lease_term_months - currentData.lease_term_months;

    // Calculate net impact (considering modification fees, additional costs, incentives)
    const modificationFee = modification.modification_fee || 0;
    const additionalCosts = modification.additional_costs || 0;
    const incentivesReceived = modification.incentives_received || 0;
    const netImpact = liabilityChange + modificationFee + additionalCosts - incentivesReceived;

    return {
      before_modification: {
        lease_liability: currentCalculation.lease_liability_initial,
        right_of_use_asset: currentCalculation.right_of_use_asset_initial,
        remaining_term_months: remainingTerm,
        monthly_payment: currentData.monthly_payment,
        discount_rate_annual: currentData.discount_rate_annual,
      },
      after_modification: {
        lease_liability: modifiedCalculation.lease_liability_initial,
        right_of_use_asset: modifiedCalculation.right_of_use_asset_initial,
        remaining_term_months: modifiedData.lease_term_months,
        monthly_payment: modifiedData.monthly_payment,
        discount_rate_annual: modifiedData.discount_rate_annual,
      },
      impact: {
        liability_change: liabilityChange,
        asset_change: assetChange,
        payment_change: paymentChange,
        rate_change: rateChange,
        term_change: termChange,
        net_impact: netImpact,
      },
      new_amortization_schedule: modifiedCalculation.amortization_schedule,
      summary: {
        modification_type: modification.modification_type,
        effective_date: modification.effective_date,
        total_impact: netImpact,
        new_total_payments: modifiedCalculation.total_lease_payments,
        new_total_interest: modifiedCalculation.total_interest_expense,
        new_effective_rate: modifiedCalculation.effective_interest_rate_annual,
      },
    };
  }

  /**
   * Calculate termination impact
   */
  calculateTerminationImpact(
    terminationDate: string,
    terminationFee: number = 0
  ): ModificationCalculationResult {
    const currentData = this.applyModifications();
    const currentEngine = new IFRS16CalculationEngine(currentData);
    const currentCalculation = currentEngine.calculateAll();

    // Calculate remaining term until termination
    const terminationDateObj = new Date(terminationDate);
    const leaseStartDate = new Date(currentData.lease_start_date);
    const monthsElapsed = this.getMonthsDifference(leaseStartDate, terminationDateObj);
    const remainingTerm = Math.max(0, currentData.lease_term_months - monthsElapsed);

    // Calculate remaining liability and asset values
    const schedule = currentCalculation.amortization_schedule;
    const terminationPeriod = Math.min(monthsElapsed, schedule.length - 1);
    const terminationPeriodData = schedule[terminationPeriod] || schedule[schedule.length - 1];

    const remainingLiability = terminationPeriodData.ending_liability;
    const remainingAsset = terminationPeriodData.ending_asset;

    // Termination impact
    const liabilityChange = -remainingLiability;
    const assetChange = -remainingAsset;
    const netImpact = liabilityChange + assetChange - terminationFee;

    return {
      before_modification: {
        lease_liability: currentCalculation.lease_liability_initial,
        right_of_use_asset: currentCalculation.right_of_use_asset_initial,
        remaining_term_months: remainingTerm,
        monthly_payment: this.originalData.monthly_payment,
        discount_rate_annual: currentCalculation.effective_interest_rate_annual,
      },
      after_modification: {
        lease_liability: 0,
        right_of_use_asset: 0,
        remaining_term_months: 0,
        monthly_payment: 0,
        discount_rate_annual: 0,
      },
      impact: {
        liability_change: liabilityChange,
        asset_change: assetChange,
        payment_change: -this.originalData.monthly_payment,
        rate_change: 0,
        term_change: -remainingTerm,
        net_impact: netImpact,
      },
      new_amortization_schedule: [],
      summary: {
        modification_type: 'termination',
        effective_date: terminationDate,
        total_impact: netImpact,
        new_total_payments: 0,
        new_total_interest: 0,
        new_effective_rate: 0,
      },
    };
  }

  /**
   * Get current contract state with all modifications applied
   */
  getCurrentContractState(): IFRS16CalculationResult {
    const modifiedData = this.applyModifications();
    const modifiedEngine = new IFRS16CalculationEngine(modifiedData);
    const calculation = modifiedEngine.calculateAll();

    // Override the monthly_payment with the actual modified value
    return {
      ...calculation,
    };
  }

  /**
   * Validate modification data
   */
  validateModification(modification: ContractModificationFormData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!modification.modification_date) {
      errors.push('Data da modificação é obrigatória');
    }
    if (!modification.effective_date) {
      errors.push('Data de vigência é obrigatória');
    }
    if (!modification.description?.trim()) {
      errors.push('Descrição da modificação é obrigatória');
    }

    // Check date consistency
    if (modification.modification_date && modification.effective_date) {
      const modDate = new Date(modification.modification_date);
      const effectiveDate = new Date(modification.effective_date);

      if (effectiveDate < modDate) {
        errors.push('Data de vigência deve ser posterior ou igual à data da modificação');
      }
    }

    // Type-specific validations
    switch (modification.modification_type) {
      case 'term_extension':
        if (!modification.new_term_months && !modification.term_change_months) {
          errors.push('Extensão de prazo requer novo prazo ou mudança no prazo');
        }
        break;

      case 'term_reduction':
        if (!modification.new_term_months && !modification.term_change_months) {
          errors.push('Redução de prazo requer novo prazo ou mudança no prazo');
        }
        break;

      case 'payment_change':
        if (
          !modification.new_monthly_payment &&
          !modification.payment_change_amount &&
          !modification.payment_change_percentage
        ) {
          errors.push('Mudança de pagamento requer novo valor, mudança absoluta ou percentual');
        }
        break;

      case 'rate_change':
        if (
          !modification.new_discount_rate_annual &&
          !modification.rate_change_amount &&
          !modification.rate_change_percentage
        ) {
          errors.push('Mudança de taxa requer nova taxa, mudança absoluta ou percentual');
        }
        break;

      case 'termination':
        if (!modification.termination_date) {
          errors.push('Rescisão requer data de término');
        }
        break;

      case 'renewal':
        if (!modification.renewal_term_months) {
          errors.push('Renovação requer novo prazo');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get modification history summary
   */
  getModificationHistory(): Array<{
    modification: ContractModificationFormData;
    impact: ModificationCalculationResult;
  }> {
    return this.modifications.map(modification => ({
      modification,
      impact: this.calculateModificationImpact(modification),
    }));
  }

  /**
   * Helper method to calculate months difference between two dates
   */
  private getMonthsDifference(date1: Date, date2: Date): number {
    const yearDiff = date2.getFullYear() - date1.getFullYear();
    const monthDiff = date2.getMonth() - date1.getMonth();
    return yearDiff * 12 + monthDiff;
  }
}
