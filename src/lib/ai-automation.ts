'use client';

import { Contract } from '@/lib/contracts';
import { logger } from './logger';

// Interfaces para automação inteligente
export interface AIInsight {
  id: string;
  type: 'optimization' | 'risk' | 'compliance' | 'esg' | 'cost_saving';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  potentialSavings?: number;
  confidence: number; // 0-100
  contractId?: string;
  actionable: boolean;
  category: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  condition: (contract: Contract) => boolean;
  action: (contract: Contract) => Promise<void>;
  enabled: boolean;
  priority: number;
  category: 'compliance' | 'optimization' | 'risk' | 'esg';
}

export interface ContractAnalysis {
  contractId: string;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  optimizationOpportunities: AIInsight[];
  esgScore: number;
  costEfficiency: number;
  nextAuditDate: string;
  recommendations: string[];
}

// Regras de automação pré-definidas
export const automationRules: AutomationRule[] = [
  {
    id: 'auto-compliance-check',
    name: 'Verificação Automática de Conformidade',
    description: 'Verifica automaticamente a conformidade IFRS 16 de todos os contratos',
    condition: contract => contract.status === 'active',
    action: async contract => {
      // Simular verificação de conformidade
      await logger.info(`Verificando conformidade do contrato ${contract.id}`, {
        component: 'ai-automation',
        operation: 'auto-compliance-check',
        contractId: contract.id,
      });
    },
    enabled: true,
    priority: 1,
    category: 'compliance',
  },
  {
    id: 'expiration-alert',
    name: 'Alerta de Vencimento',
    description: 'Envia alertas automáticos para contratos próximos do vencimento',
    condition: contract => {
      if (!contract.lease_end_date) return false;
      const endDate = new Date(contract.lease_end_date);
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    },
    action: async contract => {
      await logger.info(`Enviando alerta de vencimento para contrato ${contract.id}`, {
        component: 'ai-automation',
        operation: 'expiration-alert',
        contractId: contract.id,
      });
    },
    enabled: true,
    priority: 2,
    category: 'risk',
  },
  {
    id: 'esg-assessment',
    name: 'Avaliação ESG Automática',
    description: 'Avalia automaticamente o impacto ESG dos contratos',
    condition: contract => contract.status === 'active',
    action: async contract => {
      await logger.info(`Avaliando ESG do contrato ${contract.id}`, {
        component: 'ai-automation',
        operation: 'esg-assessment',
        contractId: contract.id,
      });
    },
    enabled: true,
    priority: 3,
    category: 'esg',
  },
  {
    id: 'cost-optimization',
    name: 'Otimização de Custos',
    description: 'Identifica oportunidades de redução de custos',
    condition: contract => contract.monthly_payment && contract.monthly_payment > 10000,
    action: async contract => {
      await logger.info(`Analisando otimização de custos para contrato ${contract.id}`, {
        component: 'ai-automation',
        operation: 'cost-optimization',
        contractId: contract.id,
      });
    },
    enabled: true,
    priority: 4,
    category: 'optimization',
  },
];

// Classe principal de automação inteligente
export class AIAutomationEngine {
  private rules: AutomationRule[] = automationRules;
  private insights: AIInsight[] = [];

  constructor() {
    this.loadRules();
  }

  // Carregar regras de automação
  private loadRules() {
    // Em produção, isso viria de uma API ou banco de dados
    this.rules = automationRules.filter(rule => rule.enabled);
  }

  // Analisar contrato com IA
  async analyzeContract(contract: Contract): Promise<ContractAnalysis> {
    const analysis: ContractAnalysis = {
      contractId: contract.id,
      complianceScore: this.calculateComplianceScore(contract),
      riskLevel: this.assessRiskLevel(contract),
      optimizationOpportunities: [],
      esgScore: this.calculateESGScore(contract),
      costEfficiency: this.calculateCostEfficiency(contract),
      nextAuditDate: this.calculateNextAuditDate(contract),
      recommendations: [],
    };

    // Gerar insights de otimização
    analysis.optimizationOpportunities = await this.generateOptimizationInsights(contract);

    // Gerar recomendações
    analysis.recommendations = this.generateRecommendations(contract, analysis);

    return analysis;
  }

  // Calcular score de conformidade
  private calculateComplianceScore(contract: Contract): number {
    let score = 100;

    // Penalizar por campos obrigatórios ausentes
    if (!contract.lease_start_date) score -= 20;
    if (!contract.lease_end_date) score -= 20;
    if (!contract.monthly_payment) score -= 15;
    if (!contract.discount_rate_annual) score -= 15;
    if (!contract.lease_classification) score -= 10;
    if (!contract.lessor_name) score -= 10;
    if (!contract.lessee_name) score -= 10;

    return Math.max(0, score);
  }

  // Avaliar nível de risco
  private assessRiskLevel(contract: Contract): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Risco por valor alto
    if (contract.monthly_payment && contract.monthly_payment > 50000) riskScore += 30;
    else if (contract.monthly_payment && contract.monthly_payment > 20000) riskScore += 15;

    // Risco por prazo longo
    if (contract.contract_term_months && contract.contract_term_months > 60) riskScore += 20;
    else if (contract.contract_term_months && contract.contract_term_months > 36) riskScore += 10;

    // Risco por falta de dados
    if (!contract.lease_classification) riskScore += 25;
    if (!contract.discount_rate_annual) riskScore += 20;

    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  // Calcular score ESG
  private calculateESGScore(contract: Contract): number {
    let score = 50; // Score base

    // Bonificação por contratos verdes (simulado)
    if (
      contract.title?.toLowerCase().includes('verde') ||
      contract.title?.toLowerCase().includes('sustentável')
    ) {
      score += 30;
    }

    // Bonificação por eficiência energética
    if (
      contract.description?.toLowerCase().includes('energia') ||
      contract.description?.toLowerCase().includes('eficiente')
    ) {
      score += 20;
    }

    return Math.min(100, score);
  }

  // Calcular eficiência de custos
  private calculateCostEfficiency(contract: Contract): number {
    if (!contract.monthly_payment || !contract.contract_term_months) return 0;

    const totalCost = contract.monthly_payment * contract.contract_term_months;
    const contractValue = contract.contract_value || totalCost;

    // Eficiência baseada na relação custo/valor
    return Math.round((contractValue / totalCost) * 100);
  }

  // Calcular próxima data de auditoria
  private calculateNextAuditDate(contract: Contract): string {
    const now = new Date();
    const nextAudit = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 dias
    return nextAudit.toISOString().split('T')[0];
  }

  // Gerar insights de otimização
  private async generateOptimizationInsights(contract: Contract): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Insight de otimização de taxa de desconto
    if (contract.discount_rate_annual && contract.discount_rate_annual > 0.08) {
      insights.push({
        id: `discount-rate-${contract.id}`,
        type: 'optimization',
        severity: 'medium',
        title: 'Taxa de Desconto Elevada',
        description: 'A taxa de desconto atual pode estar inflacionando o valor presente',
        recommendation:
          'Considere negociar uma taxa mais baixa ou revisar os parâmetros de cálculo',
        potentialSavings: contract.monthly_payment ? contract.monthly_payment * 0.05 : 0,
        confidence: 85,
        contractId: contract.id,
        actionable: true,
        category: 'Financeiro',
      });
    }

    // Insight de ESG
    if (this.calculateESGScore(contract) < 70) {
      insights.push({
        id: `esg-${contract.id}`,
        type: 'esg',
        severity: 'low',
        title: 'Oportunidade ESG',
        description: 'Este contrato pode se beneficiar de práticas mais sustentáveis',
        recommendation: 'Considere incluir cláusulas de sustentabilidade na renovação',
        confidence: 75,
        contractId: contract.id,
        actionable: true,
        category: 'Sustentabilidade',
      });
    }

    // Insight de risco
    if (this.assessRiskLevel(contract) === 'high') {
      insights.push({
        id: `risk-${contract.id}`,
        type: 'risk',
        severity: 'high',
        title: 'Alto Risco Identificado',
        description: 'Este contrato apresenta fatores de risco elevados',
        recommendation: 'Revisar termos contratuais e considerar mitigação de riscos',
        confidence: 90,
        contractId: contract.id,
        actionable: true,
        category: 'Risco',
      });
    }

    return insights;
  }

  // Gerar recomendações
  private generateRecommendations(contract: Contract, analysis: ContractAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.complianceScore < 80) {
      recommendations.push('Complete os campos obrigatórios para melhorar a conformidade');
    }

    if (analysis.riskLevel === 'high') {
      recommendations.push('Considere revisar os termos contratuais para reduzir riscos');
    }

    if (analysis.esgScore < 60) {
      recommendations.push('Explore opções de contratos mais sustentáveis');
    }

    if (analysis.costEfficiency < 70) {
      recommendations.push('Avalie oportunidades de otimização de custos');
    }

    return recommendations;
  }

  // Executar regras de automação
  async executeAutomationRules(contracts: Contract[]): Promise<void> {
    for (const contract of contracts) {
      for (const rule of this.rules) {
        if (rule.condition(contract)) {
          try {
            await rule.action(contract);
            await logger.info(`Regra ${rule.name} executada para contrato ${contract.id}`, {
              component: 'ai-automation',
              operation: 'executeAutomationRules',
              contractId: contract.id,
              ruleName: rule.name,
            });
          } catch (error) {
            await logger.error(
              `Erro ao executar regra ${rule.name}`,
              {
                component: 'ai-automation',
                operation: 'executeAutomationRules',
                contractId: contract.id,
                ruleName: rule.name,
              },
              error as Error
            );
          }
        }
      }
    }
  }

  // Detectar anomalias
  async detectAnomalies(contracts: Contract[]): Promise<AIInsight[]> {
    const anomalies: AIInsight[] = [];

    // Detectar contratos com valores muito altos
    const highValueContracts = contracts.filter(
      c => c.monthly_payment && c.monthly_payment > 100000
    );

    if (highValueContracts.length > 0) {
      anomalies.push({
        id: 'high-value-anomaly',
        type: 'risk',
        severity: 'medium',
        title: 'Contratos de Alto Valor Detectados',
        description: `${highValueContracts.length} contratos com pagamentos mensais superiores a R$ 100.000`,
        recommendation: 'Revisar se estes valores estão corretos e documentados adequadamente',
        confidence: 95,
        actionable: true,
        category: 'Anomalia',
      });
    }

    // Detectar contratos sem classificação
    const unclassifiedContracts = contracts.filter(c => !c.lease_classification);

    if (unclassifiedContracts.length > 0) {
      anomalies.push({
        id: 'unclassified-anomaly',
        type: 'compliance',
        severity: 'high',
        title: 'Contratos Não Classificados',
        description: `${unclassifiedContracts.length} contratos sem classificação IFRS 16`,
        recommendation: 'Classificar todos os contratos como operacional ou financeiro',
        confidence: 100,
        actionable: true,
        category: 'Conformidade',
      });
    }

    return anomalies;
  }

  // Obter insights gerais
  getInsights(): AIInsight[] {
    return this.insights;
  }

  // Adicionar insight personalizado
  addInsight(insight: AIInsight): void {
    this.insights.push(insight);
  }

  // Limpar insights antigos
  clearInsights(): void {
    this.insights = [];
  }
}

// Instância global do engine de automação
export const aiAutomationEngine = new AIAutomationEngine();

// Hook para usar automação IA
export function useAIAutomation() {
  const engine = aiAutomationEngine;

  const analyzeContract = async (contract: Contract) => {
    return await engine.analyzeContract(contract);
  };

  const executeRules = async (contracts: Contract[]) => {
    await engine.executeAutomationRules(contracts);
  };

  const detectAnomalies = async (contracts: Contract[]) => {
    return await engine.detectAnomalies(contracts);
  };

  const getInsights = () => {
    return engine.getInsights();
  };

  return {
    analyzeContract,
    executeRules,
    detectAnomalies,
    getInsights,
    engine,
  };
}
