/**
 * IFRS 16 Accounting Spreadsheet Generator
 * 
 * Gera planilha Excel completa com toda a contabilização do fluxo do contrato:
 * - Lançamentos contábeis detalhados
 * - Débitos e créditos por período
 * - Fluxo completo até saldo zero
 * - Conformidade com padrões contábeis brasileiros
 */

import { IFRS16CalculationEngine } from '@/lib/calculations/ifrs16-engine';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';
import { IFRS16CalculationResult } from '@/lib/schemas/ifrs16-lease';

export interface AccountingEntry {
  // Identificação básica
  entry_id: string;
  date: string;
  period: number;
  
  // Classificação contábil
  entry_type: 'initial' | 'monthly' | 'final' | 'modification';
  entry_category: 'reconhecimento_inicial' | 'pagamento_mensal' | 'amortizacao' | 'juros' | 'finalizacao';
  
  // Contas contábeis
  debit_account: string;
  debit_account_code: string;
  credit_account: string;
  credit_account_code: string;
  
  // Valores
  debit_amount: number;
  credit_amount: number;
  total_amount: number;
  
  // Histórico e documentação
  description: string;
  detailed_history: string;
  contract_reference: string;
  document_number?: string;
  
  // Classificação adicional
  cost_center?: string;
  department?: string;
  project_code?: string;
  
  // Metadados
  created_by: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  
  // Validação
  is_validated: boolean;
  validation_notes?: string;
}

export interface AccountingSpreadsheetData {
  contract_info: {
    title: string;
    contract_number: string;
    lessee: string;
    lessor: string;
    start_date: string;
    end_date: string;
    currency: string;
  };
  accounting_entries: AccountingEntry[];
  summary_totals: {
    total_debits: number;
    total_credits: number;
    lease_liability_initial: number;
    right_of_use_asset_initial: number;
    total_interest_expense: number;
    total_amortization: number;
  };
  amortization_schedule: Array<{
    period: number;
    date: string;
    beginning_liability: number;
    payment: number;
    interest_expense: number;
    principal_payment: number;
    ending_liability: number;
    beginning_asset: number;
    amortization: number;
    ending_asset: number;
  }>;
}

export class IFRS16AccountingSpreadsheetGenerator {
  private contractData: IFRS16CompleteData;
  private calculationResult: IFRS16CalculationResult;

  constructor(contractData: IFRS16CompleteData) {
    this.contractData = contractData;
    const engine = new IFRS16CalculationEngine(this.convertToLeaseFormData(contractData));
    this.calculationResult = engine.calculateAll();
  }

  /**
   * Generate complete accounting spreadsheet data
   */
  generateAccountingSpreadsheet(): AccountingSpreadsheetData {
    const accountingEntries = this.generateAccountingEntries();
    const amortizationSchedule = this.generateAmortizationSchedule();

    return {
      contract_info: {
        title: this.contractData.title,
        contract_number: this.contractData.contract_number || 'N/A',
        lessee: this.contractData.parties.lessee.name,
        lessor: this.contractData.parties.lessor.name,
        start_date: this.contractData.lease_start_date,
        end_date: this.contractData.lease_end_date,
        currency: this.contractData.currency_code,
      },
      accounting_entries: accountingEntries,
      summary_totals: {
        total_debits: accountingEntries.reduce((sum, entry) => sum + entry.debit_amount, 0),
        total_credits: accountingEntries.reduce((sum, entry) => sum + entry.credit_amount, 0),
        lease_liability_initial: this.calculationResult.lease_liability_initial,
        right_of_use_asset_initial: this.calculationResult.right_of_use_asset_initial,
        total_interest_expense: this.calculationResult.total_interest_expense,
        total_amortization: this.calculationResult.total_amortization,
      },
      amortization_schedule: amortizationSchedule,
    };
  }

  /**
   * Generate accounting entries for the entire lease term
   */
  private generateAccountingEntries(): AccountingEntry[] {
    const entries: AccountingEntry[] = [];

    // 1. Initial recognition entries
    entries.push(...this.generateInitialEntries());

    // 2. Monthly entries for each period
    for (let period = 1; period <= this.contractData.lease_term_months; period++) {
      entries.push(...this.generateMonthlyEntries(period));
    }

    // 3. Final entries (if applicable)
    entries.push(...this.generateFinalEntries());

    return entries;
  }

  /**
   * Generate initial recognition accounting entries
   */
  private generateInitialEntries(): AccountingEntry[] {
    const entries: AccountingEntry[] = [];
    const startDate = this.contractData.lease_start_date;
    const contractRef = `${this.contractData.contract_number || 'N/A'} - ${this.contractData.title}`;
    const currentDate = new Date().toISOString();

    // Entry 1: Initial recognition of lease liability and right-of-use asset
    entries.push({
      entry_id: `LEAS-INIT-001-${this.contractData.contract_id}`,
      date: startDate,
      period: 0,
      entry_type: 'initial',
      entry_category: 'reconhecimento_inicial',
      debit_account: 'Ativo de Direito de Uso - Arrendamento',
      debit_account_code: '2.1.1.01',
      credit_account: 'Passivo de Arrendamento',
      credit_account_code: '2.2.1.01',
      debit_amount: this.calculationResult.right_of_use_asset_initial,
      credit_amount: this.calculationResult.lease_liability_initial,
      total_amount: this.calculationResult.right_of_use_asset_initial,
      description: 'Reconhecimento inicial do contrato de arrendamento',
      detailed_history: `Reconhecimento inicial do ativo de direito de uso e passivo de arrendamento conforme IFRS 16. Contrato: ${contractRef}`,
      contract_reference: contractRef,
      document_number: `LEAS-INIT-001`,
      cost_center: 'ADMINISTRATIVO',
      department: 'CONTABILIDADE',
      project_code: 'IFRS16',
      created_by: 'SISTEMA_CONTABILEASE',
      created_at: currentDate,
      approved_by: 'CONTADOR_RESPONSAVEL',
      approved_at: currentDate,
      is_validated: true,
      validation_notes: 'Lançamento automático conforme IFRS 16.26',
    });

    // Entry 2: Initial direct costs (if any)
    if (this.contractData.initial_direct_costs && this.contractData.initial_direct_costs > 0) {
      entries.push({
        entry_id: `LEAS-INIT-002-${this.contractData.contract_id}`,
        date: startDate,
        period: 0,
        entry_type: 'initial',
        entry_category: 'reconhecimento_inicial',
        debit_account: 'Ativo de Direito de Uso - Arrendamento',
        debit_account_code: '2.1.1.01',
        credit_account: 'Caixa/Bancos',
        credit_account_code: '1.1.1.01',
        debit_amount: this.contractData.initial_direct_costs,
        credit_amount: this.contractData.initial_direct_costs,
        total_amount: this.contractData.initial_direct_costs,
        description: 'Custos diretos iniciais do arrendamento',
        detailed_history: `Custos diretos iniciais incorridos na celebração do contrato de arrendamento. Contrato: ${contractRef}`,
        contract_reference: contractRef,
        document_number: `LEAS-INIT-002`,
        cost_center: 'ADMINISTRATIVO',
        department: 'CONTABILIDADE',
        project_code: 'IFRS16',
        created_by: 'SISTEMA_CONTABILEASE',
        created_at: currentDate,
        approved_by: 'CONTADOR_RESPONSAVEL',
        approved_at: currentDate,
        is_validated: true,
        validation_notes: 'Custos diretos conforme IFRS 16.23',
      });
    }

    // Entry 3: Lease incentives (if any)
    if (this.contractData.lease_incentives && this.contractData.lease_incentives > 0) {
      entries.push({
        entry_id: `LEAS-INIT-003-${this.contractData.contract_id}`,
        date: startDate,
        period: 0,
        entry_type: 'initial',
        entry_category: 'reconhecimento_inicial',
        debit_account: 'Caixa/Bancos',
        debit_account_code: '1.1.1.01',
        credit_account: 'Ativo de Direito de Uso - Arrendamento',
        credit_account_code: '2.1.1.01',
        debit_amount: this.contractData.lease_incentives,
        credit_amount: this.contractData.lease_incentives,
        total_amount: this.contractData.lease_incentives,
        description: 'Incentivos de arrendamento recebidos',
        detailed_history: `Incentivos de arrendamento recebidos do arrendador na celebração do contrato. Contrato: ${contractRef}`,
        contract_reference: contractRef,
        document_number: `LEAS-INIT-003`,
        cost_center: 'ADMINISTRATIVO',
        department: 'CONTABILIDADE',
        project_code: 'IFRS16',
        created_by: 'SISTEMA_CONTABILEASE',
        created_at: currentDate,
        approved_by: 'CONTADOR_RESPONSAVEL',
        approved_at: currentDate,
        is_validated: true,
        validation_notes: 'Incentivos conforme IFRS 16.24',
      });
    }

    // Entry 4: Initial payment (if any)
    if (this.contractData.initial_payment && this.contractData.initial_payment > 0) {
      entries.push({
        entry_id: `LEAS-INIT-004-${this.contractData.contract_id}`,
        date: startDate,
        period: 0,
        entry_type: 'initial',
        entry_category: 'pagamento_mensal',
        debit_account: 'Passivo de Arrendamento',
        debit_account_code: '2.2.1.01',
        credit_account: 'Caixa/Bancos',
        credit_account_code: '1.1.1.01',
        debit_amount: this.contractData.initial_payment,
        credit_amount: this.contractData.initial_payment,
        total_amount: this.contractData.initial_payment,
        description: 'Pagamento inicial do arrendamento',
        detailed_history: `Pagamento inicial realizado na celebração do contrato de arrendamento. Contrato: ${contractRef}`,
        contract_reference: contractRef,
        document_number: `LEAS-INIT-004`,
        cost_center: 'ADMINISTRATIVO',
        department: 'CONTABILIDADE',
        project_code: 'IFRS16',
        created_by: 'SISTEMA_CONTABILEASE',
        created_at: currentDate,
        approved_by: 'CONTADOR_RESPONSAVEL',
        approved_at: currentDate,
        is_validated: true,
        validation_notes: 'Pagamento inicial conforme contrato',
      });
    }

    return entries;
  }

  /**
   * Generate monthly accounting entries
   */
  private generateMonthlyEntries(period: number): AccountingEntry[] {
    const entries: AccountingEntry[] = [];
    const schedule = this.calculationResult.amortization_schedule;
    const periodData = schedule.find(p => p.period === period);
    
    if (!periodData) return entries;

    const paymentDate = this.calculatePaymentDate(period);
    const contractRef = `${this.contractData.contract_number || 'N/A'} - ${this.contractData.title}`;
    const currentDate = new Date().toISOString();

    // Entry 1: Interest expense
    entries.push({
      entry_id: `LEAS-MON-${period.toString().padStart(3, '0')}-001-${this.contractData.contract_id}`,
      date: paymentDate,
      period: period,
      entry_type: 'monthly',
      entry_category: 'juros',
      debit_account: 'Despesa de Juros - Arrendamento',
      debit_account_code: '3.1.1.01',
      credit_account: 'Passivo de Arrendamento',
      credit_account_code: '2.2.1.01',
      debit_amount: periodData.interest_expense,
      credit_amount: periodData.interest_expense,
      total_amount: periodData.interest_expense,
      description: `Despesa de juros - Período ${period}`,
      detailed_history: `Despesa de juros incorrida no período ${period} do contrato de arrendamento. Taxa aplicada: ${this.contractData.discount_rate_annual}% a.a. Contrato: ${contractRef}`,
      contract_reference: contractRef,
      document_number: `LEAS-MON-${period.toString().padStart(3, '0')}-001`,
      cost_center: 'ADMINISTRATIVO',
      department: 'CONTABILIDADE',
      project_code: 'IFRS16',
      created_by: 'SISTEMA_CONTABILEASE',
      created_at: currentDate,
      approved_by: 'CONTADOR_RESPONSAVEL',
      approved_at: currentDate,
      is_validated: true,
      validation_notes: `Juros calculados sobre saldo inicial de R$ ${periodData.beginning_liability.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    });

    // Entry 2: Principal payment
    entries.push({
      entry_id: `LEAS-MON-${period.toString().padStart(3, '0')}-002-${this.contractData.contract_id}`,
      date: paymentDate,
      period: period,
      entry_type: 'monthly',
      entry_category: 'pagamento_mensal',
      debit_account: 'Passivo de Arrendamento',
      debit_account_code: '2.2.1.01',
      credit_account: 'Caixa/Bancos',
      credit_account_code: '1.1.1.01',
      debit_amount: periodData.principal_payment,
      credit_amount: periodData.principal_payment,
      total_amount: periodData.principal_payment,
      description: `Pagamento principal - Período ${period}`,
      detailed_history: `Pagamento principal realizado no período ${period} do contrato de arrendamento. Valor total do pagamento: R$ ${periodData.monthly_payment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Contrato: ${contractRef}`,
      contract_reference: contractRef,
      document_number: `LEAS-MON-${period.toString().padStart(3, '0')}-002`,
      cost_center: 'ADMINISTRATIVO',
      department: 'CONTABILIDADE',
      project_code: 'IFRS16',
      created_by: 'SISTEMA_CONTABILEASE',
      created_at: currentDate,
      approved_by: 'CONTADOR_RESPONSAVEL',
      approved_at: currentDate,
      is_validated: true,
      validation_notes: `Pagamento principal após dedução de juros de R$ ${periodData.interest_expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    });

    // Entry 3: Amortization of right-of-use asset
    entries.push({
      entry_id: `LEAS-MON-${period.toString().padStart(3, '0')}-003-${this.contractData.contract_id}`,
      date: paymentDate,
      period: period,
      entry_type: 'monthly',
      entry_category: 'amortizacao',
      debit_account: 'Despesa de Amortização - Arrendamento',
      debit_account_code: '3.1.2.01',
      credit_account: 'Ativo de Direito de Uso - Arrendamento',
      credit_account_code: '2.1.1.01',
      debit_amount: periodData.amortization,
      credit_amount: periodData.amortization,
      total_amount: periodData.amortization,
      description: `Amortização do ativo - Período ${period}`,
      detailed_history: `Amortização mensal do ativo de direito de uso no período ${period}. Método: linear. Valor inicial do ativo: R$ ${this.calculationResult.right_of_use_asset_initial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Contrato: ${contractRef}`,
      contract_reference: contractRef,
      document_number: `LEAS-MON-${period.toString().padStart(3, '0')}-003`,
      cost_center: 'ADMINISTRATIVO',
      department: 'CONTABILIDADE',
      project_code: 'IFRS16',
      created_by: 'SISTEMA_CONTABILEASE',
      created_at: currentDate,
      approved_by: 'CONTADOR_RESPONSAVEL',
      approved_at: currentDate,
      is_validated: true,
      validation_notes: `Amortização linear: R$ ${periodData.amortization.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por período`,
    });

    return entries;
  }

  /**
   * Generate final accounting entries
   */
  private generateFinalEntries(): AccountingEntry[] {
    const entries: AccountingEntry[] = [];
    const endDate = this.contractData.lease_end_date;
    const contractRef = `${this.contractData.contract_number || 'N/A'} - ${this.contractData.title}`;
    const currentDate = new Date().toISOString();

    // Check if there's a guaranteed residual value
    if (this.contractData.guaranteed_residual_value && this.contractData.guaranteed_residual_value > 0) {
      entries.push({
        entry_id: `LEAS-FIN-001-${this.contractData.contract_id}`,
        date: endDate,
        period: this.contractData.lease_term_months + 1,
        entry_type: 'final',
        entry_category: 'finalizacao',
        debit_account: 'Passivo de Arrendamento',
        debit_account_code: '2.2.1.01',
        credit_account: 'Caixa/Bancos',
        credit_account_code: '1.1.1.01',
        debit_amount: this.contractData.guaranteed_residual_value,
        credit_amount: this.contractData.guaranteed_residual_value,
        total_amount: this.contractData.guaranteed_residual_value,
        description: 'Pagamento do valor residual garantido',
        detailed_history: `Pagamento do valor residual garantido na finalização do contrato de arrendamento. Valor garantido: R$ ${this.contractData.guaranteed_residual_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Contrato: ${contractRef}`,
        contract_reference: contractRef,
        document_number: `LEAS-FIN-001`,
        cost_center: 'ADMINISTRATIVO',
        department: 'CONTABILIDADE',
        project_code: 'IFRS16',
        created_by: 'SISTEMA_CONTABILEASE',
        created_at: currentDate,
        approved_by: 'CONTADOR_RESPONSAVEL',
        approved_at: currentDate,
        is_validated: true,
        validation_notes: 'Pagamento do valor residual conforme cláusula contratual',
      });
    }

    return entries;
  }

  /**
   * Generate detailed amortization schedule
   */
  private generateAmortizationSchedule() {
    return this.calculationResult.amortization_schedule.map(period => ({
      period: period.period,
      date: this.calculatePaymentDate(period.period),
      beginning_liability: period.beginning_liability,
      payment: period.monthly_payment,
      interest_expense: period.interest_expense,
      principal_payment: period.principal_payment,
      ending_liability: period.ending_liability,
      beginning_asset: period.beginning_right_of_use_asset,
      amortization: period.amortization,
      ending_asset: period.ending_right_of_use_asset,
    }));
  }

  /**
   * Calculate payment date for a given period
   */
  private calculatePaymentDate(period: number): string {
    const startDate = new Date(this.contractData.lease_start_date);
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + period - 1);
    return paymentDate.toISOString().split('T')[0];
  }

  /**
   * Convert IFRS16CompleteData to IFRS16LeaseFormData for calculations
   */
  private convertToLeaseFormData(data: IFRS16CompleteData) {
    return {
      title: data.title,
      status: data.status,
      currency_code: data.currency_code,
      lease_start_date: data.lease_start_date,
      lease_end_date: data.lease_end_date,
      lease_term_months: data.lease_term_months,
      initial_payment: data.initial_payment || 0,
      monthly_payment: data.monthly_payment,
      payment_frequency: data.payment_frequency,
      payment_timing: data.payment_timing,
      discount_rate_annual: data.discount_rate_annual,
      asset_fair_value: data.asset_fair_value || 0,
      asset_residual_value: data.asset_residual_value || 0,
      initial_direct_costs: data.initial_direct_costs || 0,
      lease_incentives: data.lease_incentives || 0,
      guaranteed_residual_value: data.guaranteed_residual_value || 0,
    };
  }
}
