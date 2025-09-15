/**
 * Analisador de Bundle para otimização de performance
 * Monitora tamanho de bundles e detecta oportunidades de otimização
 */

import { logger } from '@/lib/logger';

export interface BundleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  dependencies: string[];
  lastModified: Date;
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzippedSize: number;
  largestBundles: BundleInfo[];
  duplicateDependencies: string[];
  optimizationSuggestions: string[];
  performanceScore: number;
}

export interface PerformanceThresholds {
  maxBundleSize: number; // em bytes
  maxGzippedSize: number; // em bytes
  maxDependencies: number;
  warningThreshold: number; // porcentagem do limite
}

class BundleAnalyzer {
  private bundles = new Map<string, BundleInfo>();
  private thresholds: PerformanceThresholds;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      maxBundleSize: 500 * 1024, // 500KB
      maxGzippedSize: 150 * 1024, // 150KB
      maxDependencies: 50,
      warningThreshold: 0.8, // 80%
      ...thresholds,
    };
  }

  /**
   * Registra informações de um bundle
   */
  registerBundle(bundle: BundleInfo): void {
    this.bundles.set(bundle.name, bundle);
    logger.debug(`Bundle registered: ${bundle.name}`, {
      size: bundle.size,
      gzippedSize: bundle.gzippedSize,
      dependencies: bundle.dependencies.length,
    });
  }

  /**
   * Analisa todos os bundles registrados
   */
  analyze(): BundleAnalysis {
    const bundles = Array.from(this.bundles.values());
    
    if (bundles.length === 0) {
      return {
        totalSize: 0,
        totalGzippedSize: 0,
        largestBundles: [],
        duplicateDependencies: [],
        optimizationSuggestions: [],
        performanceScore: 100,
      };
    }

    // Calcula totais
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    const totalGzippedSize = bundles.reduce((sum, bundle) => sum + bundle.gzippedSize, 0);

    // Identifica maiores bundles
    const largestBundles = bundles
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    // Identifica dependências duplicadas
    const duplicateDependencies = this.findDuplicateDependencies(bundles);

    // Gera sugestões de otimização
    const optimizationSuggestions = this.generateOptimizationSuggestions(bundles);

    // Calcula score de performance
    const performanceScore = this.calculatePerformanceScore(bundles);

    const analysis: BundleAnalysis = {
      totalSize,
      totalGzippedSize,
      largestBundles,
      duplicateDependencies,
      optimizationSuggestions,
      performanceScore,
    };

    logger.info('Bundle analysis completed', analysis);
    return analysis;
  }

  /**
   * Encontra dependências duplicadas entre bundles
   */
  private findDuplicateDependencies(bundles: BundleInfo[]): string[] {
    const dependencyCount = new Map<string, number>();
    
    bundles.forEach(bundle => {
      bundle.dependencies.forEach(dep => {
        dependencyCount.set(dep, (dependencyCount.get(dep) || 0) + 1);
      });
    });

    return Array.from(dependencyCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([dep, _]) => dep);
  }

  /**
   * Gera sugestões de otimização
   */
  private generateOptimizationSuggestions(bundles: BundleInfo[]): string[] {
    const suggestions: string[] = [];

    bundles.forEach(bundle => {
      // Bundle muito grande
      if (bundle.size > this.thresholds.maxBundleSize) {
        suggestions.push(`Bundle "${bundle.name}" está muito grande (${this.formatBytes(bundle.size)}). Considere code splitting.`);
      }

      // Muitas dependências
      if (bundle.dependencies.length > this.thresholds.maxDependencies) {
        suggestions.push(`Bundle "${bundle.name}" tem muitas dependências (${bundle.dependencies.length}). Considere lazy loading.`);
      }

      // Gzip não otimizado
      const compressionRatio = bundle.gzippedSize / bundle.size;
      if (compressionRatio > 0.4) {
        suggestions.push(`Bundle "${bundle.name}" tem baixa compressão (${(compressionRatio * 100).toFixed(1)}%). Verifique minificação.`);
      }
    });

    // Dependências duplicadas
    const duplicates = this.findDuplicateDependencies(bundles);
    if (duplicates.length > 0) {
      suggestions.push(`Encontradas ${duplicates.length} dependências duplicadas. Considere otimizar imports.`);
    }

    return suggestions;
  }

  /**
   * Calcula score de performance baseado nos bundles
   */
  private calculatePerformanceScore(bundles: BundleInfo[]): number {
    let score = 100;

    bundles.forEach(bundle => {
      // Penaliza bundles grandes
      if (bundle.size > this.thresholds.maxBundleSize) {
        score -= 20;
      } else if (bundle.size > this.thresholds.maxBundleSize * this.thresholds.warningThreshold) {
        score -= 10;
      }

      // Penaliza muitos dependencies
      if (bundle.dependencies.length > this.thresholds.maxDependencies) {
        score -= 15;
      } else if (bundle.dependencies.length > this.thresholds.maxDependencies * this.thresholds.warningThreshold) {
        score -= 5;
      }

      // Penaliza baixa compressão
      const compressionRatio = bundle.gzippedSize / bundle.size;
      if (compressionRatio > 0.4) {
        score -= 10;
      }
    });

    // Penaliza dependências duplicadas
    const duplicates = this.findDuplicateDependencies(bundles);
    score -= duplicates.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Formata bytes para string legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtém informações de um bundle específico
   */
  getBundle(name: string): BundleInfo | undefined {
    return this.bundles.get(name);
  }

  /**
   * Lista todos os bundles registrados
   */
  getAllBundles(): BundleInfo[] {
    return Array.from(this.bundles.values());
  }

  /**
   * Limpa dados de bundles
   */
  clear(): void {
    this.bundles.clear();
    logger.info('Bundle analyzer cleared');
  }
}

// Instância singleton
export const bundleAnalyzer = new BundleAnalyzer();

/**
 * Registra bundle para análise
 */
export function registerBundle(bundle: BundleInfo): void {
  bundleAnalyzer.registerBundle(bundle);
}

/**
 * Executa análise completa de bundles
 */
export function analyzeBundles(): BundleAnalysis {
  return bundleAnalyzer.analyze();
}

/**
 * Obtém informações de bundle específico
 */
export function getBundleInfo(name: string): BundleInfo | undefined {
  return bundleAnalyzer.getBundle(name);
}

/**
 * Hook para análise de bundles em componentes React
 */
export function useBundleAnalysis() {
  const analysis = bundleAnalyzer.analyze();
  
  return {
    analysis,
    registerBundle: (bundle: BundleInfo) => bundleAnalyzer.registerBundle(bundle),
    getBundle: (name: string) => bundleAnalyzer.getBundle(name),
  };
}

/**
 * Middleware para monitoramento automático de bundles
 */
export function withBundleMonitoring(componentName: string) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const startTime = performance.now();
      
      const result = originalMethod.apply(this, args);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Registra métrica de performance
      if (typeof window !== 'undefined') {
        registerBundle({
          name: `${componentName}.${propertyKey}`,
          size: 0, // Será calculado pelo bundler
          gzippedSize: 0,
          dependencies: [],
          lastModified: new Date(),
        });
      }
      
      logger.debug(`Bundle monitoring: ${componentName}.${propertyKey}`, {
        duration: `${duration.toFixed(2)}ms`,
      });
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Utilitário para análise de imports dinâmicos
 */
export function analyzeDynamicImports(): Promise<BundleInfo[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve([]);
      return;
    }

    const bundles: BundleInfo[] = [];
    
    // Monitora imports dinâmicos
    const originalImport = window.__webpack_require__;
    if (originalImport) {
      // Intercepta webpack require para análise
      // Implementação específica depende da configuração do bundler
    }

    resolve(bundles);
  });
}

/**
 * Configurações de threshold para diferentes ambientes
 */
export const performanceThresholds = {
  development: {
    maxBundleSize: 2 * 1024 * 1024, // 2MB
    maxGzippedSize: 500 * 1024, // 500KB
    maxDependencies: 100,
    warningThreshold: 0.8,
  },
  
  production: {
    maxBundleSize: 500 * 1024, // 500KB
    maxGzippedSize: 150 * 1024, // 150KB
    maxDependencies: 50,
    warningThreshold: 0.8,
  },
  
  strict: {
    maxBundleSize: 250 * 1024, // 250KB
    maxGzippedSize: 75 * 1024, // 75KB
    maxDependencies: 25,
    warningThreshold: 0.7,
  },
} as const;
