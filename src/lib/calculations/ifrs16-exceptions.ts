/**
 * IFRS 16 Exceptions Engine
 *
 * Implements exception handling per IFRS 16.5-8:
 * - Short-term leases (≤12 months)
 * - Low-value assets
 * - Simplified accounting treatment for exceptions
 */

// import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';

export interface ShortTermLeaseCriteria {
  lease_term_months: number;
  is_short_term: boolean;
  has_purchase_option: boolean;
  renewal_probability: number; // 0-100%
  meets_criteria: boolean;
}

export interface LowValueAssetCriteria {
  asset_fair_value: number;
  currency_code: string;
  low_value_threshold: number;
  is_low_value: boolean;
  asset_type: string;
  meets_criteria: boolean;
}

export interface ExceptionAnalysis {
  contract_id: string;
  exception_type: 'short_term' | 'low_value' | 'both' | 'none';
  short_term_criteria: ShortTermLeaseCriteria;
  low_value_criteria: LowValueAssetCriteria;
  accounting_treatment: 'simplified' | 'full_ifrs16';
  simplified_accounting: {
    expense_recognition: 'straight_line' | 'systematic_basis';
    disclosure_requirements: string[];
    measurement_basis: string;
  };
  justification: string;
  audit_trail: {
    analysis_date: string;
    analyzed_by: string;
    review_required: boolean;
  };
}

export interface ExceptionSummary {
  total_contracts: number;
  short_term_contracts: number;
  low_value_contracts: number;
  exception_contracts: number;
  total_exception_value: number;
  currency_code: string;
  percentage_of_total: number;
}

export class IFRS16ExceptionsEngine {
  private contractData: IFRS16CompleteData;

  // Low-value asset thresholds by currency (in local currency units)
  private static readonly LOW_VALUE_THRESHOLDS = {
    BRL: 5000, // R$ 5,000
    USD: 1000, // $1,000
    EUR: 1000, // €1,000
    GBP: 1000, // £1,000
    JPY: 100000, // ¥100,000
    CAD: 1000, // C$1,000
    AUD: 1000, // A$1,000
    CHF: 1000, // CHF 1,000
    DEFAULT: 1000, // Default threshold
  };

  constructor(contractData: IFRS16CompleteData) {
    this.contractData = contractData;
  }

  /**
   * Analyze if contract qualifies for short-term lease exception (IFRS 16.5-6)
   */
  analyzeShortTermLease(): ShortTermLeaseCriteria {
    const leaseTermMonths = this.contractData.lease_term_months || 0;
    const hasPurchaseOption = this.hasPurchaseOption();
    const renewalProbability = this.calculateRenewalProbability();

    // Short-term criteria per IFRS 16.5:
    // 1. Lease term ≤ 12 months
    // 2. No purchase option
    // 3. Low probability of renewal
    const isShortTerm = leaseTermMonths <= 12;
    const meetsCriteria = isShortTerm && !hasPurchaseOption && renewalProbability < 50;

    return {
      lease_term_months: leaseTermMonths,
      is_short_term: isShortTerm,
      has_purchase_option: hasPurchaseOption,
      renewal_probability: renewalProbability,
      meets_criteria: meetsCriteria,
    };
  }

  /**
   * Analyze if contract qualifies for low-value asset exception (IFRS 16.7-8)
   */
  analyzeLowValueAsset(): LowValueAssetCriteria {
    const assetFairValue = this.contractData.asset_fair_value || 0;
    const currencyCode = this.contractData.currency_code || 'BRL';
    const assetType = this.contractData.asset?.asset_type || 'other';

    const lowValueThreshold = this.getLowValueThreshold(currencyCode);
    const isLowValue = assetFairValue <= lowValueThreshold;

    // Additional criteria for low-value assets:
    // 1. Asset value ≤ threshold
    // 2. Asset is not a building or part of a building
    // 3. Asset is not dependent on other assets
    const meetsCriteria =
      isLowValue && !this.isBuildingAsset(assetType) && !this.isDependentAsset();

    return {
      asset_fair_value: assetFairValue,
      currency_code: currencyCode,
      low_value_threshold: lowValueThreshold,
      is_low_value: isLowValue,
      asset_type: assetType,
      meets_criteria: meetsCriteria,
    };
  }

  /**
   * Perform complete exception analysis
   */
  analyzeExceptions(): ExceptionAnalysis {
    const shortTermCriteria = this.analyzeShortTermLease();
    const lowValueCriteria = this.analyzeLowValueAsset();

    // Determine exception type
    let exceptionType: ExceptionAnalysis['exception_type'] = 'none';
    if (shortTermCriteria.meets_criteria && lowValueCriteria.meets_criteria) {
      exceptionType = 'both';
    } else if (shortTermCriteria.meets_criteria) {
      exceptionType = 'short_term';
    } else if (lowValueCriteria.meets_criteria) {
      exceptionType = 'low_value';
    }

    // Determine accounting treatment
    const accountingTreatment = exceptionType !== 'none' ? 'simplified' : 'full_ifrs16';

    return {
      contract_id: this.contractData.contract_id,
      exception_type: exceptionType,
      short_term_criteria: shortTermCriteria,
      low_value_criteria: lowValueCriteria,
      accounting_treatment: accountingTreatment,
      simplified_accounting: this.getSimplifiedAccountingTreatment(exceptionType),
      justification: this.generateJustification(exceptionType, shortTermCriteria, lowValueCriteria),
      audit_trail: {
        analysis_date: new Date().toISOString().split('T')[0] ?? '',
        analyzed_by: 'IFRS16_Exceptions_Engine',
        review_required: exceptionType !== 'none',
      },
    };
  }

  /**
   * Generate simplified accounting treatment details
   */
  private getSimplifiedAccountingTreatment(exceptionType: ExceptionAnalysis['exception_type']) {
    const disclosureRequirements: string[] = [];
    let expenseRecognition: 'straight_line' | 'systematic_basis' = 'straight_line';
    let measurementBasis = '';

    switch (exceptionType) {
      case 'short_term':
        expenseRecognition = 'straight_line';
        measurementBasis =
          'Pagamentos reconhecidos como despesa em base linear ao longo do prazo do contrato';
        disclosureRequirements.push(
          'Identificação de contratos de curto prazo',
          'Valor total dos pagamentos de curto prazo',
          'Política de reconhecimento de despesas'
        );
        break;

      case 'low_value':
        expenseRecognition = 'systematic_basis';
        measurementBasis =
          'Pagamentos reconhecidos como despesa em base sistemática ao longo do prazo do contrato';
        disclosureRequirements.push(
          'Identificação de ativos de baixo valor',
          'Valor total dos ativos de baixo valor',
          'Critérios utilizados para classificação'
        );
        break;

      case 'both':
        expenseRecognition = 'straight_line';
        measurementBasis =
          'Pagamentos reconhecidos como despesa em base linear (aplicam-se ambas as exceções)';
        disclosureRequirements.push(
          'Identificação de contratos de curto prazo e baixo valor',
          'Valor total dos contratos com exceções',
          'Política consolidada de reconhecimento'
        );
        break;

      default:
        measurementBasis = 'Aplicação completa do IFRS 16';
        break;
    }

    return {
      expense_recognition: expenseRecognition,
      disclosure_requirements: disclosureRequirements,
      measurement_basis: measurementBasis,
    };
  }

  /**
   * Generate justification for exception classification
   */
  private generateJustification(
    exceptionType: ExceptionAnalysis['exception_type'],
    shortTermCriteria: ShortTermLeaseCriteria,
    lowValueCriteria: LowValueAssetCriteria
  ): string {
    const justifications: string[] = [];

    if (shortTermCriteria.meets_criteria) {
      justifications.push(
        `Contrato de curto prazo: prazo de ${shortTermCriteria.lease_term_months} meses ≤ 12 meses, ` +
          `sem opção de compra e baixa probabilidade de renovação (${shortTermCriteria.renewal_probability}%)`
      );
    }

    if (lowValueCriteria.meets_criteria) {
      justifications.push(
        `Ativo de baixo valor: valor justo de ${lowValueCriteria.asset_fair_value} ${lowValueCriteria.currency_code} ` +
          `≤ threshold de ${lowValueCriteria.low_value_threshold} ${lowValueCriteria.currency_code}, ` +
          `tipo de ativo: ${lowValueCriteria.asset_type}`
      );
    }

    if (exceptionType === 'none') {
      return 'Contrato não se qualifica para exceções do IFRS 16.5-8. Aplicação completa do IFRS 16 é necessária.';
    }

    return justifications.join('; ');
  }

  // Helper methods

  private hasPurchaseOption(): boolean {
    if (!this.contractData.contract_options?.purchase_options) {
      return false;
    }

    return this.contractData.contract_options.purchase_options.some(option => option.exercisable);
  }

  private calculateRenewalProbability(): number {
    if (!this.contractData.contract_options?.renewal_options) {
      return 0;
    }

    // Calculate average probability of renewal options
    const renewalOptions = this.contractData.contract_options.renewal_options;
    const totalProbability = renewalOptions.reduce(
      (sum, option) => sum + (option.probability_percentage || 0),
      0
    );

    return renewalOptions.length > 0 ? totalProbability / renewalOptions.length : 0;
  }

  private getLowValueThreshold(currencyCode: string): number {
    return (
      IFRS16ExceptionsEngine.LOW_VALUE_THRESHOLDS[
        currencyCode as keyof typeof IFRS16ExceptionsEngine.LOW_VALUE_THRESHOLDS
      ] || IFRS16ExceptionsEngine.LOW_VALUE_THRESHOLDS.DEFAULT
    );
  }

  private isBuildingAsset(assetType: string): boolean {
    return assetType === 'real_estate' || assetType === 'building' || assetType === 'property';
  }

  private isDependentAsset(): boolean {
    // Check if asset is dependent on other assets
    // This would typically require additional business logic
    return false;
  }

  /**
   * Static method to analyze multiple contracts for exceptions
   */
  static analyzeMultipleContracts(contracts: IFRS16CompleteData[]): ExceptionSummary {
    const totalContracts = contracts.length;
    let shortTermContracts = 0;
    let lowValueContracts = 0;
    let exceptionContracts = 0;
    let totalExceptionValue = 0;

    contracts.forEach(contract => {
      const engine = new IFRS16ExceptionsEngine(contract);
      const analysis = engine.analyzeExceptions();

      if (analysis.short_term_criteria.meets_criteria) {
        shortTermContracts++;
      }

      if (analysis.low_value_criteria.meets_criteria) {
        lowValueContracts++;
      }

      if (analysis.exception_type !== 'none') {
        exceptionContracts++;
        totalExceptionValue += contract.monthly_payment * contract.lease_term_months;
      }
    });

    const totalValue = contracts.reduce(
      (sum, contract) => sum + contract.monthly_payment * contract.lease_term_months,
      0
    );

    return {
      total_contracts: totalContracts,
      short_term_contracts: shortTermContracts,
      low_value_contracts: lowValueContracts,
      exception_contracts: exceptionContracts,
      total_exception_value: totalExceptionValue,
      currency_code: contracts[0]?.currency_code || 'BRL',
      percentage_of_total: totalValue > 0 ? (totalExceptionValue / totalValue) * 100 : 0,
    };
  }

  /**
   * Validate exception criteria for audit purposes
   */
  validateExceptionCriteria(): {
    is_valid: boolean;
    validation_errors: string[];
    recommendations: string[];
  } {
    const errors: string[] = [];
    const recommendations: string[] = [];

    const shortTermCriteria = this.analyzeShortTermLease();
    const lowValueCriteria = this.analyzeLowValueAsset();

    // Validate short-term criteria
    if (shortTermCriteria.is_short_term && shortTermCriteria.has_purchase_option) {
      errors.push('Contrato de curto prazo não pode ter opção de compra para qualificar à exceção');
      recommendations.push('Remover opção de compra ou aplicar IFRS 16 completo');
    }

    if (shortTermCriteria.is_short_term && shortTermCriteria.renewal_probability >= 50) {
      errors.push('Alta probabilidade de renovação impede aplicação da exceção de curto prazo');
      recommendations.push('Revisar probabilidade de renovação ou aplicar IFRS 16 completo');
    }

    // Validate low-value criteria
    if (lowValueCriteria.is_low_value && this.isBuildingAsset(lowValueCriteria.asset_type)) {
      errors.push('Ativos imobiliários não se qualificam para exceção de baixo valor');
      recommendations.push('Aplicar IFRS 16 completo para ativos imobiliários');
    }

    // Validate threshold reasonableness
    const threshold = this.getLowValueThreshold(lowValueCriteria.currency_code);
    if (lowValueCriteria.asset_fair_value > threshold * 2) {
      recommendations.push(
        'Valor do ativo significativamente acima do threshold - revisar classificação'
      );
    }

    return {
      is_valid: errors.length === 0,
      validation_errors: errors,
      recommendations,
    };
  }
}
