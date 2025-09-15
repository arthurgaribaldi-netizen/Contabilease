import { IFRS16CalculationResult } from '@/lib/calculations/ifrs16-basic';
import { Contract } from '@/lib/contracts';

/**
 * Cache de Cálculos IFRS 16
 * 
 * Sistema de cache inteligente para otimizar performance dos cálculos IFRS 16,
 * evitando recálculos desnecessários e melhorando a experiência do usuário.
 */

export interface CacheKey {
  contractId: string;
  dataHash: string; // Hash dos dados do contrato para detectar mudanças
}

export interface CacheEntry {
  result: IFRS16CalculationResult;
  timestamp: number;
  expiresAt: number;
  dataHash: string;
  contractId: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  cacheSize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

/**
 * Gerador de hash para dados do contrato
 */
export function generateDataHash(contract: Contract): string {
  const relevantFields = {
    contract_value: contract.contract_value,
    contract_term_months: contract.contract_term_months,
    implicit_interest_rate: contract.implicit_interest_rate,
    guaranteed_residual_value: contract.guaranteed_residual_value,
    purchase_option_price: contract.purchase_option_price,
    lease_start_date: contract.lease_start_date,
    lease_end_date: contract.lease_end_date,
    payment_frequency: contract.payment_frequency,
    updated_at: contract.updated_at,
  };

  // Criar string consistente dos campos relevantes
  const dataString = JSON.stringify(relevantFields, Object.keys(relevantFields).sort());
  
  // Hash simples (em produção, usar crypto.createHash)
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Classe principal do cache IFRS 16
 */
export class IFRS16Cache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    cacheSize: 0,
    oldestEntry: null,
    newestEntry: null,
  };

  // Configurações do cache
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 100; // Máximo de 100 entradas
  private readonly CLEANUP_INTERVAL = 60 * 1000; // Limpeza a cada 1 minuto

  constructor() {
    // Iniciar limpeza automática do cache
    this.startCleanupInterval();
  }

  /**
   * Gera chave do cache baseada no contrato
   */
  private generateCacheKey(contractId: string, contract: Contract): string {
    const dataHash = generateDataHash(contract);
    return `${contractId}:${dataHash}`;
  }

  /**
   * Verifica se uma entrada do cache é válida
   */
  private isValidEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    return entry.expiresAt > now;
  }

  /**
   * Obtém resultado do cache se disponível
   */
  get(contractId: string, contract: Contract): IFRS16CalculationResult | null {
    this.stats.totalRequests++;
    
    const cacheKey = this.generateCacheKey(contractId, contract);
    const entry = this.cache.get(cacheKey);

    if (entry && this.isValidEntry(entry)) {
      this.stats.hits++;
      this.updateStats();
      return entry.result;
    }

    this.stats.misses++;
    this.updateStats();
    
    // Remove entrada expirada se existir
    if (entry) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Armazena resultado no cache
   */
  set(
    contractId: string, 
    contract: Contract, 
    result: IFRS16CalculationResult,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const cacheKey = this.generateCacheKey(contractId, contract);
    const now = Date.now();
    const dataHash = generateDataHash(contract);

    const entry: CacheEntry = {
      result,
      timestamp: now,
      expiresAt: now + ttl,
      dataHash,
      contractId,
    };

    // Verificar limite de tamanho do cache
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntry();
    }

    this.cache.set(cacheKey, entry);
    this.updateStats();
  }

  /**
   * Remove entrada específica do cache
   */
  delete(contractId: string, contract: Contract): boolean {
    const cacheKey = this.generateCacheKey(contractId, contract);
    const deleted = this.cache.delete(cacheKey);
    this.updateStats();
    return deleted;
  }

  /**
   * Remove todas as entradas de um contrato
   */
  deleteContract(contractId: string): number {
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.contractId === contractId) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    this.updateStats();
    return deletedCount;
  }

  /**
   * Limpa todas as entradas expiradas
   */
  cleanup(): number {
    const _now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidEntry(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    this.updateStats();
    return cleanedCount;
  }

  /**
   * Remove a entrada mais antiga quando o cache está cheio
   */
  private evictOldestEntry(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Inicia limpeza automática do cache
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Atualiza estatísticas do cache
   */
  private updateStats(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
    
    this.stats.cacheSize = this.cache.size;

    if (this.cache.size === 0) {
      this.stats.oldestEntry = null;
      this.stats.newestEntry = null;
      return;
    }

    let oldest = Date.now();
    let newest = 0;

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
      if (entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    }

    this.stats.oldestEntry = oldest;
    this.stats.newestEntry = newest;
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      cacheSize: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  /**
   * Obtém informações sobre entradas do cache
   */
  getCacheInfo(): Array<{
    key: string;
    contractId: string;
    timestamp: number;
    expiresAt: number;
    isValid: boolean;
    dataHash: string;
  }> {
    const now = Date.now();
    
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      contractId: entry.contractId,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      isValid: entry.expiresAt > now,
      dataHash: entry.dataHash,
    }));
  }
}

// Instância global do cache
export const ifrs16Cache = new IFRS16Cache();

/**
 * Hook para usar o cache em componentes React
 */
export function useIFRS16Cache() {
  return {
    get: (contractId: string, contract: Contract) => ifrs16Cache.get(contractId, contract),
    set: (contractId: string, contract: Contract, result: IFRS16CalculationResult, ttl?: number) => 
      ifrs16Cache.set(contractId, contract, result, ttl),
    delete: (contractId: string, contract: Contract) => ifrs16Cache.delete(contractId, contract),
    deleteContract: (contractId: string) => ifrs16Cache.deleteContract(contractId),
    getStats: () => ifrs16Cache.getStats(),
    clear: () => ifrs16Cache.clear(),
  };
}

/**
 * Middleware para APIs que utiliza o cache
 */
export function withIFRS16Cache<T extends Contract>(
  calculatorFn: (contract: T) => IFRS16CalculationResult
) {
  return (contractId: string, contract: T, ttl?: number): IFRS16CalculationResult => {
    // Tentar obter do cache primeiro
    const cachedResult = ifrs16Cache.get(contractId, contract);
    if (cachedResult) {
      return cachedResult;
    }

    // Calcular se não estiver no cache
    const result = calculatorFn(contract);
    
    // Armazenar no cache
    ifrs16Cache.set(contractId, contract, result, ttl);
    
    return result;
  };
}

/**
 * Utilitário para invalidar cache quando contrato é atualizado
 */
export function invalidateContractCache(contractId: string, _newContract: Contract): void {
  // Remove entradas antigas do contrato
  ifrs16Cache.deleteContract(contractId);
  
  // O cache será repovoado na próxima requisição com os novos dados
}

/**
 * Configurações de TTL baseadas no tipo de operação
 */
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,    // 2 minutos - para cálculos em tempo real
  MEDIUM: 5 * 60 * 1000,   // 5 minutos - para cálculos padrão
  LONG: 15 * 60 * 1000,    // 15 minutos - para relatórios
  VERY_LONG: 60 * 60 * 1000, // 1 hora - para cálculos estáticos
} as const;
