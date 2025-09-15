/**
 * Sistema de Cache Inteligente para Contabilease
 * Implementa cache em memória com TTL, invalidação e persistência
 */

import { logger } from '@/lib/logger';

export interface CacheConfig {
  ttl: number; // Time to live em milliseconds
  maxSize: number; // Tamanho máximo do cache
  persist: boolean; // Se deve persistir no localStorage
}

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}

class CacheManager<T = unknown> {
  private cache = new Map<string, CacheItem<T>>();
  private stats = { hits: 0, misses: 0 };
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutos
      maxSize: 1000,
      persist: false,
      ...config,
    };

    this.startCleanup();
    this.loadFromStorage();
  }

  /**
   * Armazena valor no cache
   */
  set(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const now = Date.now();

    // Remove item mais antigo se cache estiver cheio
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const item: CacheItem<T> = {
      value,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
    };

    this.cache.set(key, item);

    if (this.config.persist) {
      this.saveToStorage(key, item);
    }

    logger.debug(`Cache set: ${key}`, { ttl, size: this.cache.size });
  }

  /**
   * Recupera valor do cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Verifica se item expirou
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      
      if (this.config.persist) {
        this.removeFromStorage(key);
      }
      
      return null;
    }

    // Atualiza estatísticas de acesso
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;

    logger.debug(`Cache hit: ${key}`, { 
      accessCount: item.accessCount,
      age: now - item.timestamp 
    });

    return item.value;
  }

  /**
   * Remove item do cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted && this.config.persist) {
      this.removeFromStorage(key);
    }

    logger.debug(`Cache delete: ${key}`, { deleted });
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    
    if (this.config.persist) {
      this.clearStorage();
    }

    logger.info('Cache cleared');
  }

  /**
   * Verifica se chave existe no cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    const now = Date.now();
    
    // Verifica se item expirou
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    // Calcula uso de memória aproximado
    let memoryUsage = 0;
    for (const [key, item] of this.cache) {
      memoryUsage += key.length * 2; // UTF-16
      memoryUsage += JSON.stringify(item.value).length * 2;
      memoryUsage += 100; // Overhead do objeto
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
    };
  }

  /**
   * Remove item mais antigo (LRU)
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug(`Cache evicted: ${oldestKey}`);
    }
  }

  /**
   * Inicia limpeza automática de itens expirados
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Limpa a cada minuto
  }

  /**
   * Remove itens expirados
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired items`);
    }
  }

  /**
   * Salva item no localStorage
   */
  private saveToStorage(key: string, item: CacheItem<T>): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `cache_${key}`;
      const data = {
        ...item,
        value: JSON.stringify(item.value),
      };
      
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to save to storage', { key, error });
    }
  }

  /**
   * Carrega item do localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !this.config.persist) return;

    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const storageKey of cacheKeys) {
        const key = storageKey.replace('cache_', '');
        const data = localStorage.getItem(storageKey);
        
        if (data) {
          const item = JSON.parse(data);
          item.value = JSON.parse(item.value);
          
          // Verifica se ainda é válido
          if (Date.now() - item.timestamp <= item.ttl) {
            this.cache.set(key, item);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }
      
      logger.info(`Loaded ${this.cache.size} items from storage`);
    } catch (error) {
      logger.warn('Failed to load from storage', { error });
    }
  }

  /**
   * Remove item do localStorage
   */
  private removeFromStorage(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      logger.warn('Failed to remove from storage', { key, error });
    }
  }

  /**
   * Limpa localStorage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      logger.warn('Failed to clear storage', { error });
    }
  }

  /**
   * Destrói o cache manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clear();
  }
}

// Instâncias de cache especializadas
export const contractCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 minutos
  maxSize: 500,
  persist: true,
});

export const userCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutos
  maxSize: 100,
  persist: true,
});

export const calculationCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 1000,
  persist: false,
});

export const apiCache = new CacheManager({
  ttl: 2 * 60 * 1000, // 2 minutos
  maxSize: 2000,
  persist: false,
});

/**
 * Hook para usar cache em componentes React
 */
export function useCache<T>(cache: CacheManager<T>) {
  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: T, ttl?: number) => cache.set(key, value, ttl),
    delete: (key: string) => cache.delete(key),
    has: (key: string) => cache.has(key),
    clear: () => cache.clear(),
    stats: () => cache.getStats(),
  };
}

/**
 * Decorator para cache automático de funções
 */
export function cached<T extends (...args: unknown[]) => unknown>(
  cache: CacheManager,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: Parameters<T>) {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyKey}_${JSON.stringify(args)}`;
      
      // Tenta obter do cache
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Executa função original
      const result = originalMethod.apply(this, args);
      
      // Armazena no cache
      if (result instanceof Promise) {
        return result.then(value => {
          cache.set(key, value);
          return value;
        });
      } else {
        cache.set(key, result);
        return result;
      }
    };

    return descriptor;
  };
}
