/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary IFRS 16 field analysis algorithms.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

/**
 * Análise de Qualidade dos Campos IFRS 16
 *
 * Este módulo avalia se os campos do contrato possuem todas as informações
 * necessárias para conformidade com IFRS 16 e suporte a modificações contratuais.
 */

// import { IFRS16LeaseFormData } from '@/lib/schemas/ifrs16-lease';
import { IFRS16CompleteData } from '@/lib/schemas/ifrs16-complete';

export interface FieldAnalysisResult {
  field: string;
  category: 'required' | 'recommended' | 'optional';
  status: 'present' | 'missing' | 'incomplete';
  ifrs16_requirement: string;
  impact_level: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface ContractQualityReport {
  overall_score: number; // 0-100
  compliance_level: 'compliant' | 'mostly_compliant' | 'non_compliant';
  critical_issues: FieldAnalysisResult[];
  recommendations: FieldAnalysisResult[];
  missing_fields: string[];
  quality_metrics: {
    required_fields_present: number;
    total_required_fields: number;
    recommended_fields_present: number;
    total_recommended_fields: number;
  };
}

/**
 * Campos obrigatórios conforme IFRS 16
 */
const REQUIRED_FIELDS: Array<{
  field: string;
  category: string;
  ifrs16_requirement: string;
  impact_level: 'critical' | 'high' | 'medium' | 'low';
}> = [
  {
    field: 'contract_id',
    category: 'identification',
    ifrs16_requirement: 'Identificação única do contrato para rastreabilidade',
    impact_level: 'critical',
  },
  {
    field: 'parties.lessee.name',
    category: 'parties',
    ifrs16_requirement: 'Identificação do arrendatário (IFRS 16.49)',
    impact_level: 'critical',
  },
  {
    field: 'parties.lessor.name',
    category: 'parties',
    ifrs16_requirement: 'Identificação do arrendador (IFRS 16.49)',
    impact_level: 'critical',
  },
  {
    field: 'asset.asset_description',
    category: 'asset',
    ifrs16_requirement: 'Descrição do ativo arrendado (IFRS 16.49)',
    impact_level: 'critical',
  },
  {
    field: 'lease_start_date',
    category: 'terms',
    ifrs16_requirement: 'Data de início do contrato (IFRS 16.22)',
    impact_level: 'critical',
  },
  {
    field: 'lease_end_date',
    category: 'terms',
    ifrs16_requirement: 'Data de término do contrato (IFRS 16.22)',
    impact_level: 'critical',
  },
  {
    field: 'lease_term_months',
    category: 'terms',
    ifrs16_requirement: 'Prazo do contrato para cálculo do passivo (IFRS 16.26)',
    impact_level: 'critical',
  },
  {
    field: 'monthly_payment',
    category: 'financial',
    ifrs16_requirement: 'Valor dos pagamentos de arrendamento (IFRS 16.26)',
    impact_level: 'critical',
  },
  {
    field: 'discount_rate_annual',
    category: 'financial',
    ifrs16_requirement: 'Taxa de desconto para valor presente (IFRS 16.26)',
    impact_level: 'critical',
  },
  {
    field: 'currency_code',
    category: 'financial',
    ifrs16_requirement: 'Moeda dos pagamentos (IFRS 16.49)',
    impact_level: 'critical',
  },
  {
    field: 'lease_classification',
    category: 'classification',
    ifrs16_requirement: 'Classificação operacional vs financeiro (IFRS 16.61)',
    impact_level: 'critical',
  },
];

/**
 * Campos recomendados para melhor conformidade
 */
const RECOMMENDED_FIELDS: Array<{
  field: string;
  category: string;
  ifrs16_requirement: string;
  impact_level: 'critical' | 'high' | 'medium' | 'low';
}> = [
  {
    field: 'parties.lessee.tax_id',
    category: 'parties',
    ifrs16_requirement: 'Identificação fiscal para auditoria',
    impact_level: 'high',
  },
  {
    field: 'parties.lessor.tax_id',
    category: 'parties',
    ifrs16_requirement: 'Identificação fiscal para auditoria',
    impact_level: 'high',
  },
  {
    field: 'asset.asset_type',
    category: 'asset',
    ifrs16_requirement: 'Tipo de ativo para classificação adequada',
    impact_level: 'high',
  },
  {
    field: 'asset.asset_identification',
    category: 'asset',
    ifrs16_requirement: 'Identificação específica do ativo',
    impact_level: 'medium',
  },
  {
    field: 'asset.asset_location',
    category: 'asset',
    ifrs16_requirement: 'Localização do ativo para controle',
    impact_level: 'medium',
  },
  {
    field: 'asset_fair_value',
    category: 'financial',
    ifrs16_requirement: 'Valor justo para comparação com pagamentos',
    impact_level: 'high',
  },
  {
    field: 'guaranteed_residual_value',
    category: 'financial',
    ifrs16_requirement: 'Valor residual garantido (IFRS 16.26)',
    impact_level: 'high',
  },
  {
    field: 'initial_direct_costs',
    category: 'financial',
    ifrs16_requirement: 'Custos diretos iniciais (IFRS 16.26)',
    impact_level: 'high',
  },
  {
    field: 'lease_incentives',
    category: 'financial',
    ifrs16_requirement: 'Incentivos de leasing (IFRS 16.26)',
    impact_level: 'high',
  },
  {
    field: 'payment_timing',
    category: 'financial',
    ifrs16_requirement: 'Momento dos pagamentos para cálculos precisos',
    impact_level: 'medium',
  },
  {
    field: 'classification_justification',
    category: 'classification',
    ifrs16_requirement: 'Justificativa da classificação para auditoria',
    impact_level: 'medium',
  },
];

/**
 * Campos para suporte a modificações contratuais
 */
const MODIFICATION_SUPPORT_FIELDS: Array<{
  field: string;
  category: string;
  ifrs16_requirement: string;
  impact_level: 'critical' | 'high' | 'medium' | 'low';
}> = [
  {
    field: 'modifications',
    category: 'modifications',
    ifrs16_requirement: 'Histórico de modificações contratuais (IFRS 16.44)',
    impact_level: 'critical',
  },
  {
    field: 'contract_options.renewal_options',
    category: 'options',
    ifrs16_requirement: 'Opções de renovação (IFRS 16.18)',
    impact_level: 'high',
  },
  {
    field: 'contract_options.purchase_options',
    category: 'options',
    ifrs16_requirement: 'Opções de compra (IFRS 16.18)',
    impact_level: 'high',
  },
  {
    field: 'contract_options.early_termination_options',
    category: 'options',
    ifrs16_requirement: 'Opções de rescisão antecipada (IFRS 16.18)',
    impact_level: 'medium',
  },
  {
    field: 'variable_payments',
    category: 'financial',
    ifrs16_requirement: 'Pagamentos variáveis (IFRS 16.27)',
    impact_level: 'high',
  },
  {
    field: 'escalation_rate',
    category: 'financial',
    ifrs16_requirement: 'Taxa de reajuste para pagamentos indexados',
    impact_level: 'medium',
  },
  {
    field: 'audit_trail',
    category: 'compliance',
    ifrs16_requirement: 'Rastro de auditoria para conformidade',
    impact_level: 'high',
  },
];

/**
 * Analisa a qualidade dos campos de um contrato
 */
export function analyzeContractQuality(
  contractData: Partial<IFRS16CompleteData>
): ContractQualityReport {
  const analysis: FieldAnalysisResult[] = [];
  const missingFields: string[] = [];

  // Analisar campos obrigatórios
  REQUIRED_FIELDS.forEach(fieldDef => {
    const isPresent = checkFieldPresence(contractData, fieldDef.field);
    const status = isPresent ? 'present' : 'missing';

    if (!isPresent) {
      missingFields.push(fieldDef.field);
    }

    analysis.push({
      field: fieldDef.field,
      category: 'required',
      status,
      ifrs16_requirement: fieldDef.ifrs16_requirement,
      impact_level: fieldDef.impact_level,
      recommendation: getRecommendation(fieldDef.field, status),
    });
  });

  // Analisar campos recomendados
  RECOMMENDED_FIELDS.forEach(fieldDef => {
    const isPresent = checkFieldPresence(contractData, fieldDef.field);
    const status = isPresent ? 'present' : 'missing';

    if (!isPresent) {
      missingFields.push(fieldDef.field);
    }

    analysis.push({
      field: fieldDef.field,
      category: 'recommended',
      status,
      ifrs16_requirement: fieldDef.ifrs16_requirement,
      impact_level: fieldDef.impact_level,
      recommendation: getRecommendation(fieldDef.field, status),
    });
  });

  // Analisar campos de modificação
  MODIFICATION_SUPPORT_FIELDS.forEach(fieldDef => {
    const isPresent = checkFieldPresence(contractData, fieldDef.field);
    const status = isPresent ? 'present' : 'missing';

    if (!isPresent) {
      missingFields.push(fieldDef.field);
    }

    analysis.push({
      field: fieldDef.field,
      category: 'optional',
      status,
      ifrs16_requirement: fieldDef.ifrs16_requirement,
      impact_level: fieldDef.impact_level,
      recommendation: getRecommendation(fieldDef.field, status),
    });
  });

  // Calcular métricas
  const requiredPresent = analysis.filter(
    a => a.category === 'required' && a.status === 'present'
  ).length;
  const totalRequired = REQUIRED_FIELDS.length;
  const recommendedPresent = analysis.filter(
    a => a.category === 'recommended' && a.status === 'present'
  ).length;
  const totalRecommended = RECOMMENDED_FIELDS.length;

  // Calcular score geral (peso maior para campos obrigatórios)
  const requiredScore = (requiredPresent / totalRequired) * 60; // 60% do score
  const recommendedScore = (recommendedPresent / totalRecommended) * 30; // 30% do score
  const modificationScore =
    analysis.filter(a => a.category === 'optional' && a.status === 'present').length > 0 ? 10 : 0; // 10% do score

  const overallScore = Math.round(requiredScore + recommendedScore + modificationScore);

  // Determinar nível de conformidade
  let complianceLevel: 'compliant' | 'mostly_compliant' | 'non_compliant';
  if (overallScore >= 90) {
    complianceLevel = 'compliant';
  } else if (overallScore >= 70) {
    complianceLevel = 'mostly_compliant';
  } else {
    complianceLevel = 'non_compliant';
  }

  return {
    overall_score: overallScore,
    compliance_level: complianceLevel,
    critical_issues: analysis.filter(a => a.impact_level === 'critical' && a.status === 'missing'),
    recommendations: analysis.filter(a => a.status === 'missing'),
    missing_fields: missingFields,
    quality_metrics: {
      required_fields_present: requiredPresent,
      total_required_fields: totalRequired,
      recommended_fields_present: recommendedPresent,
      total_recommended_fields: totalRecommended,
    },
  };
}

/**
 * Verifica se um campo está presente nos dados do contrato
 */
function checkFieldPresence(data: any, fieldPath: string): boolean {
  const parts = fieldPath.split('.');
  let current = data;

  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  // Verificar se o valor não é vazio
  if (typeof current === 'string') {
    return current.trim().length > 0;
  }

  return current !== null && current !== undefined;
}

/**
 * Gera recomendação para um campo
 */
function getRecommendation(field: string, status: string): string {
  if (status === 'present') {
    return 'Campo preenchido corretamente';
  }

  const recommendations: Record<string, string> = {
    contract_id: 'Adicione um identificador único para o contrato',
    'parties.lessee.name': 'Informe o nome completo do arrendatário',
    'parties.lessor.name': 'Informe o nome completo do arrendador',
    'asset.asset_description': 'Descreva detalhadamente o ativo arrendado',
    lease_start_date: 'Defina a data de início do contrato',
    lease_end_date: 'Defina a data de término do contrato',
    lease_term_months: 'Informe o prazo do contrato em meses',
    monthly_payment: 'Defina o valor do pagamento mensal',
    discount_rate_annual: 'Informe a taxa de desconto anual',
    currency_code: 'Selecione a moeda dos pagamentos',
    lease_classification: 'Classifique o contrato como operacional ou financeiro',
    modifications: 'Implemente sistema de rastreamento de modificações',
    'contract_options.renewal_options': 'Registre opções de renovação se aplicável',
    'contract_options.purchase_options': 'Registre opções de compra se aplicável',
    variable_payments: 'Registre pagamentos variáveis se aplicável',
    audit_trail: 'Implemente rastro de auditoria para conformidade',
  };

  return recommendations[field] || 'Este campo é recomendado para melhor conformidade com IFRS 16';
}

/**
 * Valida se um contrato pode sofrer modificações
 */
export function validateModificationCapability(contractData: Partial<IFRS16CompleteData>): {
  can_modify: boolean;
  modification_types: string[];
  restrictions: string[];
} {
  const modificationTypes: string[] = [];
  const restrictions: string[] = [];

  // Verificar se tem dados básicos para modificação
  const hasBasicData =
    contractData.lease_start_date &&
    contractData.lease_end_date &&
    contractData.monthly_payment &&
    contractData.discount_rate_annual;

  if (!hasBasicData) {
    restrictions.push('Dados básicos do contrato incompletos');
    return { can_modify: false, modification_types: [], restrictions };
  }

  // Verificar status do contrato
  if (contractData.status === 'completed' || contractData.status === 'cancelled') {
    restrictions.push('Contrato já finalizado ou cancelado');
    return { can_modify: false, modification_types: [], restrictions };
  }

  // Determinar tipos de modificação possíveis
  if (contractData.status === 'active') {
    modificationTypes.push('term_extension', 'term_reduction');
    modificationTypes.push('payment_increase', 'payment_decrease');
    modificationTypes.push('rate_change');
  }

  if (contractData.status === 'draft') {
    modificationTypes.push('term_extension', 'term_reduction');
    modificationTypes.push('payment_increase', 'payment_decrease');
    modificationTypes.push('rate_change', 'asset_change', 'classification_change');
  }

  // Verificar restrições específicas
  const currentDate = new Date();
  const endDate = contractData.lease_end_date ? new Date(contractData.lease_end_date) : null;

  if (endDate && endDate <= currentDate) {
    restrictions.push('Contrato já expirado');
    return { can_modify: false, modification_types: [], restrictions };
  }

  return {
    can_modify: modificationTypes.length > 0 && restrictions.length === 0,
    modification_types: modificationTypes,
    restrictions,
  };
}

/**
 * Gera relatório de conformidade IFRS 16
 */
export function generateComplianceReport(contractData: Partial<IFRS16CompleteData>): {
  ifrs16_compliance: boolean;
  missing_requirements: string[];
  recommendations: string[];
  audit_readiness: 'ready' | 'partial' | 'not_ready';
} {
  const qualityReport = analyzeContractQuality(contractData);
  const modificationCapability = validateModificationCapability(contractData);

  const missingRequirements: string[] = [];
  const recommendations: string[] = [];

  // Verificar requisitos críticos
  if (qualityReport.critical_issues.length > 0) {
    missingRequirements.push('Campos obrigatórios ausentes');
    qualityReport.critical_issues.forEach(issue => {
      missingRequirements.push(`${issue.field}: ${issue.ifrs16_requirement}`);
    });
  }

  // Verificar capacidade de modificação
  if (!modificationCapability.can_modify) {
    missingRequirements.push('Suporte a modificações contratuais não implementado');
    modificationCapability.restrictions.forEach(restriction => {
      missingRequirements.push(restriction);
    });
  }

  // Verificar se campos de modificação estão ausentes
  const hasModificationFields =
    checkFieldPresence(contractData, 'modifications') ||
    checkFieldPresence(contractData, 'contract_options');

  if (!hasModificationFields) {
    missingRequirements.push('Implemente sistema de modificações contratuais');
  }

  // Gerar recomendações
  if (qualityReport.overall_score < 90) {
    recommendations.push('Melhore a completude dos dados do contrato');
  }

  if (qualityReport.missing_fields.length > 0) {
    recommendations.push('Preencha os campos recomendados para melhor conformidade');
  }

  if (!modificationCapability.can_modify) {
    recommendations.push('Implemente sistema de modificações contratuais');
  }

  if (!hasModificationFields) {
    recommendations.push('Implemente sistema de modificações contratuais');
  }

  // Determinar prontidão para auditoria
  let auditReadiness: 'ready' | 'partial' | 'not_ready';
  if (
    qualityReport.compliance_level === 'compliant' &&
    modificationCapability.can_modify &&
    hasModificationFields
  ) {
    auditReadiness = 'ready';
  } else if (
    qualityReport.compliance_level === 'compliant' ||
    qualityReport.compliance_level === 'mostly_compliant'
  ) {
    auditReadiness = 'partial';
  } else {
    auditReadiness = 'not_ready';
  }

  return {
    ifrs16_compliance: qualityReport.compliance_level === 'compliant',
    missing_requirements: missingRequirements,
    recommendations,
    audit_readiness: auditReadiness,
  };
}
