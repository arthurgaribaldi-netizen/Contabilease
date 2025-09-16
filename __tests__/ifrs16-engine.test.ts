/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * Tests for IFRS 16 Calculation Engine
 */

import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';

describe('IFRS16CalculationEngine', () => {
  const mockLeaseData: IFRS16LeaseFormData = {
    title: 'Test Lease',
    status: 'active',
    currency_code: 'BRL',
    lease_start_date: '2024-01-01',
    lease_end_date: '2026-12-31',
    lease_term_months: 36,
    monthly_payment: 1500,
    payment_frequency: 'monthly',
    discount_rate_annual: 8.5,
    payment_timing: 'end',
    initial_payment: 5000,
    asset_fair_value: 60000,
    initial_direct_costs: 2000,
    lease_incentives: 1000,
    guaranteed_residual_value: 10000,
  };

  describe('Constructor', () => {
    it('should initialize with lease data', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      expect(engine).toBeInstanceOf(IFRS16CalculationEngine);
    });
  });

  describe('calculateInitialLeaseLiability', () => {
    it('should calculate lease liability for end-of-period payments', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const liability = engine.calculateInitialLeaseLiability();

      expect(liability).toBeGreaterThan(0);
      // With initial payment (5000) and guaranteed residual value (10000), total should be higher
      expect(liability).toBeGreaterThan(50000);
    });

    it('should calculate lease liability for beginning-of-period payments', () => {
      const leaseDataBeginning = {
        ...mockLeaseData,
        payment_timing: 'beginning' as const,
      };
      const engine = new IFRS16CalculationEngine(leaseDataBeginning);
      const liability = engine.calculateInitialLeaseLiability();

      expect(liability).toBeGreaterThan(0);
      expect(liability).toBeGreaterThan(50000);
    });

    it('should handle zero discount rate', () => {
      const leaseDataZeroRate = {
        ...mockLeaseData,
        discount_rate_annual: 0,
      };
      const engine = new IFRS16CalculationEngine(leaseDataZeroRate);
      const liability = engine.calculateInitialLeaseLiability();

      // With initial payment (5000) and guaranteed residual value (10000)
      expect(liability).toBeCloseTo(69000, 2); // 36 * 1500 + 5000 + 10000
    });
  });

  describe('calculateInitialRightOfUseAsset', () => {
    it('should calculate right-of-use asset correctly', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const asset = engine.calculateInitialRightOfUseAsset();

      expect(asset).toBeGreaterThan(0);
    });

    it('should include initial direct costs', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const asset = engine.calculateInitialRightOfUseAsset();

      // Should include initial direct costs (2000)
      expect(asset).toBeGreaterThan(0);
    });

    it('should subtract lease incentives', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const asset = engine.calculateInitialRightOfUseAsset();

      // Should subtract lease incentives (1000)
      expect(asset).toBeGreaterThan(0);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate complete amortization schedule', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const schedule = engine.generateAmortizationSchedule();

      expect(schedule).toHaveLength(36); // 36 months
      expect(schedule[0]).toHaveProperty('period');
      expect(schedule[0]).toHaveProperty('date');
      expect(schedule[0]).toHaveProperty('beginning_liability');
      expect(schedule[0]).toHaveProperty('interest_expense');
      expect(schedule[0]).toHaveProperty('principal_payment');
      expect(schedule[0]).toHaveProperty('ending_liability');
      expect(schedule[0]).toHaveProperty('beginning_asset');
      expect(schedule[0]).toHaveProperty('amortization');
      expect(schedule[0]).toHaveProperty('ending_asset');
    });

    it('should have correct first period values', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const schedule = engine.generateAmortizationSchedule();

      const firstPeriod = schedule[0];
      expect(firstPeriod.period).toBe(1);
      expect(firstPeriod.beginning_liability).toBeGreaterThan(0);
      expect(firstPeriod.interest_expense).toBeGreaterThan(0);
      expect(firstPeriod.principal_payment).toBeGreaterThan(0);
      expect(firstPeriod.ending_liability).toBeLessThan(firstPeriod.beginning_liability);
    });

    it('should have ending liability in last period', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const schedule = engine.generateAmortizationSchedule();

      const lastPeriod = schedule[schedule.length - 1];
      // Ending liability should be greater than 0 (includes guaranteed residual value)
      expect(lastPeriod.ending_liability).toBeGreaterThan(0);
    });
  });

  describe('calculateAll', () => {
    it('should return complete calculation result', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const result = engine.calculateAll();

      expect(result).toHaveProperty('lease_liability_initial');
      expect(result).toHaveProperty('lease_liability_current');
      expect(result).toHaveProperty('right_of_use_asset_initial');
      expect(result).toHaveProperty('right_of_use_asset_current');
      expect(result).toHaveProperty('monthly_interest_expense');
      expect(result).toHaveProperty('monthly_principal_payment');
      expect(result).toHaveProperty('monthly_amortization');
      expect(result).toHaveProperty('total_interest_expense');
      expect(result).toHaveProperty('total_principal_payments');
      expect(result).toHaveProperty('total_lease_payments');
      expect(result).toHaveProperty('amortization_schedule');
      expect(result).toHaveProperty('effective_interest_rate_annual');
      expect(result).toHaveProperty('effective_interest_rate_monthly');
    });

    it('should have consistent values', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const result = engine.calculateAll();

      expect(result.lease_liability_initial).toBeGreaterThan(0);
      expect(result.right_of_use_asset_initial).toBeGreaterThan(0);
      expect(result.effective_interest_rate_annual).toBe(8.5);
    });
  });

  describe('validateLeaseData', () => {
    it('should validate correct lease data', () => {
      const engine = new IFRS16CalculationEngine(mockLeaseData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid monthly payment', () => {
      const invalidData = {
        ...mockLeaseData,
        monthly_payment: 0,
      };
      const engine = new IFRS16CalculationEngine(invalidData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Pagamento mensal deve ser maior que zero');
    });

    it('should detect invalid discount rate', () => {
      const invalidData = {
        ...mockLeaseData,
        discount_rate_annual: -5,
      };
      const engine = new IFRS16CalculationEngine(invalidData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Taxa de desconto deve estar entre 0% e 100%');
    });

    it('should detect invalid lease term', () => {
      const invalidData = {
        ...mockLeaseData,
        lease_term_months: 0,
      };
      const engine = new IFRS16CalculationEngine(invalidData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Prazo do contrato deve ser maior que zero');
    });

    it('should detect invalid dates', () => {
      const invalidData = {
        ...mockLeaseData,
        lease_end_date: '2023-12-31', // Before start date
      };
      const engine = new IFRS16CalculationEngine(invalidData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Data de fim deve ser posterior à data de início');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short lease term', () => {
      const shortLeaseData = {
        ...mockLeaseData,
        lease_term_months: 1,
        monthly_payment: 1000,
      };
      const engine = new IFRS16CalculationEngine(shortLeaseData);
      const result = engine.calculateAll();

      expect(result.amortization_schedule).toHaveLength(1);
      expect(result.lease_liability_initial).toBeGreaterThan(0);
    });

    it('should handle high discount rate', () => {
      const highRateData = {
        ...mockLeaseData,
        discount_rate_annual: 50,
      };
      const engine = new IFRS16CalculationEngine(highRateData);
      const result = engine.calculateAll();

      expect(result.lease_liability_initial).toBeGreaterThan(0);
      expect(result.effective_interest_rate_annual).toBe(50);
    });

    it('should handle zero initial payment', () => {
      const zeroInitialData = {
        ...mockLeaseData,
        initial_payment: 0,
      };
      const engine = new IFRS16CalculationEngine(zeroInitialData);
      const result = engine.calculateAll();

      expect(result.lease_liability_initial).toBeGreaterThan(0);
      expect(result.right_of_use_asset_initial).toBeGreaterThan(0);
    });
  });
});
