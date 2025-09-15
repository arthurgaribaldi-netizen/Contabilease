import { IFRS16ModificationEngine } from '@/lib/calculations/ifrs16-modification-engine';
import { ContractModificationFormData } from '@/lib/schemas/contract-modification';
import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';

describe('IFRS 16 Contract Modification Engine', () => {
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

  describe('Term Extensions', () => {
    it('should handle term extension with new term months', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'term_extension',
        description: 'Extensão de prazo por 12 meses',
        effective_date: '2024-06-01',
        new_term_months: 48, // Extend from 36 to 48 months
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.remaining_term_months).toBe(48);
      expect(impact.impact.term_change).toBe(12);
      expect(impact.summary.modification_type).toBe('term_extension');
    });

    it('should handle term extension with term change months', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'term_extension',
        description: 'Extensão de prazo por 6 meses',
        effective_date: '2024-06-01',
        term_change_months: 6, // Add 6 months
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.remaining_term_months).toBe(42); // 36 + 6
      expect(impact.impact.term_change).toBe(6);
    });

    it('should increase lease liability with term extension', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'term_extension',
        description: 'Extensão de prazo',
        effective_date: '2024-06-01',
        term_change_months: 12,
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      // Extended term should increase lease liability
      expect(impact.impact.liability_change).toBeGreaterThan(0);
    });
  });

  describe('Term Reductions', () => {
    it('should handle term reduction with new term months', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'term_reduction',
        description: 'Redução de prazo para 24 meses',
        effective_date: '2024-06-01',
        new_term_months: 24, // Reduce from 36 to 24 months
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.remaining_term_months).toBe(24);
      expect(impact.impact.term_change).toBe(-12);
    });

    it('should handle term reduction with term change months', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'term_reduction',
        description: 'Redução de prazo por 6 meses',
        effective_date: '2024-06-01',
        term_change_months: -6, // Reduce by 6 months
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.remaining_term_months).toBe(30); // 36 - 6
      expect(impact.impact.term_change).toBe(-6);
    });

    it('should decrease lease liability with term reduction', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'term_reduction',
        description: 'Redução de prazo',
        effective_date: '2024-06-01',
        term_change_months: -12,
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      // Reduced term should decrease lease liability
      expect(impact.impact.liability_change).toBeLessThan(0);
    });
  });

  describe('Payment Changes', () => {
    it('should handle payment increase with new amount', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'payment_change',
        description: 'Aumento do pagamento mensal',
        effective_date: '2024-06-01',
        new_monthly_payment: 1200, // Increase from 1000 to 1200
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.monthly_payment).toBe(1200);
      expect(impact.impact.payment_change).toBe(200);
      expect(impact.impact.liability_change).toBeGreaterThan(0);
    });

    it('should handle payment decrease with change amount', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'payment_change',
        description: 'Redução do pagamento mensal',
        effective_date: '2024-06-01',
        payment_change_amount: -200, // Decrease by 200
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.monthly_payment).toBe(800); // 1000 - 200
      expect(impact.impact.payment_change).toBe(-200);
      expect(impact.impact.liability_change).toBeLessThan(0);
    });

    it('should handle payment change with percentage', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'payment_change',
        description: 'Aumento de 10% no pagamento',
        effective_date: '2024-06-01',
        payment_change_percentage: 10, // Increase by 10%
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.monthly_payment).toBeCloseTo(1100, 1); // 1000 * 1.1
      expect(impact.impact.payment_change).toBeCloseTo(100, 1);
    });
  });

  describe('Rate Changes', () => {
    it('should handle discount rate increase', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'rate_change',
        description: 'Aumento da taxa de desconto',
        effective_date: '2024-06-01',
        new_discount_rate_annual: 10.0, // Increase from 8.5% to 10%
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.discount_rate_annual).toBeCloseTo(10.0, 1);
      expect(impact.impact.rate_change).toBeCloseTo(1.5, 1); // 10 - 8.5
      expect(impact.impact.liability_change).toBeLessThan(0); // Higher rate = lower PV
    });

    it('should handle discount rate decrease', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'rate_change',
        description: 'Redução da taxa de desconto',
        effective_date: '2024-06-01',
        new_discount_rate_annual: 7.0, // Decrease from 8.5% to 7%
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.discount_rate_annual).toBeCloseTo(7.0, 1);
      expect(impact.impact.rate_change).toBeCloseTo(-1.5, 1); // 7 - 8.5
      expect(impact.impact.liability_change).toBeGreaterThan(0); // Lower rate = higher PV
    });

    it('should handle rate change with absolute amount', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'rate_change',
        description: 'Aumento de 2% na taxa',
        effective_date: '2024-06-01',
        rate_change_amount: 2.0, // Increase by 2%
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.discount_rate_annual).toBeCloseTo(10.5, 1); // 8.5 + 2
      expect(impact.impact.rate_change).toBeCloseTo(2.0, 1);
    });
  });

  describe('Contract Terminations', () => {
    it('should handle contract termination', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'termination',
        description: 'Rescisão antecipada do contrato',
        effective_date: '2024-06-01',
        termination_date: '2024-06-01',
        termination_fee: 5000,
        termination_reason: 'Mudança de estratégia empresarial',
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateTerminationImpact('2024-06-01', 5000);

      expect(impact.after_modification.remaining_term_months).toBe(0);
      expect(impact.after_modification.lease_liability).toBe(0);
      expect(impact.after_modification.right_of_use_asset).toBe(0);
      expect(impact.summary.modification_type).toBe('termination');
    });

    it('should calculate termination impact correctly', () => {
      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateTerminationImpact('2024-06-01', 3000);

      // Termination should result in negative impact (liability and asset reduction)
      expect(impact.impact.liability_change).toBeLessThan(0);
      expect(impact.impact.asset_change).toBeLessThan(0);
      expect(impact.impact.net_impact).toBeLessThan(0); // Negative due to termination fee
    });
  });

  describe('Contract Renewals', () => {
    it('should handle contract renewal', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-12-01',
        modification_type: 'renewal',
        description: 'Renovação do contrato por mais 24 meses',
        effective_date: '2024-12-01',
        renewal_term_months: 24,
        renewal_monthly_payment: 1100,
        renewal_discount_rate: 9.0,
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.after_modification.remaining_term_months).toBe(60); // 36 + 24
      expect(impact.after_modification.monthly_payment).toBe(1100);
      expect(impact.after_modification.discount_rate_annual).toBeCloseTo(9.0, 1);
      expect(impact.impact.term_change).toBe(24);
    });
  });

  describe('Multiple Modifications', () => {
    it('should handle multiple modifications in sequence', () => {
      const modifications: ContractModificationFormData[] = [
        {
          modification_date: '2024-06-01',
          modification_type: 'payment_change',
          description: 'Primeiro aumento de pagamento',
          effective_date: '2024-06-01',
          payment_change_amount: 100,
          status: 'effective',
        },
        {
          modification_date: '2024-12-01',
          modification_type: 'term_extension',
          description: 'Extensão de prazo',
          effective_date: '2024-12-01',
          term_change_months: 6,
          status: 'effective',
        },
      ];

      const engine = new IFRS16ModificationEngine(baseLeaseData, modifications);
      const currentState = engine.getCurrentContractState();

      // Should reflect both modifications
      expect(currentState.lease_liability_current).toBeGreaterThan(0);
      expect(currentState.amortization_schedule).toHaveLength(42); // 36 + 6
    });

    it('should calculate impact considering previous modifications', () => {
      const existingModifications: ContractModificationFormData[] = [
        {
          modification_date: '2024-06-01',
          modification_type: 'payment_change',
          description: 'Aumento anterior',
          effective_date: '2024-06-01',
          payment_change_amount: 100,
          status: 'effective',
        },
      ];

      const newModification: ContractModificationFormData = {
        modification_date: '2024-12-01',
        modification_type: 'payment_change',
        description: 'Segundo aumento',
        effective_date: '2024-12-01',
        payment_change_amount: 50,
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, existingModifications);
      const impact = engine.calculateModificationImpact(newModification);

      // Should show change from 1100 to 1150 (considering previous modification)
      expect(impact.before_modification.monthly_payment).toBe(1100);
      expect(impact.after_modification.monthly_payment).toBe(1150);
      expect(impact.impact.payment_change).toBe(50);
    });
  });

  describe('Modification Validation', () => {
    it('should validate required fields', () => {
      const invalidModification: ContractModificationFormData = {
        modification_date: '',
        modification_type: 'payment_change',
        description: '',
        effective_date: '',
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const validation = engine.validateModification(invalidModification);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Data da modificação é obrigatória');
      expect(validation.errors).toContain('Data de vigência é obrigatória');
      expect(validation.errors).toContain('Descrição da modificação é obrigatória');
    });

    it('should validate date consistency', () => {
      const invalidModification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'payment_change',
        description: 'Test modification',
        effective_date: '2024-05-01', // Before modification date
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const validation = engine.validateModification(invalidModification);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Data de vigência deve ser posterior ou igual à data da modificação'
      );
    });

    it('should validate modification type specific fields', () => {
      const invalidModification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'term_extension',
        description: 'Test modification',
        effective_date: '2024-06-01',
        status: 'effective',
        // Missing required fields for term extension
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const validation = engine.validateModification(invalidModification);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Extensão de prazo requer novo prazo ou mudança no prazo'
      );
    });

    it('should validate termination requirements', () => {
      const invalidModification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'termination',
        description: 'Test termination',
        effective_date: '2024-06-01',
        status: 'effective',
        // Missing termination_date
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const validation = engine.validateModification(invalidModification);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Rescisão requer data de término');
    });
  });

  describe('Financial Impact Calculations', () => {
    it('should calculate net impact including fees and incentives', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'payment_change',
        description: 'Modificação com taxas',
        effective_date: '2024-06-01',
        payment_change_amount: 100,
        modification_fee: 1000,
        additional_costs: 500,
        incentives_received: 200,
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      // Net impact should consider all financial factors
      const expectedNetImpact = impact.impact.liability_change + 1000 + 500 - 200;
      expect(impact.impact.net_impact).toBeCloseTo(expectedNetImpact, 1);
    });

    it('should handle zero impact modifications', () => {
      const modification: ContractModificationFormData = {
        modification_date: '2024-06-01',
        modification_type: 'payment_change',
        description: 'Modificação sem impacto',
        effective_date: '2024-06-01',
        payment_change_amount: 0, // No change
        status: 'effective',
      };

      const engine = new IFRS16ModificationEngine(baseLeaseData, []);
      const impact = engine.calculateModificationImpact(modification);

      expect(impact.impact.payment_change).toBe(0);
      expect(impact.impact.liability_change).toBeCloseTo(0, 1);
      expect(impact.impact.net_impact).toBeCloseTo(0, 1);
    });
  });

  describe('Modification History', () => {
    it('should track modification history', () => {
      const modifications: ContractModificationFormData[] = [
        {
          modification_date: '2024-06-01',
          modification_type: 'payment_change',
          description: 'Primeira modificação',
          effective_date: '2024-06-01',
          payment_change_amount: 100,
          status: 'effective',
        },
        {
          modification_date: '2024-12-01',
          modification_type: 'term_extension',
          description: 'Segunda modificação',
          effective_date: '2024-12-01',
          term_change_months: 6,
          status: 'effective',
        },
      ];

      const engine = new IFRS16ModificationEngine(baseLeaseData, modifications);
      const history = engine.getModificationHistory();

      expect(history).toHaveLength(2);
      expect(history[0].modification.description).toBe('Primeira modificação');
      expect(history[1].modification.description).toBe('Segunda modificação');
    });
  });
});
