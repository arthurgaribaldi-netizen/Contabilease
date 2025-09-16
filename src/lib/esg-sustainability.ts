'use client';

import { Contract } from '@/lib/contracts';

// Interfaces para ESG e Sustentabilidade
export interface ESGScore {
  environmental: number; // 0-100
  social: number; // 0-100
  governance: number; // 0-100
  overall: number; // 0-100
}

export interface CarbonFootprint {
  totalEmissions: number; // toneladas CO2
  scope1: number; // Emissões diretas
  scope2: number; // Emissões indiretas (energia)
  scope3: number; // Outras emissões indiretas
  intensity: number; // kg CO2 por R$ 1000 de receita
}

export interface SustainabilityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  category: 'environmental' | 'social' | 'governance';
  description: string;
}

export interface GreenLeasingData {
  energyEfficiency: boolean;
  renewableEnergy: boolean;
  waterConservation: boolean;
  wasteReduction: boolean;
  sustainableMaterials: boolean;
  greenCertification: string[];
  carbonNeutral: boolean;
  sustainabilityScore: number;
}

export interface ESGReport {
  contractId: string;
  period: string;
  esgScore: ESGScore;
  carbonFootprint: CarbonFootprint;
  sustainabilityMetrics: SustainabilityMetric[];
  greenLeasingData: GreenLeasingData;
  complianceStatus: 'compliant' | 'partial' | 'non_compliant';
  recommendations: string[];
  nextReviewDate: string;
}

// Classe principal de ESG e Sustentabilidade
export class ESGSustainabilityEngine {
  private metrics: SustainabilityMetric[] = [];
  private reports: ESGReport[] = [];

  constructor() {
    this.initializeDefaultMetrics();
  }

  // Inicializar métricas padrão
  private initializeDefaultMetrics(): void {
    this.metrics = [
      {
        id: 'energy-consumption',
        name: 'Consumo de Energia',
        value: 0,
        unit: 'kWh/m²',
        target: 50,
        trend: 'down',
        category: 'environmental',
        description: 'Consumo de energia por metro quadrado',
      },
      {
        id: 'water-usage',
        name: 'Uso de Água',
        value: 0,
        unit: 'L/m²',
        target: 100,
        trend: 'down',
        category: 'environmental',
        description: 'Consumo de água por metro quadrado',
      },
      {
        id: 'waste-generation',
        name: 'Geração de Resíduos',
        value: 0,
        unit: 'kg/m²',
        target: 5,
        trend: 'down',
        category: 'environmental',
        description: 'Resíduos gerados por metro quadrado',
      },
      {
        id: 'employee-satisfaction',
        name: 'Satisfação dos Funcionários',
        value: 0,
        unit: '%',
        target: 85,
        trend: 'up',
        category: 'social',
        description: 'Nível de satisfação dos funcionários',
      },
      {
        id: 'diversity-index',
        name: 'Índice de Diversidade',
        value: 0,
        unit: '%',
        target: 40,
        trend: 'up',
        category: 'social',
        description: 'Diversidade na força de trabalho',
      },
      {
        id: 'governance-score',
        name: 'Score de Governança',
        value: 0,
        unit: '%',
        target: 90,
        trend: 'up',
        category: 'governance',
        description: 'Conformidade com práticas de governança',
      },
    ];
  }

  // Calcular score ESG para um contrato
  calculateESGScore(contract: Contract): ESGScore {
    const environmental = this.calculateEnvironmentalScore(contract);
    const social = this.calculateSocialScore(contract);
    const governance = this.calculateGovernanceScore(contract);

    const overall = Math.round((environmental + social + governance) / 3);

    return {
      environmental,
      social,
      governance,
      overall,
    };
  }

  // Calcular score ambiental
  private calculateEnvironmentalScore(contract: Contract): number {
    let score = 50; // Score base

    // Bonificação por características verdes
    if (this.isGreenContract(contract)) {
      score += 30;
    }

    // Bonificação por eficiência energética
    if (this.hasEnergyEfficiency(contract)) {
      score += 20;
    }

    // Bonificação por materiais sustentáveis
    if (this.hasSustainableMaterials(contract)) {
      score += 15;
    }

    // Bonificação por certificações verdes
    if (this.hasGreenCertification(contract)) {
      score += 10;
    }

    return Math.min(100, score);
  }

  // Calcular score social
  private calculateSocialScore(contract: Contract): number {
    let score = 60; // Score base mais alto para social

    // Bonificação por práticas sociais
    if (this.hasSocialPractices(contract)) {
      score += 25;
    }

    // Bonificação por diversidade
    if (this.hasDiversityPractices(contract)) {
      score += 15;
    }

    return Math.min(100, score);
  }

  // Calcular score de governança
  private calculateGovernanceScore(contract: Contract): number {
    let score = 70; // Score base alto para governança

    // Bonificação por transparência
    if (this.hasTransparencyPractices(contract)) {
      score += 20;
    }

    // Bonificação por conformidade
    if (this.hasCompliancePractices(contract)) {
      score += 10;
    }

    return Math.min(100, score);
  }

  // Verificar se é contrato verde
  private isGreenContract(contract: Contract): boolean {
    const greenKeywords = [
      'verde',
      'sustentável',
      'eco',
      'green',
      'sustainable',
      'eficiente',
      'efficient',
      'energia',
      'energy',
      'renovável',
      'renewable',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return greenKeywords.some(keyword => text.includes(keyword));
  }

  // Verificar eficiência energética
  private hasEnergyEfficiency(contract: Contract): boolean {
    const efficiencyKeywords = [
      'led',
      'energia solar',
      'solar',
      'eólica',
      'wind',
      'eficiente',
      'efficient',
      'baixo consumo',
      'low consumption',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return efficiencyKeywords.some(keyword => text.includes(keyword));
  }

  // Verificar materiais sustentáveis
  private hasSustainableMaterials(contract: Contract): boolean {
    const sustainableKeywords = [
      'reciclado',
      'recycled',
      'bambu',
      'bamboo',
      'madeira certificada',
      'certified wood',
      'materiais naturais',
      'natural materials',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return sustainableKeywords.some(keyword => text.includes(keyword));
  }

  // Verificar certificações verdes
  private hasGreenCertification(contract: Contract): boolean {
    const certifications = [
      'leed',
      'breeam',
      'green building',
      'edifício verde',
      'certificação verde',
      'green certification',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return certifications.some(cert => text.includes(cert));
  }

  // Verificar práticas sociais
  private hasSocialPractices(contract: Contract): boolean {
    const socialKeywords = [
      'inclusão',
      'inclusion',
      'diversidade',
      'diversity',
      'responsabilidade social',
      'social responsibility',
      'comunidade',
      'community',
      'local',
      'local',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return socialKeywords.some(keyword => text.includes(keyword));
  }

  // Verificar práticas de diversidade
  private hasDiversityPractices(contract: Contract): boolean {
    const diversityKeywords = [
      'diversidade',
      'diversity',
      'inclusão',
      'inclusion',
      'igualdade',
      'equality',
      'equidade',
      'equity',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return diversityKeywords.some(keyword => text.includes(keyword));
  }

  // Verificar práticas de transparência
  private hasTransparencyPractices(contract: Contract): boolean {
    // Todos os contratos têm algum nível de transparência por estarem no sistema
    return contract.status === 'active' && !!contract.lease_classification;
  }

  // Verificar práticas de conformidade
  private hasCompliancePractices(contract: Contract): boolean {
    return (
      !!contract.lease_classification &&
      !!contract.discount_rate_annual &&
      !!contract.lease_start_date
    );
  }

  // Calcular pegada de carbono
  calculateCarbonFootprint(contract: Contract): CarbonFootprint {
    // Valores simulados baseados no tipo e valor do contrato
    const baseEmissions = contract.monthly_payment ? contract.monthly_payment * 0.001 : 0;

    const scope1 = baseEmissions * 0.1; // Emissões diretas
    const scope2 = baseEmissions * 0.3; // Emissões de energia
    const scope3 = baseEmissions * 0.6; // Outras emissões indiretas

    const totalEmissions = scope1 + scope2 + scope3;
    const intensity = contract.monthly_payment
      ? (totalEmissions * 1000) / contract.monthly_payment
      : 0;

    return {
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      scope1: Math.round(scope1 * 100) / 100,
      scope2: Math.round(scope2 * 100) / 100,
      scope3: Math.round(scope3 * 100) / 100,
      intensity: Math.round(intensity * 100) / 100,
    };
  }

  // Obter dados de leasing verde
  getGreenLeasingData(contract: Contract): GreenLeasingData {
    return {
      energyEfficiency: this.hasEnergyEfficiency(contract),
      renewableEnergy: this.isGreenContract(contract),
      waterConservation: this.hasWaterConservation(contract),
      wasteReduction: this.hasWasteReduction(contract),
      sustainableMaterials: this.hasSustainableMaterials(contract),
      greenCertification: this.getGreenCertifications(contract),
      carbonNeutral: this.isCarbonNeutral(contract),
      sustainabilityScore: this.calculateESGScore(contract).environmental,
    };
  }

  // Verificar conservação de água
  private hasWaterConservation(contract: Contract): boolean {
    const waterKeywords = [
      'água',
      'water',
      'conservação',
      'conservation',
      'reutilização',
      'reuse',
      'captação',
      'capture',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return waterKeywords.some(keyword => text.includes(keyword));
  }

  // Verificar redução de resíduos
  private hasWasteReduction(contract: Contract): boolean {
    const wasteKeywords = [
      'resíduos',
      'waste',
      'reciclagem',
      'recycling',
      'redução',
      'reduction',
      'zero waste',
      'lixo zero',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return wasteKeywords.some(keyword => text.includes(keyword));
  }

  // Obter certificações verdes
  private getGreenCertifications(contract: Contract): string[] {
    const certifications: string[] = [];
    const text = `${contract.title} ${contract.description}`.toLowerCase();

    if (text.includes('leed')) certifications.push('LEED');
    if (text.includes('breeam')) certifications.push('BREEAM');
    if (text.includes('green building')) certifications.push('Green Building');
    if (text.includes('edifício verde')) certifications.push('Edifício Verde');

    return certifications;
  }

  // Verificar se é carbono neutro
  private isCarbonNeutral(contract: Contract): boolean {
    const carbonKeywords = [
      'carbono neutro',
      'carbon neutral',
      'neutro',
      'neutral',
      'compensação',
      'offset',
      'sequestro',
      'sequestration',
    ];

    const text = `${contract.title} ${contract.description}`.toLowerCase();
    return carbonKeywords.some(keyword => text.includes(keyword));
  }

  // Gerar relatório ESG completo
  generateESGReport(contract: Contract): ESGReport {
    const esgScore = this.calculateESGScore(contract);
    const carbonFootprint = this.calculateCarbonFootprint(contract);
    const greenLeasingData = this.getGreenLeasingData(contract);

    const sustainabilityMetrics = this.metrics.map(metric => ({
      ...metric,
      value: this.calculateMetricValue(contract, metric.id),
    }));

    const complianceStatus = this.determineComplianceStatus(esgScore);
    const recommendations = this.generateRecommendations(contract, esgScore);
    const nextReviewDate = this.calculateNextReviewDate();

    return {
      contractId: contract.id,
      period: new Date().toISOString().split('T')[0],
      esgScore,
      carbonFootprint,
      sustainabilityMetrics,
      greenLeasingData,
      complianceStatus,
      recommendations,
      nextReviewDate,
    };
  }

  // Calcular valor da métrica
  private calculateMetricValue(contract: Contract, metricId: string): number {
    // Valores simulados baseados no contrato
    switch (metricId) {
      case 'energy-consumption':
        return this.isGreenContract(contract) ? 35 : 65;
      case 'water-usage':
        return this.hasWaterConservation(contract) ? 80 : 120;
      case 'waste-generation':
        return this.hasWasteReduction(contract) ? 3 : 7;
      case 'employee-satisfaction':
        return this.hasSocialPractices(contract) ? 88 : 75;
      case 'diversity-index':
        return this.hasDiversityPractices(contract) ? 45 : 35;
      case 'governance-score':
        return this.hasCompliancePractices(contract) ? 92 : 78;
      default:
        return 50;
    }
  }

  // Determinar status de conformidade
  private determineComplianceStatus(esgScore: ESGScore): 'compliant' | 'partial' | 'non_compliant' {
    if (esgScore.overall >= 80) return 'compliant';
    if (esgScore.overall >= 60) return 'partial';
    return 'non_compliant';
  }

  // Gerar recomendações
  private generateRecommendations(contract: Contract, esgScore: ESGScore): string[] {
    const recommendations: string[] = [];

    if (esgScore.environmental < 70) {
      recommendations.push('Considere incluir cláusulas de eficiência energética');
      recommendations.push('Avalie opções de materiais sustentáveis');
    }

    if (esgScore.social < 70) {
      recommendations.push('Implemente práticas de diversidade e inclusão');
      recommendations.push('Desenvolva programas de responsabilidade social');
    }

    if (esgScore.governance < 80) {
      recommendations.push('Melhore a transparência nos relatórios');
      recommendations.push('Implemente controles de conformidade mais rigorosos');
    }

    return recommendations;
  }

  // Calcular próxima data de revisão
  private calculateNextReviewDate(): string {
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + 3); // Revisão trimestral
    return nextReview.toISOString().split('T')[0];
  }

  // Obter métricas de sustentabilidade
  getSustainabilityMetrics(): SustainabilityMetric[] {
    return this.metrics;
  }

  // Atualizar métrica
  updateMetric(metricId: string, value: number): void {
    const metric = this.metrics.find(m => m.id === metricId);
    if (metric) {
      metric.value = value;
    }
  }

  // Obter relatórios ESG
  getESGReports(): ESGReport[] {
    return this.reports;
  }

  // Adicionar relatório ESG
  addESGReport(report: ESGReport): void {
    this.reports.push(report);
  }
}

// Instância global do engine ESG
export const esgSustainabilityEngine = new ESGSustainabilityEngine();

// Hook para usar ESG e sustentabilidade
export function useESGSustainability() {
  const engine = esgSustainabilityEngine;

  const calculateESGScore = (contract: Contract) => {
    return engine.calculateESGScore(contract);
  };

  const calculateCarbonFootprint = (contract: Contract) => {
    return engine.calculateCarbonFootprint(contract);
  };

  const getGreenLeasingData = (contract: Contract) => {
    return engine.getGreenLeasingData(contract);
  };

  const generateESGReport = (contract: Contract) => {
    return engine.generateESGReport(contract);
  };

  const getSustainabilityMetrics = () => {
    return engine.getSustainabilityMetrics();
  };

  return {
    calculateESGScore,
    calculateCarbonFootprint,
    getGreenLeasingData,
    generateESGReport,
    getSustainabilityMetrics,
    engine,
  };
}
