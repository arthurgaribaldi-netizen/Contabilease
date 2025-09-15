/**
 * Sistema de Content Security Policy (CSP) Dinâmico
 * Implementa CSP adaptativo baseado no contexto da aplicação
 */

import { logger } from '@/lib/logger';
import React from 'react';

export interface CSPDirective {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'frame-src'?: string[];
  'object-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
}

export interface CSPConfig {
  mode: 'strict' | 'balanced' | 'permissive';
  environment: 'development' | 'production' | 'testing';
  features: {
    inlineScripts: boolean;
    inlineStyles: boolean;
    eval: boolean;
    unsafeInline: boolean;
    dataUrls: boolean;
    blobUrls: boolean;
  };
  trustedDomains: string[];
  reportUri?: string;
}

class CSPManager {
  private config: CSPConfig;

  constructor(config?: Partial<CSPConfig>) {
    this.config = {
      mode: 'balanced',
      environment: 'production',
      features: {
        inlineScripts: false,
        inlineStyles: false,
        eval: false,
        unsafeInline: false,
        dataUrls: false,
        blobUrls: false,
      },
      trustedDomains: [],
      ...config,
    };
  }

  /**
   * Gera CSP baseado na configuração
   */
  generateCSP(): string {
    const directives = this.buildDirectives();
    return this.formatCSP(directives);
  }

  /**
   * Constrói diretivas CSP baseadas na configuração
   */
  private buildDirectives(): CSPDirective {
    const directives: CSPDirective = {};

    // Default source
    directives['default-src'] = this.buildDefaultSrc();

    // Script sources
    directives['script-src'] = this.buildScriptSrc();

    // Style sources
    directives['style-src'] = this.buildStyleSrc();

    // Image sources
    directives['img-src'] = this.buildImgSrc();

    // Font sources
    directives['font-src'] = this.buildFontSrc();

    // Connect sources
    directives['connect-src'] = this.buildConnectSrc();

    // Frame sources
    directives['frame-src'] = this.buildFrameSrc();

    // Object sources
    directives['object-src'] = ['none'];

    // Base URI
    directives['base-uri'] = ['self'];

    // Form action
    directives['form-action'] = ['self'];

    // Frame ancestors
    directives['frame-ancestors'] = ['none'];

    // Upgrade insecure requests
    if (this.config.environment === 'production') {
      directives['upgrade-insecure-requests'] = true;
    }

    // Block mixed content
    if (this.config.environment === 'production') {
      directives['block-all-mixed-content'] = true;
    }

    return directives;
  }

  /**
   * Constrói default-src
   */
  private buildDefaultSrc(): string[] {
    const sources = ['self'];

    if (this.config.environment === 'development') {
      sources.push('localhost:*');
    }

    return sources;
  }

  /**
   * Constrói script-src
   */
  private buildScriptSrc(): string[] {
    const sources = ['self'];

    // Domínios confiáveis
    sources.push(...this.config.trustedDomains);

    // Domínios específicos para scripts
    const scriptDomains = [
      '*.stripe.com',
      '*.supabase.co',
      '*.vercel.app',
      '*.googleapis.com',
      '*.gstatic.com',
    ];
    sources.push(...scriptDomains);

    // Features baseadas na configuração
    if (this.config.features.inlineScripts) {
      sources.push("'unsafe-inline'");
    }

    if (this.config.features.eval) {
      sources.push("'unsafe-eval'");
    }

    // Nonce para scripts inline em produção
    if (this.config.environment === 'production' && this.config.features.inlineScripts) {
      sources.push("'nonce-{NONCE}'");
    }

    return sources;
  }

  /**
   * Constrói style-src
   */
  private buildStyleSrc(): string[] {
    const sources = ['self'];

    // Domínios confiáveis
    sources.push(...this.config.trustedDomains);

    // Domínios específicos para estilos
    const styleDomains = [
      'fonts.googleapis.com',
      '*.supabase.co',
    ];
    sources.push(...styleDomains);

    // Features baseadas na configuração
    if (this.config.features.inlineStyles) {
      sources.push("'unsafe-inline'");
    }

    return sources;
  }

  /**
   * Constrói img-src
   */
  private buildImgSrc(): string[] {
    const sources = ['self'];

    // Domínios confiáveis
    sources.push(...this.config.trustedDomains);

    // Domínios específicos para imagens
    const imgDomains = [
      'data:',
      'blob:',
      '*.supabase.co',
      '*.vercel.app',
      'images.unsplash.com',
      'via.placeholder.com',
    ];
    sources.push(...imgDomains);

    // Features baseadas na configuração
    if (this.config.features.dataUrls) {
      sources.push('data:');
    }

    if (this.config.features.blobUrls) {
      sources.push('blob:');
    }

    return sources;
  }

  /**
   * Constrói font-src
   */
  private buildFontSrc(): string[] {
    const sources = ['self'];

    // Domínios específicos para fontes
    const fontDomains = [
      'fonts.gstatic.com',
      '*.supabase.co',
    ];
    sources.push(...fontDomains);

    // Features baseadas na configuração
    if (this.config.features.dataUrls) {
      sources.push('data:');
    }

    return sources;
  }

  /**
   * Constrói connect-src
   */
  private buildConnectSrc(): string[] {
    const sources = ['self'];

    // Domínios confiáveis
    sources.push(...this.config.trustedDomains);

    // Domínios específicos para conexões
    const connectDomains = [
      '*.supabase.co',
      '*.stripe.com',
      '*.vercel.app',
      'api.github.com',
    ];
    sources.push(...connectDomains);

    if (this.config.environment === 'development') {
      sources.push('localhost:*', 'ws://localhost:*', 'wss://localhost:*');
    }

    return sources;
  }

  /**
   * Constrói frame-src
   */
  private buildFrameSrc(): string[] {
    const sources = ['self'];

    // Domínios específicos para frames
    const frameDomains = [
      '*.stripe.com',
      '*.supabase.co',
    ];
    sources.push(...frameDomains);

    return sources;
  }

  /**
   * Formata CSP como string
   */
  private formatCSP(directives: CSPDirective): string {
    const parts: string[] = [];

    for (const [directive, values] of Object.entries(directives)) {
      if (Array.isArray(values)) {
        parts.push(`${directive} ${values.join(' ')}`);
      } else if (typeof values === 'boolean' && values) {
        parts.push(directive);
      }
    }

    return parts.join('; ');
  }

  /**
   * Gera nonce para scripts inline
   */
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Valida CSP contra configuração
   */
  validateCSP(csp: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const directives = this.parseCSP(csp);

    // Validações básicas
    if (!directives['default-src']) {
      errors.push('default-src is required');
    }

    if (directives['object-src']?.includes("'unsafe-inline'")) {
      errors.push('object-src should not allow unsafe-inline');
    }

    if (this.config.environment === 'production') {
      if (directives['script-src']?.includes("'unsafe-eval'")) {
        errors.push('script-src should not allow unsafe-eval in production');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Parse CSP string para objeto
   */
  private parseCSP(csp: string): Record<string, string[]> {
    const directives: Record<string, string[]> = {};
    
    csp.split(';').forEach(part => {
      const [directive, ...values] = part.trim().split(' ');
      if (directive && values.length > 0) {
        directives[directive] = values;
      }
    });

    return directives;
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<CSPConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('CSP configuration updated', updates);
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): CSPConfig {
    return { ...this.config };
  }
}

// Instâncias pré-configuradas
const cspManager = new CSPManager();

/**
 * Configurações CSP para diferentes ambientes
 */
export const cspConfigs = {
  development: {
    mode: 'permissive' as const,
    environment: 'development' as const,
    features: {
      inlineScripts: true,
      inlineStyles: true,
      eval: true,
      unsafeInline: true,
      dataUrls: true,
      blobUrls: true,
    },
    trustedDomains: ['localhost:*'],
  },
  
  production: {
    mode: 'strict' as const,
    environment: 'production' as const,
    features: {
      inlineScripts: false,
      inlineStyles: false,
      eval: false,
      unsafeInline: false,
      dataUrls: true,
      blobUrls: false,
    },
    trustedDomains: [],
  },
  
  testing: {
    mode: 'balanced' as const,
    environment: 'testing' as const,
    features: {
      inlineScripts: true,
      inlineStyles: true,
      eval: false,
      unsafeInline: true,
      dataUrls: true,
      blobUrls: true,
    },
    trustedDomains: ['localhost:*'],
  },
} as const;

/**
 * Gera CSP para ambiente atual
 */
export function generateCSP(config?: Partial<CSPConfig>): string {
  if (config) {
    cspManager.updateConfig(config);
  }
  
  return cspManager.generateCSP();
}

/**
 * Gera CSP com nonce para scripts inline
 */
export function generateCSPWithNonce(nonce?: string): { csp: string; nonce: string } {
  const actualNonce = nonce || cspManager.generateNonce();
  const csp = generateCSP();
  
  // Substitui placeholder de nonce
  const cspWithNonce = csp.replace("'nonce-{NONCE}'", `'nonce-${actualNonce}'`);
  
  return { csp: cspWithNonce, nonce: actualNonce };
}

/**
 * Valida CSP
 */
export function validateCSP(csp: string): { valid: boolean; errors: string[] } {
  return cspManager.validateCSP(csp);
}

/**
 * Hook para CSP em componentes React
 */
export function useCSP(config?: Partial<CSPConfig>) {
  const [csp, setCsp] = React.useState(() => generateCSP(config));
  const [nonce, setNonce] = React.useState(() => cspManager.generateNonce());

  const updateCSP = React.useCallback((newConfig: Partial<CSPConfig>) => {
    cspManager.updateConfig(newConfig);
    const newCsp = cspManager.generateCSP();
    setCsp(newCsp);
  }, []);

  const generateNewNonce = React.useCallback(() => {
    const newNonce = cspManager.generateNonce();
    setNonce(newNonce);
    return newNonce;
  }, []);

  return {
    csp,
    nonce,
    updateCSP,
    generateNewNonce,
    validate: (cspString: string) => cspManager.validateCSP(cspString),
  };
}

/**
 * Middleware para aplicar CSP em rotas
 */
export function withCSP(config?: Partial<CSPConfig>) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (request: Request) {
      const response = await originalMethod.call(this, request);
      
      if (response instanceof Response) {
        const { csp, nonce } = generateCSPWithNonce();
        
        // Adiciona headers CSP
        response.headers.set('Content-Security-Policy', csp);
        response.headers.set('X-Content-Security-Policy-Nonce', nonce);
        
        // Adiciona nonce ao HTML se for uma resposta HTML
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          const html = await response.text();
          const htmlWithNonce = html.replace(/<script/g, `<script nonce="${nonce}"`);
          return new Response(htmlWithNonce, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }
      }
      
      return response;
    };

    return descriptor;
  };
}
