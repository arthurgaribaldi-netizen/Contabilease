/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import ptBR from './dictionaries/pt-BR.json';

type TranslationKeys = typeof ptBR;

interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  errors: string[];
}

/**
 * Valida se todas as traduções têm as mesmas chaves
 */
export function validateTranslations(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingKeys: [],
    extraKeys: [],
    errors: [],
  };

  const ptBRKeys = getAllKeys(ptBR);
  const enKeys = getAllKeys(en);
  const esKeys = getAllKeys(es);

  // Verificar chaves faltando em inglês
  const missingInEn = ptBRKeys.filter(key => !enKeys.includes(key));
  if (missingInEn.length > 0) {
    result.missingKeys.push(...missingInEn.map(key => `en: ${key}`));
    result.isValid = false;
  }

  // Verificar chaves faltando em espanhol
  const missingInEs = ptBRKeys.filter(key => !esKeys.includes(key));
  if (missingInEs.length > 0) {
    result.missingKeys.push(...missingInEs.map(key => `es: ${key}`));
    result.isValid = false;
  }

  // Verificar chaves extras em inglês
  const extraInEn = enKeys.filter(key => !ptBRKeys.includes(key));
  if (extraInEn.length > 0) {
    result.extraKeys.push(...extraInEn.map(key => `en: ${key}`));
  }

  // Verificar chaves extras em espanhol
  const extraInEs = esKeys.filter(key => !ptBRKeys.includes(key));
  if (extraInEs.length > 0) {
    result.extraKeys.push(...extraInEs.map(key => `es: ${key}`));
  }

  return result;
}

/**
 * Obtém todas as chaves de um objeto de tradução recursivamente
 */
function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }

  return keys;
}

/**
 * Valida se uma chave específica existe em todas as traduções
 */
export function validateKey(key: string): boolean {
  const keys = getAllKeys(ptBR);
  return keys.includes(key);
}

/**
 * Obtém todas as chaves de tradução disponíveis
 */
export function getAllTranslationKeys(): string[] {
  return getAllKeys(ptBR);
}

/**
 * Valida estrutura específica do Magic Link
 */
export function validateMagicLinkTranslations(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingKeys: [],
    extraKeys: [],
    errors: [],
  };

  const requiredKeys = [
    'auth.magicLink.title',
    'auth.magicLink.subtitle',
    'auth.magicLink.emailPlaceholder',
    'auth.magicLink.sendButton',
    'auth.magicLink.sending',
    'auth.magicLink.successTitle',
    'auth.magicLink.successMessage',
    'auth.magicLink.emailSentTo',
    'auth.magicLink.nextSteps',
    'auth.magicLink.step1',
    'auth.magicLink.step2',
    'auth.magicLink.step3',
    'auth.magicLink.tryAnotherEmail',
    'auth.magicLink.howItWorks',
    'auth.magicLink.howItWorksDescription',
    'auth.magicLink.invalidEmail',
    'auth.magicLink.sendError',
    'auth.magicLink.unexpectedError',
  ];

  const allKeys = getAllTranslationKeys();

  for (const key of requiredKeys) {
    if (!allKeys.includes(key)) {
      result.missingKeys.push(key);
      result.isValid = false;
    }
  }

  return result;
}
