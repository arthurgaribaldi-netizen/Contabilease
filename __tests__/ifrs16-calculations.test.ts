import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';

describe('IFRS 16 Calculation Engine', () => {
  const baseLeaseData: IFRS16LeaseFormData = {
    title: 'Test Lease Contract',
    status: 'active',
    currency_code: 'BRL',
    lease_start_date: '2024-01-01',
    lease_end_date: '2026-12-31',
    lease_term_months: 36,
    monthly_payment: 1000,
    payment_frequency: 'monthly',
    discount_rate_annual: 8.5,
    payment_timing: 'end',
  };

  describe('Basic Lease Liability Calculation', () => {
    it('should calculate initial lease liability correctly', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const leaseLiability = engine.calculateInitialLeaseLiability();

      // Expected PV of 36 payments of 1000 at 8.5% annual
      // Monthly rate: (1 + 0.085)^(1/12) - 1 = 0.006809
      // PV = 1000 * ((1 - (1 + 0.006809)^-36) / 0.006809) = 31,824.69
      expect(leaseLiability).toBeCloseTo(31824.69, 1); // Close to calculated value
      expect(leaseLiability).toBeGreaterThan(30000);
      expect(leaseLiability).toBeLessThan(35000);
    });

    it('should calculate right-of-use asset correctly', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const rightOfUseAsset = engine.calculateInitialRightOfUseAsset();
      const leaseLiability = engine.calculateInitialLeaseLiability();

      // Should equal lease liability when no additional costs/incentives
      expect(rightOfUseAsset).toBe(leaseLiability);
    });

    it('should include initial direct costs in right-of-use asset', () => {
      const leaseDataWithCosts = {
        ...baseLeaseData,
        initial_direct_costs: 500,
      };

      const engine = new IFRS16CalculationEngine(leaseDataWithCosts);
      const rightOfUseAsset = engine.calculateInitialRightOfUseAsset();
      const leaseLiability = engine.calculateInitialLeaseLiability();

      expect(rightOfUseAsset).toBe(leaseLiability + 500);
    });

    it('should subtract lease incentives from right-of-use asset', () => {
      const leaseDataWithIncentives = {
        ...baseLeaseData,
        lease_incentives: 200,
      };

      const engine = new IFRS16CalculationEngine(leaseDataWithIncentives);
      const rightOfUseAsset = engine.calculateInitialRightOfUseAsset();
      const leaseLiability = engine.calculateInitialLeaseLiability();

      expect(rightOfUseAsset).toBe(leaseLiability - 200);
    });
  });

  describe('Payment Timing', () => {
    it('should handle beginning of period payments', () => {
      const leaseDataBeginning = {
        ...baseLeaseData,
        payment_timing: 'beginning' as const,
      };

      const engine = new IFRS16CalculationEngine(leaseDataBeginning);
      const leaseLiability = engine.calculateInitialLeaseLiability();

      // Beginning payments should result in higher PV
      const engineEnd = new IFRS16CalculationEngine(baseLeaseData);
      const leaseLiabilityEnd = engineEnd.calculateInitialLeaseLiability();

      expect(leaseLiability).toBeGreaterThan(leaseLiabilityEnd);
    });
  });

  describe('Amortization Schedule', () => {
    it('should generate correct amortization schedule', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const schedule = engine.generateAmortizationSchedule();

      expect(schedule).toHaveLength(36); // 36 months

      // Check first period
      const firstPeriod = schedule[0];
      expect(firstPeriod.period).toBe(1);
      expect(firstPeriod.interest_expense).toBeGreaterThan(0);
      expect(firstPeriod.principal_payment).toBeGreaterThan(0);
      expect(firstPeriod.amortization).toBeGreaterThan(0);

      // Check last period
      const lastPeriod = schedule[35];
      expect(lastPeriod.period).toBe(36);
      expect(lastPeriod.ending_liability).toBeCloseTo(0, 1); // Should be close to zero
      expect(lastPeriod.ending_asset).toBeCloseTo(0, 1); // Should be close to zero
    });

    it('should have consistent liability and asset balances', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const schedule = engine.generateAmortizationSchedule();

      // Check that liability decreases over time
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].ending_liability).toBeLessThanOrEqual(schedule[i - 1].ending_liability);
      }

      // Check that asset decreases over time
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].ending_asset).toBeLessThanOrEqual(schedule[i - 1].ending_asset);
      }
    });
  });

  describe('Interest and Principal Calculations', () => {
    it('should calculate total interest expense correctly', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const totalInterest = engine.calculateTotalInterestExpense();
      const totalPayments = engine.calculateTotalLeasePayments();
      const totalPrincipal = engine.calculateTotalPrincipalPayments();

      // Total payments should equal principal + interest
      expect(totalPayments).toBeCloseTo(totalPrincipal + totalInterest, 1);

      // Interest should be positive
      expect(totalInterest).toBeGreaterThan(0);
    });

    it('should calculate monthly interest expense correctly', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const monthlyInterest = engine.getMonthlyInterestExpense(1);
      const monthlyRate = engine['calculateMonthlyDiscountRate']();
      const initialLiability = engine.calculateInitialLeaseLiability();

      // First month interest should be initial liability * monthly rate
      const expectedInterest = initialLiability * monthlyRate;
      expect(monthlyInterest).toBeCloseTo(expectedInterest, 2);
    });
  });

  describe('Effective Interest Rate', () => {
    it('should calculate effective interest rate correctly', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const monthlyRate = engine.calculateEffectiveInterestRate();
      const annualRate = engine.calculateEffectiveInterestRateAnnual();

      // Monthly rate should be positive
      expect(monthlyRate).toBeGreaterThan(0);

      // Annual rate should be higher than monthly rate
      expect(annualRate).toBeGreaterThan(monthlyRate);

      // Annual rate should be close to input rate
      expect(annualRate).toBeCloseTo(8.5, 1);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle initial payment', () => {
      const leaseDataWithInitial = {
        ...baseLeaseData,
        initial_payment: 5000,
      };

      const engine = new IFRS16CalculationEngine(leaseDataWithInitial);
      const leaseLiability = engine.calculateInitialLeaseLiability();

      // Should include initial payment
      const engineWithoutInitial = new IFRS16CalculationEngine(baseLeaseData);
      const leaseLiabilityWithoutInitial = engineWithoutInitial.calculateInitialLeaseLiability();

      expect(leaseLiability).toBe(leaseLiabilityWithoutInitial + 5000);
    });

    it('should handle guaranteed residual value', () => {
      const leaseDataWithResidual = {
        ...baseLeaseData,
        guaranteed_residual_value: 10000,
      };

      const engine = new IFRS16CalculationEngine(leaseDataWithResidual);
      const leaseLiability = engine.calculateInitialLeaseLiability();

      // Should include present value of residual value
      const engineWithoutResidual = new IFRS16CalculationEngine(baseLeaseData);
      const leaseLiabilityWithoutResidual = engineWithoutResidual.calculateInitialLeaseLiability();

      expect(leaseLiability).toBeGreaterThan(leaseLiabilityWithoutResidual);
    });

    it('should handle variable payments', () => {
      const leaseDataWithVariable = {
        ...baseLeaseData,
        variable_payments: [
          { date: '2024-06-01', amount: 500 },
          { date: '2025-06-01', amount: 750 },
        ],
      };

      const engine = new IFRS16CalculationEngine(leaseDataWithVariable);
      const leaseLiability = engine.calculateInitialLeaseLiability();

      // Should include present value of variable payments
      const engineWithoutVariable = new IFRS16CalculationEngine(baseLeaseData);
      const leaseLiabilityWithoutVariable = engineWithoutVariable.calculateInitialLeaseLiability();

      expect(leaseLiability).toBeGreaterThan(leaseLiabilityWithoutVariable);
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields', () => {
      const invalidData = {
        ...baseLeaseData,
        monthly_payment: 0, // Invalid: should be > 0
      };

      const engine = new IFRS16CalculationEngine(invalidData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Pagamento mensal deve ser maior que zero');
    });

    it('should validate discount rate range', () => {
      const invalidData = {
        ...baseLeaseData,
        discount_rate_annual: 150, // Invalid: should be <= 100
      };

      const engine = new IFRS16CalculationEngine(invalidData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Taxa de desconto deve estar entre 0% e 100%');
    });

    it('should validate date consistency', () => {
      const invalidData = {
        ...baseLeaseData,
        lease_start_date: '2024-12-31',
        lease_end_date: '2024-01-01', // Invalid: end before start
      };

      const engine = new IFRS16CalculationEngine(invalidData);
      const validation = engine.validateLeaseData();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Data de fim deve ser posterior à data de início');
    });
  });

  describe('Complete Calculation', () => {
    it('should perform complete IFRS 16 calculation', () => {
      const engine = new IFRS16CalculationEngine(baseLeaseData);
      const result = engine.calculateAll();

      // Check all required fields are present
      expect(result.lease_liability_initial).toBeGreaterThan(0);
      expect(result.right_of_use_asset_initial).toBeGreaterThan(0);
      expect(result.monthly_interest_expense).toBeGreaterThan(0);
      expect(result.monthly_principal_payment).toBeGreaterThan(0);
      expect(result.monthly_amortization).toBeGreaterThan(0);
      expect(result.total_interest_expense).toBeGreaterThan(0);
      expect(result.total_principal_payments).toBeGreaterThan(0);
      expect(result.total_lease_payments).toBeGreaterThan(0);
      expect(result.effective_interest_rate_annual).toBeGreaterThan(0);
      expect(result.effective_interest_rate_monthly).toBeGreaterThan(0);

      // Check amortization schedule
      expect(result.amortization_schedule).toHaveLength(36);
      expect(result.amortization_schedule[0].period).toBe(1);
      expect(result.amortization_schedule[35].period).toBe(36);
    });
  });
});
