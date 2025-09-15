/**
 * Sistema de Sanitização de Entrada para Contabilease
 * Implementa sanitização robusta contra XSS, injection attacks e dados maliciosos
 */

import { logger } from '@/lib/logger';
import React from 'react';

export interface SanitizationConfig {
  allowHtml: boolean;
  allowScripts: boolean;
  allowStyles: boolean;
  allowDataUrls: boolean;
  maxLength: number;
  removeEmpty: boolean;
  normalizeWhitespace: boolean;
  escapeHtml: boolean;
}

export interface SanitizationResult {
  sanitized: string;
  removed: string[];
  warnings: string[];
  originalLength: number;
  sanitizedLength: number;
}

class InputSanitizer {
  private config: SanitizationConfig;

  constructor(config?: Partial<SanitizationConfig>) {
    this.config = {
      allowHtml: false,
      allowScripts: false,
      allowStyles: false,
      allowDataUrls: false,
      maxLength: 10000,
      removeEmpty: true,
      normalizeWhitespace: true,
      escapeHtml: true,
      ...config,
    };
  }

  /**
   * Sanitiza string de entrada
   */
  sanitize(input: string, context?: string): SanitizationResult {
    const originalLength = input.length;
    const removed: string[] = [];
    const warnings: string[] = [];

    let sanitized = input;

    // Verifica comprimento máximo
    if (sanitized.length > this.config.maxLength) {
      sanitized = sanitized.substring(0, this.config.maxLength);
      warnings.push(`Input truncated to ${this.config.maxLength} characters`);
    }

    // Remove caracteres de controle perigosos
    sanitized = this.removeControlCharacters(sanitized, removed);

    // Remove scripts se não permitidos
    if (!this.config.allowScripts) {
      sanitized = this.removeScripts(sanitized, removed);
    }

    // Remove estilos se não permitidos
    if (!this.config.allowStyles) {
      sanitized = this.removeStyles(sanitized, removed);
    }

    // Remove data URLs se não permitidos
    if (!this.config.allowDataUrls) {
      sanitized = this.removeDataUrls(sanitized, removed);
    }

    // Remove HTML se não permitido
    if (!this.config.allowHtml) {
      sanitized = this.removeHtml(sanitized, removed);
    }

    // Escapa HTML se necessário
    if (this.config.escapeHtml) {
      sanitized = this.escapeHtml(sanitized);
    }

    // Normaliza espaços em branco
    if (this.config.normalizeWhitespace) {
      sanitized = this.normalizeWhitespace(sanitized);
    }

    // Remove strings vazias se configurado
    if (this.config.removeEmpty && sanitized.trim() === '') {
      sanitized = '';
      warnings.push('Empty input removed');
    }

    const result: SanitizationResult = {
      sanitized,
      removed,
      warnings,
      originalLength,
      sanitizedLength: sanitized.length,
    };

    // Log de sanitização
    if (removed.length > 0 || warnings.length > 0) {
      logger.warn(`Input sanitized${context ? ` for ${context}` : ''}`, {
        originalLength,
        sanitizedLength: sanitized.length,
        removed: removed.length,
        warnings: warnings.length,
      });
    }

    return result;
  }

  /**
   * Remove caracteres de controle perigosos
   */
  private removeControlCharacters(input: string, removed: string[]): string {
    const dangerousChars = [
      '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07',
      '\x08', '\x0B', '\x0C', '\x0E', '\x0F', '\x10', '\x11', '\x12',
      '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1A',
      '\x1B', '\x1C', '\x1D', '\x1E', '\x1F', '\x7F',
    ];

    let sanitized = input;
    dangerousChars.forEach(char => {
      if (sanitized.includes(char)) {
        sanitized = sanitized.replace(new RegExp(char, 'g'), '');
        removed.push(`Control character: ${char.charCodeAt(0)}`);
      }
    });

    return sanitized;
  }

  /**
   * Remove scripts e conteúdo JavaScript
   */
  private removeScripts(input: string, removed: string[]): string {
    let sanitized = input;

    // Remove tags script
    const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const scripts = sanitized.match(scriptRegex);
    if (scripts) {
      removed.push(...scripts.map(s => `Script tag: ${s.substring(0, 50)}...`));
      sanitized = sanitized.replace(scriptRegex, '');
    }

    // Remove event handlers
    const eventRegex = /\bon\w+\s*=\s*["'][^"']*["']/gi;
    const events = sanitized.match(eventRegex);
    if (events) {
      removed.push(...events.map(e => `Event handler: ${e}`));
      sanitized = sanitized.replace(eventRegex, '');
    }

    // Remove javascript: URLs
    const jsUrlRegex = /javascript\s*:/gi;
    const jsUrls = sanitized.match(jsUrlRegex);
    if (jsUrls) {
      removed.push(...jsUrls.map(u => `JavaScript URL: ${u}`));
      sanitized = sanitized.replace(jsUrlRegex, '');
    }

    // Remove eval() calls
    const evalRegex = /eval\s*\(/gi;
    const evals = sanitized.match(evalRegex);
    if (evals) {
      removed.push(...evals.map(e => `Eval call: ${e}`));
      sanitized = sanitized.replace(evalRegex, '');
    }

    return sanitized;
  }

  /**
   * Remove estilos CSS
   */
  private removeStyles(input: string, removed: string[]): string {
    let sanitized = input;

    // Remove tags style
    const styleRegex = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;
    const styles = sanitized.match(styleRegex);
    if (styles) {
      removed.push(...styles.map(s => `Style tag: ${s.substring(0, 50)}...`));
      sanitized = sanitized.replace(styleRegex, '');
    }

    // Remove atributos style
    const styleAttrRegex = /\sstyle\s*=\s*["'][^"']*["']/gi;
    const styleAttrs = sanitized.match(styleAttrRegex);
    if (styleAttrs) {
      removed.push(...styleAttrs.map(s => `Style attribute: ${s}`));
      sanitized = sanitized.replace(styleAttrRegex, '');
    }

    return sanitized;
  }

  /**
   * Remove data URLs
   */
  private removeDataUrls(input: string, removed: string[]): string {
    const dataUrlRegex = /data\s*:\s*[^;]+;base64,[A-Za-z0-9+/=]+/gi;
    const dataUrls = input.match(dataUrlRegex);
    if (dataUrls) {
      removed.push(...dataUrls.map(url => `Data URL: ${url.substring(0, 50)}...`));
      return input.replace(dataUrlRegex, '');
    }
    return input;
  }

  /**
   * Remove HTML tags
   */
  private removeHtml(input: string, removed: string[]): string {
    const htmlRegex = /<[^>]*>/g;
    const htmlTags = input.match(htmlRegex);
    if (htmlTags) {
      removed.push(...htmlTags.map(tag => `HTML tag: ${tag}`));
      return input.replace(htmlRegex, '');
    }
    return input;
  }

  /**
   * Escapa caracteres HTML
   */
  private escapeHtml(input: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, char => htmlEscapes[char] || char);
  }

  /**
   * Normaliza espaços em branco
   */
  private normalizeWhitespace(input: string): string {
    return input
      .replace(/\s+/g, ' ') // Múltiplos espaços para um
      .replace(/\n\s*\n/g, '\n') // Múltiplas quebras de linha para uma
      .trim(); // Remove espaços do início e fim
  }

  /**
   * Valida entrada contra padrões suspeitos
   */
  validate(input: string): { valid: boolean; threats: string[] } {
    const threats: string[] = [];

    // Padrões suspeitos comuns
    const suspiciousPatterns = [
      { pattern: /<script/i, threat: 'Script injection attempt' },
      { pattern: /javascript:/i, threat: 'JavaScript URL' },
      { pattern: /on\w+\s*=/i, threat: 'Event handler injection' },
      { pattern: /eval\s*\(/i, threat: 'Code evaluation attempt' },
      { pattern: /document\./i, threat: 'DOM manipulation attempt' },
      { pattern: /window\./i, threat: 'Window object access' },
      { pattern: /alert\s*\(/i, threat: 'Alert injection' },
      { pattern: /confirm\s*\(/i, threat: 'Confirm injection' },
      { pattern: /prompt\s*\(/i, threat: 'Prompt injection' },
      { pattern: /<iframe/i, threat: 'Iframe injection' },
      { pattern: /<object/i, threat: 'Object injection' },
      { pattern: /<embed/i, threat: 'Embed injection' },
      { pattern: /<link/i, threat: 'Link injection' },
      { pattern: /<meta/i, threat: 'Meta injection' },
    ];

    suspiciousPatterns.forEach(({ pattern, threat }) => {
      if (pattern.test(input)) {
        threats.push(threat);
      }
    });

    return {
      valid: threats.length === 0,
      threats,
    };
  }

  /**
   * Sanitiza objeto completo
   */
  sanitizeObject(obj: Record<string, unknown>, context?: string): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const result = this.sanitize(value, `${context}.${key}`);
        sanitized[key] = result.sanitized;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item, index) => {
          if (typeof item === 'string') {
            return this.sanitize(item, `${context}.${key}[${index}]`).sanitized;
          }
          return item;
        });
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>, `${context}.${key}`);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<SanitizationConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('Sanitization configuration updated', updates);
  }
}

// Instâncias pré-configuradas
const inputSanitizer = new InputSanitizer();

/**
 * Configurações de sanitização para diferentes contextos
 */
export const sanitizationConfigs = {
  // Para texto simples (comentários, descrições)
  text: {
    allowHtml: false,
    allowScripts: false,
    allowStyles: false,
    allowDataUrls: false,
    maxLength: 5000,
    removeEmpty: true,
    normalizeWhitespace: true,
    escapeHtml: true,
  },
  
  // Para HTML rico (editor de texto)
  richText: {
    allowHtml: true,
    allowScripts: false,
    allowStyles: true,
    allowDataUrls: false,
    maxLength: 50000,
    removeEmpty: false,
    normalizeWhitespace: false,
    escapeHtml: false,
  },
  
  // Para URLs
  url: {
    allowHtml: false,
    allowScripts: false,
    allowStyles: false,
    allowDataUrls: false,
    maxLength: 2048,
    removeEmpty: true,
    normalizeWhitespace: true,
    escapeHtml: true,
  },
  
  // Para dados de formulário
  form: {
    allowHtml: false,
    allowScripts: false,
    allowStyles: false,
    allowDataUrls: false,
    maxLength: 10000,
    removeEmpty: true,
    normalizeWhitespace: true,
    escapeHtml: true,
  },
} as const;

/**
 * Sanitiza entrada com configuração específica
 */
export function sanitizeInput(
  input: string,
  config?: Partial<SanitizationConfig>,
  context?: string
): SanitizationResult {
  if (config) {
    inputSanitizer.updateConfig(config);
  }
  
  return inputSanitizer.sanitize(input, context);
}

/**
 * Sanitiza objeto com configuração específica
 */
export function sanitizeObject(
  obj: Record<string, unknown>,
  config?: Partial<SanitizationConfig>,
  context?: string
): Record<string, unknown> {
  if (config) {
    inputSanitizer.updateConfig(config);
  }
  
  return inputSanitizer.sanitizeObject(obj, context);
}

/**
 * Valida entrada contra ameaças
 */
export function validateInput(input: string): { valid: boolean; threats: string[] } {
  return inputSanitizer.validate(input);
}

/**
 * Hook para sanitização em componentes React
 */
export function useSanitization(config?: Partial<SanitizationConfig>) {
  const sanitize = React.useCallback(
    (input: string, context?: string) => sanitizeInput(input, config, context),
    [config]
  );

  const sanitizeObj = React.useCallback(
    (obj: Record<string, unknown>, context?: string) => sanitizeObject(obj, config, context),
    [config]
  );

  const validate = React.useCallback(
    (input: string) => validateInput(input),
    []
  );

  return {
    sanitize,
    sanitizeObj,
    validate,
  };
}

/**
 * Middleware para sanitização automática em APIs
 */
export function withSanitization(config?: Partial<SanitizationConfig>) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (request: Request) {
      try {
        const body = await request.json();
        const sanitizedBody = sanitizeObject(body, config, propertyKey);
        
        // Substitui body original pelo sanitizado
        (request as any).sanitizedBody = sanitizedBody;
        
        return originalMethod.call(this, request);
      } catch (error) {
        logger.error('Sanitization middleware error', { error });
        return originalMethod.call(this, request);
      }
    };

    return descriptor;
  };
}
