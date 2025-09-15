/**
 * IFRS 16 Report Generator
 *
 * Generates comprehensive reports for IFRS 16 lease contracts:
 * - PDF reports with detailed analysis
 * - Excel exports with data tables
 * - Compliance reports
 * - Audit-ready documentation
 */

import {
  AdvancedDisclosures,
  IFRS16AdvancedDisclosuresEngine,
} from '@/lib/calculations/ifrs16-advanced-disclosures';
import { ExceptionAnalysis, IFRS16ExceptionsEngine } from '@/lib/calculations/ifrs16-exceptions';
import { IFRS16ImpairmentEngine, ImpairmentAnalysis } from '@/lib/calculations/ifrs16-impairment';
import {
  IFRS16SensitivityEngine,
  SensitivityAnalysis,
} from '@/lib/calculations/ifrs16-sensitivity';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';
import { IFRS16CalculationResult } from '@/lib/schemas/ifrs16-lease';

export interface ReportConfiguration {
  report_type: 'comprehensive' | 'compliance' | 'audit' | 'executive_summary';
  include_sections: {
    contract_details: boolean;
    calculations: boolean;
    advanced_disclosures: boolean;
    exceptions: boolean;
    impairment: boolean;
    sensitivity: boolean;
    modifications: boolean;
  };
  format: 'pdf' | 'excel' | 'both';
  language: 'pt-BR' | 'en' | 'es';
  company_info: {
    name: string;
    logo_url?: string;
    address: string;
    contact_info: string;
  };
}

export interface ReportData {
  contract_data: IFRS16CompleteData;
  calculation_result: IFRS16CalculationResult;
  advanced_disclosures: AdvancedDisclosures;
  exception_analysis: ExceptionAnalysis;
  impairment_analysis: ImpairmentAnalysis;
  sensitivity_analysis: SensitivityAnalysis;
  report_metadata: {
    generated_date: string;
    generated_by: string;
    report_version: string;
    compliance_status: string;
  };
}

export interface ExcelWorksheet {
  name: string;
  data: any[][];
  headers: string[];
  formats?: {
    [key: string]: {
      type: 'currency' | 'percentage' | 'date' | 'number';
      format?: string;
    };
  };
}

export interface PDFSection {
  title: string;
  content: string;
  type: 'text' | 'table' | 'chart' | 'summary';
  data?: any;
}

export class IFRS16ReportGenerator {
  private contractData: IFRS16CompleteData;
  private config: ReportConfiguration;

  constructor(contractData: IFRS16CompleteData, config: ReportConfiguration) {
    this.contractData = contractData;
    this.config = config;
  }

  /**
   * Generate comprehensive report data
   */
  async generateReportData(): Promise<ReportData> {
    // Generate all analysis components
    const calculationResult = await this.generateCalculationResult();
    const advancedDisclosures = await this.generateAdvancedDisclosures();
    const exceptionAnalysis = await this.generateExceptionAnalysis();
    const impairmentAnalysis = await this.generateImpairmentAnalysis();
    const sensitivityAnalysis = await this.generateSensitivityAnalysis();

    return {
      contract_data: this.contractData,
      calculation_result: calculationResult,
      advanced_disclosures: advancedDisclosures,
      exception_analysis: exceptionAnalysis,
      impairment_analysis: impairmentAnalysis,
      sensitivity_analysis: sensitivityAnalysis,
      report_metadata: {
        generated_date: new Date().toISOString(),
        generated_by: 'IFRS16_Report_Generator',
        report_version: '1.0',
        compliance_status: this.determineComplianceStatus(
          advancedDisclosures,
          exceptionAnalysis,
          impairmentAnalysis
        ),
      },
    };
  }

  /**
   * Generate Excel workbook
   */
  async generateExcelReport(reportData: ReportData): Promise<ExcelWorksheet[]> {
    const worksheets: ExcelWorksheet[] = [];

    if (this.config.include_sections.contract_details) {
      worksheets.push(this.generateContractDetailsWorksheet(reportData));
    }

    if (this.config.include_sections.calculations) {
      worksheets.push(this.generateCalculationsWorksheet(reportData));
    }

    if (this.config.include_sections.advanced_disclosures) {
      worksheets.push(this.generateAdvancedDisclosuresWorksheet(reportData));
    }

    if (this.config.include_sections.exceptions) {
      worksheets.push(this.generateExceptionsWorksheet(reportData));
    }

    if (this.config.include_sections.impairment) {
      worksheets.push(this.generateImpairmentWorksheet(reportData));
    }

    if (this.config.include_sections.sensitivity) {
      worksheets.push(this.generateSensitivityWorksheet(reportData));
    }

    if (this.config.include_sections.modifications) {
      worksheets.push(this.generateModificationsWorksheet(reportData));
    }

    // Add summary worksheet
    worksheets.push(this.generateSummaryWorksheet(reportData));

    return worksheets;
  }

  /**
   * Generate PDF report sections
   */
  async generatePDFReport(reportData: ReportData): Promise<PDFSection[]> {
    const sections: PDFSection[] = [];

    // Executive Summary
    sections.push(this.generateExecutiveSummary(reportData));

    // Contract Details
    if (this.config.include_sections.contract_details) {
      sections.push(this.generateContractDetailsSection(reportData));
    }

    // Calculations
    if (this.config.include_sections.calculations) {
      sections.push(this.generateCalculationsSection(reportData));
    }

    // Advanced Disclosures
    if (this.config.include_sections.advanced_disclosures) {
      sections.push(this.generateAdvancedDisclosuresSection(reportData));
    }

    // Exceptions
    if (this.config.include_sections.exceptions) {
      sections.push(this.generateExceptionsSection(reportData));
    }

    // Impairment
    if (this.config.include_sections.impairment) {
      sections.push(this.generateImpairmentSection(reportData));
    }

    // Sensitivity
    if (this.config.include_sections.sensitivity) {
      sections.push(this.generateSensitivitySection(reportData));
    }

    // Compliance Summary
    sections.push(this.generateComplianceSummary(reportData));

    return sections;
  }

  // Private methods for data generation

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

  private async generateCalculationResult(): Promise<IFRS16CalculationResult> {
    const { IFRS16CalculationEngine } = await import('@/lib/calculations/ifrs16-engine');
    const engine = new IFRS16CalculationEngine(this.convertToLeaseFormData(this.contractData));
    return engine.calculateAll();
  }

  private async generateAdvancedDisclosures(): Promise<AdvancedDisclosures> {
    const engine = new IFRS16AdvancedDisclosuresEngine(this.contractData);
    return engine.generateAdvancedDisclosures();
  }

  private async generateExceptionAnalysis(): Promise<ExceptionAnalysis> {
    const engine = new IFRS16ExceptionsEngine(this.contractData);
    return engine.analyzeExceptions();
  }

  private async generateImpairmentAnalysis(): Promise<ImpairmentAnalysis> {
    const engine = new IFRS16ImpairmentEngine(this.contractData);
    return engine.performImpairmentAnalysis();
  }

  private async generateSensitivityAnalysis(): Promise<SensitivityAnalysis> {
    const engine = new IFRS16SensitivityEngine(this.contractData);
    return engine.performSensitivityAnalysis();
  }

  private determineComplianceStatus(
    advancedDisclosures: AdvancedDisclosures,
    exceptionAnalysis: ExceptionAnalysis,
    impairmentAnalysis: ImpairmentAnalysis
  ): string {
    let complianceScore = 100;

    // Check advanced disclosures completeness
    if (advancedDisclosures.exercised_options.length === 0) {
      complianceScore -= 5;
    }

    // Check exception analysis
    if (exceptionAnalysis.exception_type !== 'none') {
      complianceScore -= 10;
    }

    // Check impairment status
    if (impairmentAnalysis.impairment_status === 'impaired') {
      complianceScore -= 15;
    }

    if (complianceScore >= 95) return 'Fully Compliant';
    if (complianceScore >= 85) return 'Mostly Compliant';
    if (complianceScore >= 70) return 'Partially Compliant';
    return 'Non-Compliant';
  }

  // Excel worksheet generators

  private generateContractDetailsWorksheet(reportData: ReportData): ExcelWorksheet {
    const contract = reportData.contract_data;
    const data = [
      ['Campo', 'Valor'],
      ['ID do Contrato', contract.contract_id],
      ['Título', contract.title],
      ['Status', contract.status],
      ['Data de Início', contract.lease_start_date],
      ['Data de Término', contract.lease_end_date],
      ['Prazo (meses)', contract.lease_term_months],
      ['Pagamento Mensal', contract.monthly_payment],
      ['Taxa de Desconto (%)', contract.discount_rate_annual],
      ['Moeda', contract.currency_code],
      ['Valor Justo do Ativo', contract.asset_fair_value || 0],
      ['Valor Residual Garantido', contract.guaranteed_residual_value || 0],
      ['Custos Diretos Iniciais', contract.initial_direct_costs || 0],
      ['Incentivos de Leasing', contract.lease_incentives || 0],
      ['Classificação', contract.lease_classification || 'N/A'],
    ];

    return {
      name: 'Detalhes do Contrato',
      data,
      headers: ['Campo', 'Valor'],
      formats: {
        'B2:B16': { type: 'currency' },
        B9: { type: 'percentage' },
      },
    };
  }

  private generateCalculationsWorksheet(reportData: ReportData): ExcelWorksheet {
    const calc = reportData.calculation_result;
    const data = [
      ['Item', 'Valor'],
      ['Passivo de Arrendamento Inicial', calc.lease_liability_initial],
      ['Passivo de Arrendamento Atual', calc.lease_liability_current],
      ['Ativo de Direito de Uso Inicial', calc.right_of_use_asset_initial],
      ['Ativo de Direito de Uso Atual', calc.right_of_use_asset_current],
      ['Despesa de Juros Mensal', calc.monthly_interest_expense],
      ['Pagamento Principal Mensal', calc.monthly_principal_payment],
      ['Amortização Mensal', calc.monthly_amortization],
      ['Total de Despesas de Juros', calc.total_interest_expense],
      ['Total de Pagamentos Principais', calc.total_principal_payments],
      ['Total de Pagamentos de Arrendamento', calc.total_lease_payments],
      ['Taxa de Juros Efetiva Anual (%)', calc.effective_interest_rate_annual],
      ['Taxa de Juros Efetiva Mensal (%)', calc.effective_interest_rate_monthly],
    ];

    return {
      name: 'Cálculos IFRS 16',
      data,
      headers: ['Item', 'Valor'],
      formats: {
        'B2:B12': { type: 'currency' },
        'B13:B14': { type: 'percentage' },
      },
    };
  }

  private generateAdvancedDisclosuresWorksheet(reportData: ReportData): ExcelWorksheet {
    const disclosures = reportData.advanced_disclosures;
    const data = [
      ['Análise de Maturidade'],
      ['Período', 'Passivo de Arrendamento', 'Despesa de Juros', 'Pagamento Principal', 'Total'],
      ...disclosures.maturity_analysis.periods.map(period => [
        `${period.period_start} - ${period.period_end}`,
        period.lease_liability,
        period.interest_expense,
        period.principal_payment,
        period.total_payment,
      ]),
      [''],
      ['Opções Exercidas'],
      ['Tipo', 'Data de Exercício', 'Impacto no Passivo', 'Impacto no Ativo', 'Justificativa'],
      ...disclosures.exercised_options.map(option => [
        option.option_type,
        option.exercise_date,
        option.financial_impact.liability_change,
        option.financial_impact.asset_change,
        option.justification,
      ]),
    ];

    return {
      name: 'Divulgações Avançadas',
      data,
      headers: ['Item', 'Valor'],
      formats: {
        'B3:F10': { type: 'currency' },
      },
    };
  }

  private generateExceptionsWorksheet(reportData: ReportData): ExcelWorksheet {
    const exceptions = reportData.exception_analysis;
    const data = [
      ['Análise de Exceções'],
      ['Tipo de Exceção', exceptions.exception_type],
      ['Tratamento Contábil', exceptions.accounting_treatment],
      [''],
      ['Critérios de Curto Prazo'],
      ['Prazo (meses)', exceptions.short_term_criteria.lease_term_months],
      ['É curto prazo', exceptions.short_term_criteria.is_short_term ? 'Sim' : 'Não'],
      ['Tem opção de compra', exceptions.short_term_criteria.has_purchase_option ? 'Sim' : 'Não'],
      ['Probabilidade de renovação (%)', exceptions.short_term_criteria.renewal_probability],
      ['Qualifica à exceção', exceptions.short_term_criteria.meets_criteria ? 'Sim' : 'Não'],
      [''],
      ['Critérios de Baixo Valor'],
      ['Valor justo do ativo', exceptions.low_value_criteria.asset_fair_value],
      ['Threshold de baixo valor', exceptions.low_value_criteria.low_value_threshold],
      ['É baixo valor', exceptions.low_value_criteria.is_low_value ? 'Sim' : 'Não'],
      ['Qualifica à exceção', exceptions.low_value_criteria.meets_criteria ? 'Sim' : 'Não'],
    ];

    return {
      name: 'Exceções IFRS 16',
      data,
      headers: ['Campo', 'Valor'],
      formats: {
        B6: { type: 'number' },
        B9: { type: 'percentage' },
        'B13:B14': { type: 'currency' },
      },
    };
  }

  private generateImpairmentWorksheet(reportData: ReportData): ExcelWorksheet {
    const impairment = reportData.impairment_analysis;
    const currentTest = impairment.current_tests[0];

    const data = [
      ['Teste de Impairment'],
      ['Data do Teste', currentTest.test_date],
      ['Status do Impairment', impairment.impairment_status],
      ['Valor Contábil', currentTest.carrying_amount],
      ['Valor Recuperável', currentTest.recoverable_amount],
      ['Perda por Impairment', currentTest.impairment_loss],
      ['Valor Líquido', impairment.net_carrying_amount],
      [''],
      ['Indicadores de Impairment'],
      ['Tipo', 'Descrição', 'Severidade', 'Impacto'],
      ...currentTest.indicators_present.map(indicator => [
        indicator.indicator_type,
        indicator.description,
        indicator.severity,
        indicator.impact_on_value,
      ]),
    ];

    return {
      name: 'Teste de Impairment',
      data,
      headers: ['Campo', 'Valor'],
      formats: {
        'B4:B7': { type: 'currency' },
      },
    };
  }

  private generateSensitivityWorksheet(reportData: ReportData): ExcelWorksheet {
    const sensitivity = reportData.sensitivity_analysis;

    const data = [
      ['Análise de Sensibilidade'],
      ['Parâmetro', 'Variação (%)', 'Novo Valor', 'Mudança no Passivo', 'Impacto (%)'],
      ...sensitivity.sensitivity_results.flatMap(result =>
        result.variations.map(variation => [
          result.parameter,
          variation.variation_percent,
          variation.new_value,
          variation.lease_liability_change,
          variation.impact_percentage,
        ])
      ),
      [''],
      ['Cenários de Estresse'],
      ['Cenário', 'Probabilidade (%)', 'Severidade', 'Impacto Total'],
      ...sensitivity.stress_scenarios.map(scenario => [
        scenario.scenario_name,
        scenario.probability,
        scenario.severity,
        scenario.impact.total_financial_impact,
      ]),
    ];

    return {
      name: 'Análise de Sensibilidade',
      data,
      headers: ['Campo', 'Valor'],
      formats: {
        'C3:C20': { type: 'currency' },
        'E3:E20': { type: 'percentage' },
        'B22:B25': { type: 'percentage' },
        'D22:D25': { type: 'currency' },
      },
    };
  }

  private generateModificationsWorksheet(reportData: ReportData): ExcelWorksheet {
    const modifications = reportData.contract_data.modifications || [];

    const data = [
      ['Modificações do Contrato'],
      ['Data', 'Tipo', 'Descrição', 'Data Efetiva', 'Impacto Financeiro'],
      ...modifications.map(mod => [
        mod.modification_date,
        mod.modification_type,
        mod.description,
        mod.effective_date,
        mod.financial_impact
          ? (mod.financial_impact.liability_change || 0) + (mod.financial_impact.asset_change || 0)
          : 0,
      ]),
    ];

    return {
      name: 'Modificações',
      data,
      headers: ['Campo', 'Valor'],
      formats: {
        'E3:E10': { type: 'currency' },
      },
    };
  }

  private generateSummaryWorksheet(reportData: ReportData): ExcelWorksheet {
    const data = [
      ['Resumo Executivo'],
      ['Contrato', reportData.contract_data.title],
      ['Status de Conformidade', reportData.report_metadata.compliance_status],
      [
        'Data de Geração',
        new Date(reportData.report_metadata.generated_date).toLocaleDateString('pt-BR'),
      ],
      [''],
      ['Métricas Principais'],
      ['Passivo de Arrendamento', reportData.calculation_result.lease_liability_initial],
      ['Ativo de Direito de Uso', reportData.calculation_result.right_of_use_asset_initial],
      ['Total de Pagamentos', reportData.calculation_result.total_lease_payments],
      ['Taxa Efetiva (%)', reportData.calculation_result.effective_interest_rate_annual],
      [''],
      ['Análises Realizadas'],
      ['Divulgações Avançadas', 'Concluída'],
      [
        'Exceções',
        reportData.exception_analysis.exception_type !== 'none' ? 'Aplicável' : 'Não Aplicável',
      ],
      ['Impairment', reportData.impairment_analysis.impairment_status],
      ['Sensibilidade', 'Concluída'],
    ];

    return {
      name: 'Resumo',
      data,
      headers: ['Campo', 'Valor'],
      formats: {
        'B6:B9': { type: 'currency' },
        B10: { type: 'percentage' },
      },
    };
  }

  // PDF section generators

  private generateExecutiveSummary(reportData: ReportData): PDFSection {
    const contract = reportData.contract_data;
    const calc = reportData.calculation_result;

    const content = `
      <h2>Resumo Executivo</h2>
      <p><strong>Contrato:</strong> ${contract.title}</p>
      <p><strong>Status de Conformidade:</strong> ${reportData.report_metadata.compliance_status}</p>
      <p><strong>Data de Geração:</strong> ${new Date(reportData.report_metadata.generated_date).toLocaleDateString('pt-BR')}</p>
      
      <h3>Métricas Principais</h3>
      <ul>
        <li>Passivo de Arrendamento: ${this.formatCurrency(calc.lease_liability_initial, contract.currency_code)}</li>
        <li>Ativo de Direito de Uso: ${this.formatCurrency(calc.right_of_use_asset_initial, contract.currency_code)}</li>
        <li>Total de Pagamentos: ${this.formatCurrency(calc.total_lease_payments, contract.currency_code)}</li>
        <li>Taxa Efetiva: ${calc.effective_interest_rate_annual.toFixed(2)}% a.a.</li>
      </ul>
      
      <h3>Principais Conclusões</h3>
      <ul>
        <li>${reportData.exception_analysis.exception_type !== 'none' ? 'Contrato se qualifica para exceções do IFRS 16' : 'Contrato requer aplicação completa do IFRS 16'}</li>
        <li>${reportData.impairment_analysis.impairment_status === 'impaired' ? 'Ativo apresenta impairment' : 'Ativo não apresenta impairment'}</li>
        <li>Análise de sensibilidade concluída com ${reportData.sensitivity_analysis.stress_scenarios.length} cenários de estresse</li>
      </ul>
    `;

    return {
      title: 'Resumo Executivo',
      content,
      type: 'summary',
    };
  }

  private generateContractDetailsSection(reportData: ReportData): PDFSection {
    const contract = reportData.contract_data;

    const content = `
      <h2>Detalhes do Contrato</h2>
      <table>
        <tr><td><strong>ID do Contrato:</strong></td><td>${contract.contract_id}</td></tr>
        <tr><td><strong>Título:</strong></td><td>${contract.title}</td></tr>
        <tr><td><strong>Status:</strong></td><td>${contract.status}</td></tr>
        <tr><td><strong>Data de Início:</strong></td><td>${contract.lease_start_date}</td></tr>
        <tr><td><strong>Data de Término:</strong></td><td>${contract.lease_end_date}</td></tr>
        <tr><td><strong>Prazo:</strong></td><td>${contract.lease_term_months} meses</td></tr>
        <tr><td><strong>Pagamento Mensal:</strong></td><td>${this.formatCurrency(contract.monthly_payment, contract.currency_code)}</td></tr>
        <tr><td><strong>Taxa de Desconto:</strong></td><td>${contract.discount_rate_annual}% a.a.</td></tr>
        <tr><td><strong>Moeda:</strong></td><td>${contract.currency_code}</td></tr>
      </table>
    `;

    return {
      title: 'Detalhes do Contrato',
      content,
      type: 'table',
    };
  }

  private generateCalculationsSection(reportData: ReportData): PDFSection {
    const calc = reportData.calculation_result;
    const contract = reportData.contract_data;

    const content = `
      <h2>Cálculos IFRS 16</h2>
      <table>
        <tr><td><strong>Passivo de Arrendamento Inicial:</strong></td><td>${this.formatCurrency(calc.lease_liability_initial, contract.currency_code)}</td></tr>
        <tr><td><strong>Passivo de Arrendamento Atual:</strong></td><td>${this.formatCurrency(calc.lease_liability_current, contract.currency_code)}</td></tr>
        <tr><td><strong>Ativo de Direito de Uso Inicial:</strong></td><td>${this.formatCurrency(calc.right_of_use_asset_initial, contract.currency_code)}</td></tr>
        <tr><td><strong>Ativo de Direito de Uso Atual:</strong></td><td>${this.formatCurrency(calc.right_of_use_asset_current, contract.currency_code)}</td></tr>
        <tr><td><strong>Despesa de Juros Mensal:</strong></td><td>${this.formatCurrency(calc.monthly_interest_expense, contract.currency_code)}</td></tr>
        <tr><td><strong>Pagamento Principal Mensal:</strong></td><td>${this.formatCurrency(calc.monthly_principal_payment, contract.currency_code)}</td></tr>
        <tr><td><strong>Amortização Mensal:</strong></td><td>${this.formatCurrency(calc.monthly_amortization, contract.currency_code)}</td></tr>
        <tr><td><strong>Total de Despesas de Juros:</strong></td><td>${this.formatCurrency(calc.total_interest_expense, contract.currency_code)}</td></tr>
        <tr><td><strong>Total de Pagamentos:</strong></td><td>${this.formatCurrency(calc.total_lease_payments, contract.currency_code)}</td></tr>
        <tr><td><strong>Taxa Efetiva Anual:</strong></td><td>${calc.effective_interest_rate_annual.toFixed(2)}%</td></tr>
      </table>
    `;

    return {
      title: 'Cálculos IFRS 16',
      content,
      type: 'table',
    };
  }

  private generateAdvancedDisclosuresSection(reportData: ReportData): PDFSection {
    const disclosures = reportData.advanced_disclosures;

    const content = `
      <h2>Divulgações Avançadas IFRS 16.51-53</h2>
      
      <h3>Análise de Maturidade</h3>
      <p>Total do Passivo: ${this.formatCurrency(disclosures.maturity_analysis.total_liability, reportData.contract_data.currency_code)}</p>
      <p>Total de Juros: ${this.formatCurrency(disclosures.maturity_analysis.total_interest, reportData.contract_data.currency_code)}</p>
      <p>Total Principal: ${this.formatCurrency(disclosures.maturity_analysis.total_principal, reportData.contract_data.currency_code)}</p>
      
      <h3>Opções Exercidas</h3>
      <p>Número de opções exercidas: ${disclosures.exercised_options.length}</p>
      
      <h3>Restrições Contratuais</h3>
      <p>Número de restrições identificadas: ${disclosures.contractual_restrictions.length}</p>
    `;

    return {
      title: 'Divulgações Avançadas',
      content,
      type: 'text',
    };
  }

  private generateExceptionsSection(reportData: ReportData): PDFSection {
    const exceptions = reportData.exception_analysis;

    const content = `
      <h2>Análise de Exceções IFRS 16.5-8</h2>
      
      <h3>Tipo de Exceção</h3>
      <p><strong>Classificação:</strong> ${exceptions.exception_type}</p>
      <p><strong>Tratamento Contábil:</strong> ${exceptions.accounting_treatment}</p>
      
      <h3>Critérios de Curto Prazo</h3>
      <p>Prazo: ${exceptions.short_term_criteria.lease_term_months} meses</p>
      <p>É curto prazo: ${exceptions.short_term_criteria.is_short_term ? 'Sim' : 'Não'}</p>
      <p>Tem opção de compra: ${exceptions.short_term_criteria.has_purchase_option ? 'Sim' : 'Não'}</p>
      <p>Qualifica à exceção: ${exceptions.short_term_criteria.meets_criteria ? 'Sim' : 'Não'}</p>
      
      <h3>Critérios de Baixo Valor</h3>
      <p>Valor justo: ${this.formatCurrency(exceptions.low_value_criteria.asset_fair_value, reportData.contract_data.currency_code)}</p>
      <p>Threshold: ${this.formatCurrency(exceptions.low_value_criteria.low_value_threshold, reportData.contract_data.currency_code)}</p>
      <p>Qualifica à exceção: ${exceptions.low_value_criteria.meets_criteria ? 'Sim' : 'Não'}</p>
    `;

    return {
      title: 'Exceções IFRS 16',
      content,
      type: 'text',
    };
  }

  private generateImpairmentSection(reportData: ReportData): PDFSection {
    const impairment = reportData.impairment_analysis;
    const currentTest = impairment.current_tests[0];

    const content = `
      <h2>Teste de Impairment IFRS 16.40</h2>
      
      <h3>Resultado do Teste</h3>
      <p><strong>Status:</strong> ${impairment.impairment_status}</p>
      <p><strong>Valor Contábil:</strong> ${this.formatCurrency(currentTest.carrying_amount, reportData.contract_data.currency_code)}</p>
      <p><strong>Valor Recuperável:</strong> ${this.formatCurrency(currentTest.recoverable_amount, reportData.contract_data.currency_code)}</p>
      <p><strong>Perda por Impairment:</strong> ${this.formatCurrency(currentTest.impairment_loss, reportData.contract_data.currency_code)}</p>
      
      <h3>Indicadores Identificados</h3>
      <p>Número de indicadores: ${currentTest.indicators_present.length}</p>
      ${
        currentTest.indicators_present.length > 0
          ? '<ul>' +
            currentTest.indicators_present
              .map(indicator => `<li>${indicator.description} (${indicator.severity})</li>`)
              .join('') +
            '</ul>'
          : '<p>Nenhum indicador significativo identificado.</p>'
      }
    `;

    return {
      title: 'Teste de Impairment',
      content,
      type: 'text',
    };
  }

  private generateSensitivitySection(reportData: ReportData): PDFSection {
    const sensitivity = reportData.sensitivity_analysis;

    const content = `
      <h2>Análise de Sensibilidade</h2>
      
      <h3>Cenários de Estresse</h3>
      <p>Número de cenários analisados: ${sensitivity.stress_scenarios.length}</p>
      
      <h3>Principais Conclusões</h3>
      <ul>
        ${sensitivity.key_findings.map(finding => `<li>${finding}</li>`).join('')}
      </ul>
      
      <h3>Recomendações</h3>
      <ul>
        ${sensitivity.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    `;

    return {
      title: 'Análise de Sensibilidade',
      content,
      type: 'text',
    };
  }

  private generateComplianceSummary(reportData: ReportData): PDFSection {
    const content = `
      <h2>Resumo de Conformidade</h2>
      
      <h3>Status Geral</h3>
      <p><strong>Conformidade:</strong> ${reportData.report_metadata.compliance_status}</p>
      
      <h3>Análises Realizadas</h3>
      <ul>
        <li>✅ Cálculos IFRS 16 - Concluído</li>
        <li>✅ Divulgações Avançadas - Concluído</li>
        <li>✅ Análise de Exceções - Concluído</li>
        <li>✅ Teste de Impairment - Concluído</li>
        <li>✅ Análise de Sensibilidade - Concluído</li>
      </ul>
      
      <h3>Próximos Passos</h3>
      <p>Este relatório está pronto para auditoria e conformidade com IFRS 16.</p>
    `;

    return {
      title: 'Resumo de Conformidade',
      content,
      type: 'summary',
    };
  }

  private formatCurrency(value: number, currencyCode: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  }
}
