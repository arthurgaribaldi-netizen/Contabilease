/**
 * Sistema de Lazy Loading Inteligente para Contabilease
 * Implementa carregamento sob demanda com preload e cache
 */

import { contractCache } from '@/lib/cache/cache-manager';
import { logger } from '@/lib/logger';
import React from 'react';

export interface LazyLoadConfig {
  threshold: number; // Distância em pixels para trigger
  rootMargin: string; // Margem do root
  preload: boolean; // Se deve fazer preload
  cache: boolean; // Se deve usar cache
  retryAttempts: number; // Tentativas de retry
  timeout: number; // Timeout em ms
}

export interface LazyLoadItem {
  id: string;
  element: HTMLElement;
  loadFunction: () => Promise<unknown>;
  config: LazyLoadConfig;
  loaded: boolean;
  loading: boolean;
  error: Error | null;
}

class LazyLoadManager {
  private items = new Map<string, LazyLoadItem>();
  private observer: IntersectionObserver | null = null;
  private defaultConfig: LazyLoadConfig;

  constructor(defaultConfig?: Partial<LazyLoadConfig>) {
    this.defaultConfig = {
      threshold: 0.1,
      rootMargin: '50px',
      preload: true,
      cache: true,
      retryAttempts: 3,
      timeout: 10000,
      ...defaultConfig,
    };

    this.initObserver();
  }

  /**
   * Registra elemento para lazy loading
   */
  register(
    id: string,
    element: HTMLElement,
    loadFunction: () => Promise<unknown>,
    config?: Partial<LazyLoadConfig>
  ): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    const item: LazyLoadItem = {
      id,
      element,
      loadFunction,
      config: finalConfig,
      loaded: false,
      loading: false,
      error: null,
    };

    this.items.set(id, item);
    
    if (this.observer) {
      this.observer.observe(element);
    }

    logger.debug(`Lazy load item registered: ${id}`, {
      threshold: finalConfig.threshold,
      preload: finalConfig.preload,
    });
  }

  /**
   * Remove elemento do lazy loading
   */
  unregister(id: string): void {
    const item = this.items.get(id);
    if (item && this.observer) {
      this.observer.unobserve(item.element);
    }
    
    this.items.delete(id);
    logger.debug(`Lazy load item unregistered: ${id}`);
  }

  /**
   * Força carregamento de um item
   */
  async forceLoad(id: string): Promise<unknown> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Lazy load item not found: ${id}`);
    }

    return this.loadItem(item);
  }

  /**
   * Inicializa Intersection Observer
   */
  private initObserver(): void {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const item = this.findItemByElement(entry.target as HTMLElement);
            if (item && !item.loaded && !item.loading) {
              this.loadItem(item);
            }
          }
        });
      },
      {
        threshold: this.defaultConfig.threshold,
        rootMargin: this.defaultConfig.rootMargin,
      }
    );
  }

  /**
   * Encontra item pelo elemento
   */
  private findItemByElement(element: HTMLElement): LazyLoadItem | undefined {
    for (const item of this.items.values()) {
      if (item.element === element) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Carrega item com retry e cache
   */
  private async loadItem(item: LazyLoadItem): Promise<unknown> {
    if (item.loaded || item.loading) {
      return item.element.dataset.lazyData;
    }

    item.loading = true;
    item.error = null;

    // Verifica cache primeiro
    if (item.config.cache) {
      const cached = contractCache.get(item.id);
      if (cached) {
        item.loaded = true;
        item.loading = false;
        this.updateElement(item, cached);
        logger.debug(`Lazy load from cache: ${item.id}`);
        return cached;
      }
    }

    // Carrega com retry
    for (let attempt = 1; attempt <= item.config.retryAttempts; attempt++) {
      try {
        const result = await Promise.race([
          item.loadFunction(),
          this.createTimeout(item.config.timeout),
        ]);

        item.loaded = true;
        item.loading = false;
        
        // Armazena no cache
        if (item.config.cache) {
          contractCache.set(item.id, result);
        }

        this.updateElement(item, result);
        
        logger.debug(`Lazy load successful: ${item.id}`, {
          attempt,
          cached: item.config.cache,
        });

        return result;
      } catch (error) {
        item.error = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === item.config.retryAttempts) {
          item.loading = false;
          this.updateElementError(item, item.error);
          
          logger.error(`Lazy load failed: ${item.id}`, {
            attempts: attempt,
            error: item.error.message,
          });
          
          throw item.error;
        }
        
        // Aguarda antes do próximo retry
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  /**
   * Atualiza elemento com dados carregados
   */
  private updateElement(item: LazyLoadItem, data: unknown): void {
    item.element.dataset.lazyLoaded = 'true';
    item.element.dataset.lazyData = JSON.stringify(data);
    
    // Remove classes de loading
    item.element.classList.remove('lazy-loading', 'lazy-error');
    item.element.classList.add('lazy-loaded');
    
    // Dispara evento customizado
    item.element.dispatchEvent(new CustomEvent('lazyLoaded', {
      detail: { id: item.id, data },
    }));
  }

  /**
   * Atualiza elemento com erro
   */
  private updateElementError(item: LazyLoadItem, error: Error): void {
    item.element.dataset.lazyError = 'true';
    item.element.dataset.lazyErrorMessage = error.message;
    
    // Remove classes de loading
    item.element.classList.remove('lazy-loading', 'lazy-loaded');
    item.element.classList.add('lazy-error');
    
    // Dispara evento customizado
    item.element.dispatchEvent(new CustomEvent('lazyError', {
      detail: { id: item.id, error },
    }));
  }

  /**
   * Cria timeout promise
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Lazy load timeout')), ms);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtém estatísticas de lazy loading
   */
  getStats(): {
    total: number;
    loaded: number;
    loading: number;
    errors: number;
  } {
    const items = Array.from(this.items.values());
    
    return {
      total: items.length,
      loaded: items.filter(item => item.loaded).length,
      loading: items.filter(item => item.loading).length,
      errors: items.filter(item => item.error).length,
    };
  }

  /**
   * Limpa todos os itens
   */
  clear(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.items.clear();
    logger.info('Lazy load manager cleared');
  }

  /**
   * Destrói o manager
   */
  destroy(): void {
    this.clear();
    this.observer = null;
  }
}

// Instância singleton
const lazyLoadManager = new LazyLoadManager();

/**
 * Hook para lazy loading em componentes React
 */
export function useLazyLoad<T>(
  id: string,
  loadFunction: () => Promise<T>,
  config?: Partial<LazyLoadConfig>
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await lazyLoadManager.forceLoad(id);
      setData(result as T);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    const element = document.getElementById(id);
    if (element) {
      lazyLoadManager.register(id, element, loadFunction, config);
      
      return () => {
        lazyLoadManager.unregister(id);
      };
    }
  }, [id, loadFunction, config]);

  return {
    data,
    loading,
    error,
    load,
    stats: lazyLoadManager.getStats(),
  };
}

/**
 * Hook para lazy loading de imagens
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const loadImage = React.useCallback(async () => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }, [src]);

  const { data, loading } = useLazyLoad(
    `image-${src}`,
    loadImage,
    { threshold: 0.1, preload: true }
  );

  React.useEffect(() => {
    if (data) {
      setLoaded(true);
    }
  }, [data]);

  return {
    loaded,
    loading,
    error,
    src: loaded ? src : placeholder,
  };
}

/**
 * Hook para lazy loading de componentes
 */
export function useLazyComponent(threshold = 0.1, rootMargin = '50px') {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return {
    isVisible,
    ref,
  };
}

/**
 * Utilitário para preload de recursos
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style' = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to preload image'));
      img.src = url;
    } else {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${type}`));
      
      document.head.appendChild(link);
    }
  });
}

/**
 * Configurações otimizadas para diferentes tipos de conteúdo
 */
export const lazyLoadConfigs = {
  images: {
    threshold: 0.1,
    rootMargin: '50px',
    preload: true,
    cache: true,
    retryAttempts: 3,
    timeout: 5000,
  },
  
  components: {
    threshold: 0.2,
    rootMargin: '100px',
    preload: false,
    cache: true,
    retryAttempts: 2,
    timeout: 10000,
  },
  
  data: {
    threshold: 0.5,
    rootMargin: '200px',
    preload: false,
    cache: true,
    retryAttempts: 3,
    timeout: 15000,
  },
} as const;
