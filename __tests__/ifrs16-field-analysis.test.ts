import {
  analyzeContractQuality,
  generateComplianceReport,
  validateModificationCapability,
} from '@/lib/analysis/ifrs16-field-analysis';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';

describe('IFRS 16 Field Analysis', () => {
  // Contrato completo válido
  const completeContract: Partial<IFRS16CompleteData> = {
    contract_id: 'CTR-2024-001',
    contract_number: 'LEASING-001',
    title: 'Contrato de Leasing - Veículo ABC123',
    status: 'active',
    parties: {
      lessee: {
        name: 'Empresa ABC Ltda',
        tax_id: '12.345.678/0001-90',
        address: 'Rua das Flores, 123',
        contact_email: 'contato@empresaabc.com',
        contact_phone: '(11) 99999-9999',
      },
      lessor: {
        name: 'Banco XYZ S.A.',
        tax_id: '98.765.432/0001-10',
        address: 'Av. Paulista, 1000',
        contact_email: 'leasing@bancoxyz.com',
        contact_phone: '(11) 88888-8888',
      },
    },
    asset: {
      asset_type: 'vehicle',
      asset_description: 'Veículo Honda Civic 2024',
      asset_identification: 'ABC-1234',
      asset_location: 'São Paulo - SP',
      asset_condition: 'new',
      asset_useful_life_years: 5,
    },
    lease_start_date: '2024-01-01',
    lease_end_date: '2027-01-01',
    lease_term_months: 36,
    currency_code: 'BRL',
    monthly_payment: 2500.0,
    payment_frequency: 'monthly',
    payment_timing: 'end',
    discount_rate_annual: 12.5,
    asset_fair_value: 90000.0,
    asset_residual_value: 45000.0,
    guaranteed_residual_value: 40000.0,
    initial_direct_costs: 2000.0,
    lease_incentives: 1000.0,
    lease_classification: 'finance',
    classification_justification: 'Contrato com opção de compra exercível',
    modifications: [],
    contract_options: {
      renewal_options: [],
      early_termination_options: [],
      purchase_options: [],
    },
    variable_payments: [],
    audit_trail: {
      last_calculation_date: '2024-01-01',
      last_review_date: '2024-01-15',
      reviewer: 'auditor123',
      compliance_status: 'compliant',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user123',
  };

  // Contrato incompleto
  const incompleteContract: Partial<IFRS16CompleteData> = {
    contract_id: 'CTR-2024-002',
    title: 'Contrato Incompleto',
    status: 'draft',
    // Dados básicos removidos para testar validação
    // lease_start_date: '2024-01-01',
    // lease_end_date: '2027-01-01',
    // monthly_payment: 2500.00,
    // discount_rate_annual: 12.5,
    currency_code: 'BRL',
  };

  describe('analyzeContractQuality', () => {
    it('deve analisar contrato completo com alta qualidade', () => {
      const report = analyzeContractQuality(completeContract);

      expect(report.overall_score).toBeGreaterThanOrEqual(90);
      expect(report.compliance_level).toBe('compliant');
      expect(report.critical_issues).toHaveLength(0);
      expect(report.quality_metrics.required_fields_present).toBe(
        report.quality_metrics.total_required_fields
      );
    });

    it('deve identificar problemas em contrato incompleto', () => {
      const report = analyzeContractQuality(incompleteContract);

      expect(report.overall_score).toBeLessThan(70);
      expect(report.compliance_level).toBe('non_compliant');
      expect(report.critical_issues.length).toBeGreaterThan(0);
      expect(report.missing_fields.length).toBeGreaterThan(0);
    });

    it('deve identificar campos obrigatórios ausentes', () => {
      const report = analyzeContractQuality(incompleteContract);

      const criticalIssues = report.critical_issues;
      const requiredFields = criticalIssues.filter(issue => issue.category === 'required');

      expect(requiredFields.length).toBeGreaterThan(0);

      // Verificar se campos críticos estão ausentes
      const missingFields = report.missing_fields;
      expect(missingFields).toContain('parties.lessee.name');
      expect(missingFields).toContain('parties.lessor.name');
      expect(missingFields).toContain('asset.asset_description');
      expect(missingFields).toContain('lease_classification');
    });

    it('deve calcular métricas de qualidade corretamente', () => {
      const report = analyzeContractQuality(completeContract);

      expect(report.quality_metrics.required_fields_present).toBeGreaterThan(0);
      expect(report.quality_metrics.total_required_fields).toBeGreaterThan(0);
      expect(report.quality_metrics.recommended_fields_present).toBeGreaterThan(0);
      expect(report.quality_metrics.total_recommended_fields).toBeGreaterThan(0);

      expect(report.quality_metrics.required_fields_present).toBeLessThanOrEqual(
        report.quality_metrics.total_required_fields
      );
      expect(report.quality_metrics.recommended_fields_present).toBeLessThanOrEqual(
        report.quality_metrics.total_recommended_fields
      );
    });

    it('deve fornecer recomendações específicas', () => {
      const report = analyzeContractQuality(incompleteContract);

      expect(report.recommendations.length).toBeGreaterThan(0);

      report.recommendations.forEach(recommendation => {
        expect(recommendation.recommendation).toBeDefined();
        expect(recommendation.recommendation.length).toBeGreaterThan(0);
        expect(recommendation.ifrs16_requirement).toBeDefined();
        expect(recommendation.impact_level).toMatch(/^(critical|high|medium|low)$/);
      });
    });
  });

  describe('validateModificationCapability', () => {
    it('deve permitir modificações em contrato ativo válido', () => {
      const capability = validateModificationCapability(completeContract);

      expect(capability.can_modify).toBe(true);
      expect(capability.modification_types.length).toBeGreaterThan(0);
      expect(capability.restrictions).toHaveLength(0);
      expect(capability.modification_types).toContain('term_extension');
      expect(capability.modification_types).toContain('payment_increase');
      expect(capability.modification_types).toContain('rate_change');
    });

    it('deve permitir mais modificações em contrato em rascunho', () => {
      const draftContract = { ...completeContract, status: 'draft' as const };
      const capability = validateModificationCapability(draftContract);

      expect(capability.can_modify).toBe(true);
      expect(capability.modification_types).toContain('asset_change');
      expect(capability.modification_types).toContain('classification_change');
    });

    it('deve negar modificações em contrato finalizado', () => {
      const completedContract = { ...completeContract, status: 'completed' as const };
      const capability = validateModificationCapability(completedContract);

      expect(capability.can_modify).toBe(false);
      expect(capability.modification_types).toHaveLength(0);
      expect(capability.restrictions).toContain('Contrato já finalizado ou cancelado');
    });

    it('deve negar modificações em contrato cancelado', () => {
      const cancelledContract = { ...completeContract, status: 'cancelled' as const };
      const capability = validateModificationCapability(cancelledContract);

      expect(capability.can_modify).toBe(false);
      expect(capability.modification_types).toHaveLength(0);
      expect(capability.restrictions).toContain('Contrato já finalizado ou cancelado');
    });

    it('deve negar modificações em contrato com dados incompletos', () => {
      const capability = validateModificationCapability(incompleteContract);

      expect(capability.can_modify).toBe(false);
      expect(capability.modification_types).toHaveLength(0);
      expect(capability.restrictions).toContain('Dados básicos do contrato incompletos');
    });

    it('deve negar modificações em contrato expirado', () => {
      const expiredContract = {
        ...completeContract,
        lease_end_date: '2020-01-01', // Data passada
        status: 'active' as const,
      };
      const capability = validateModificationCapability(expiredContract);

      expect(capability.can_modify).toBe(false);
      expect(capability.restrictions).toContain('Contrato já expirado');
    });
  });

  describe('generateComplianceReport', () => {
    it('deve gerar relatório de conformidade para contrato completo', () => {
      const report = generateComplianceReport(completeContract);

      expect(report.ifrs16_compliance).toBe(true);
      expect(report.missing_requirements).toHaveLength(0);
      expect(report.audit_readiness).toBe('ready');
      expect(report.recommendations.length).toBeLessThanOrEqual(1); // Poucas recomendações
    });

    it('deve identificar não conformidade em contrato incompleto', () => {
      const report = generateComplianceReport(incompleteContract);

      expect(report.ifrs16_compliance).toBe(false);
      expect(report.missing_requirements.length).toBeGreaterThan(0);
      expect(report.audit_readiness).toBe('not_ready');
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('deve identificar requisitos ausentes específicos', () => {
      const report = generateComplianceReport(incompleteContract);

      expect(report.missing_requirements).toContain('Campos obrigatórios ausentes');
      expect(report.missing_requirements.some(req => req.includes('parties.lessee.name'))).toBe(
        true
      );
      expect(report.missing_requirements.some(req => req.includes('parties.lessor.name'))).toBe(
        true
      );
      expect(report.missing_requirements.some(req => req.includes('asset.asset_description'))).toBe(
        true
      );
    });

    it('deve identificar falta de suporte a modificações', () => {
      const contractWithoutModifications = {
        ...completeContract,
        modifications: undefined,
        contract_options: undefined,
      };
      const report = generateComplianceReport(contractWithoutModifications);

      expect(report.missing_requirements.some(req => req.includes('modificações'))).toBe(true);
      expect(report.recommendations).toContain('Implemente sistema de modificações contratuais');
    });

    it('deve fornecer recomendações específicas', () => {
      const report = generateComplianceReport(incompleteContract);

      expect(report.recommendations).toContain('Melhore a completude dos dados do contrato');
      expect(report.recommendations).toContain(
        'Preencha os campos recomendados para melhor conformidade'
      );
    });

    it('deve determinar prontidão para auditoria corretamente', () => {
      // Contrato pronto
      const readyContract = completeContract;
      const readyReport = generateComplianceReport(readyContract);
      expect(readyReport.audit_readiness).toBe('ready');

      // Contrato parcialmente pronto - com dados básicos mas sem modificações
      const partialContract = {
        ...completeContract,
        modifications: undefined,
        contract_options: undefined,
        audit_trail: undefined,
      };
      const partialReport = generateComplianceReport(partialContract);
      expect(partialReport.audit_readiness).toBe('partial');

      // Contrato não pronto
      const notReadyReport = generateComplianceReport(incompleteContract);
      expect(notReadyReport.audit_readiness).toBe('not_ready');
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com contrato vazio', () => {
      const emptyContract = {};
      const report = analyzeContractQuality(emptyContract);

      expect(report.overall_score).toBe(0);
      expect(report.compliance_level).toBe('non_compliant');
      expect(report.critical_issues.length).toBeGreaterThan(0);
    });

    it('deve lidar com campos com valores vazios', () => {
      const contractWithEmptyFields = {
        ...completeContract,
        parties: {
          lessee: { name: '' }, // Campo vazio
          lessor: { name: 'Banco XYZ S.A.' },
        },
      };

      const report = analyzeContractQuality(contractWithEmptyFields);
      expect(report.missing_fields).toContain('parties.lessee.name');
    });

    it('deve lidar com campos undefined', () => {
      const contractWithUndefinedFields = {
        ...completeContract,
        lease_classification: undefined,
      };

      const report = analyzeContractQuality(contractWithUndefinedFields);
      expect(report.missing_fields).toContain('lease_classification');
    });

    it('deve lidar com campos null', () => {
      const contractWithNullFields = {
        ...completeContract,
        monthly_payment: undefined,
      };

      const report = analyzeContractQuality(contractWithNullFields);
      expect(report.missing_fields).toContain('monthly_payment');
    });
  });

  describe('Performance', () => {
    it('deve analisar contrato rapidamente', () => {
      const startTime = Date.now();
      analyzeContractQuality(completeContract);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
    });

    it('deve validar modificações rapidamente', () => {
      const startTime = Date.now();
      validateModificationCapability(completeContract);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // Menos de 50ms
    });

    it('deve gerar relatório rapidamente', () => {
      const startTime = Date.now();
      generateComplianceReport(completeContract);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
    });
  });
});
