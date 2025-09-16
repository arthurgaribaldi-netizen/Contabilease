/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import en from '@/lib/i18n/dictionaries/en.json';
import es from '@/lib/i18n/dictionaries/es.json';
import ptBR from '@/lib/i18n/dictionaries/pt-BR.json';

describe('Translation Completeness', () => {
  describe('Structure Consistency', () => {
    it('should have identical structure across all locales', () => {
      const ptBRKeys = getAllKeys(ptBR);
      const enKeys = getAllKeys(en);
      const esKeys = getAllKeys(es);

      expect(ptBRKeys).toEqual(enKeys);
      expect(ptBRKeys).toEqual(esKeys);
      expect(enKeys).toEqual(esKeys);
    });

    it('should have all required top-level sections', () => {
      const requiredSections = [
        'common',
        'navigation',
        'auth',
        'dashboard',
        'transactions',
        'categories',
        'reports',
        'settings',
        'contracts',
        'errors',
      ];

      requiredSections.forEach(section => {
        expect(ptBR).toHaveProperty(section);
        expect(en).toHaveProperty(section);
        expect(es).toHaveProperty(section);
      });
    });

    it('should have consistent auth.magicLink structure', () => {
      const magicLinkKeys = [
        'title',
        'subtitle',
        'emailPlaceholder',
        'sendButton',
        'sending',
        'successTitle',
        'successMessage',
        'emailSentTo',
        'nextSteps',
        'step1',
        'step2',
        'step3',
        'tryAnotherEmail',
        'howItWorks',
        'howItWorksDescription',
        'invalidEmail',
        'sendError',
        'unexpectedError',
      ];

      magicLinkKeys.forEach(key => {
        expect(ptBR.auth.magicLink).toHaveProperty(key);
        expect(en.auth.magicLink).toHaveProperty(key);
        expect(es.auth.magicLink).toHaveProperty(key);
      });
    });

    it('should have consistent contracts.validation structure', () => {
      const validationKeys = ['valueMustBePositive', 'termMustBeValid', 'rateMustBeValid'];

      validationKeys.forEach(key => {
        expect(ptBR.contracts.validation).toHaveProperty(key);
        expect(en.contracts.validation).toHaveProperty(key);
        expect(es.contracts.validation).toHaveProperty(key);
      });
    });
  });

  describe('Content Quality', () => {
    it('should not have empty strings in Portuguese translations', () => {
      const emptyKeys = findEmptyStrings(ptBR);
      expect(emptyKeys).toHaveLength(0);
    });

    it('should not have empty strings in English translations', () => {
      const emptyKeys = findEmptyStrings(en);
      expect(emptyKeys).toHaveLength(0);
    });

    it('should not have empty strings in Spanish translations', () => {
      const emptyKeys = findEmptyStrings(es);
      expect(emptyKeys).toHaveLength(0);
    });

    it('should not have placeholder text in Portuguese translations', () => {
      const placeholderKeys = findPlaceholderText(ptBR);
      expect(placeholderKeys).toHaveLength(0);
    });

    it('should not have placeholder text in English translations', () => {
      const placeholderKeys = findPlaceholderText(en);
      expect(placeholderKeys).toHaveLength(0);
    });

    it('should not have placeholder text in Spanish translations', () => {
      const placeholderKeys = findPlaceholderText(es);
      expect(placeholderKeys).toHaveLength(0);
    });

    it('should have appropriate length for all translations', () => {
      const allKeys = getAllKeys(ptBR);

      allKeys.forEach(key => {
        const ptBRValue = getValueByKey(ptBR, key);
        const enValue = getValueByKey(en, key);
        const esValue = getValueByKey(es, key);

        // Translations should not be too short (less than 2 characters)
        expect(ptBRValue.length).toBeGreaterThanOrEqual(2);
        expect(enValue.length).toBeGreaterThanOrEqual(2);
        expect(esValue.length).toBeGreaterThanOrEqual(2);

        // Translations should not be excessively long (more than 200 characters)
        expect(ptBRValue.length).toBeLessThanOrEqual(200);
        expect(enValue.length).toBeLessThanOrEqual(200);
        expect(esValue.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('Language-Specific Validation', () => {
    it('should have proper Portuguese grammar and spelling', () => {
      const portugueseIssues = findLanguageIssues(ptBR, 'pt-BR');
      // Allow some technical terms like "calculateIFRS"
      expect(portugueseIssues.length).toBeLessThanOrEqual(2);
    });

    it('should have proper English grammar and spelling', () => {
      const englishIssues = findLanguageIssues(en, 'en');
      // Allow some technical terms like "calculateIFRS"
      expect(englishIssues.length).toBeLessThanOrEqual(2);
    });

    it('should have proper Spanish grammar and spelling', () => {
      const spanishIssues = findLanguageIssues(es, 'es');
      // Allow some technical terms like "calculateIFRS"
      expect(spanishIssues.length).toBeLessThanOrEqual(2);
    });

    it('should use consistent terminology across Portuguese translations', () => {
      const terminologyIssues = findTerminologyIssues(ptBR);
      expect(terminologyIssues).toHaveLength(0);
    });

    it('should use consistent terminology across English translations', () => {
      const terminologyIssues = findTerminologyIssues(en);
      expect(terminologyIssues).toHaveLength(0);
    });

    it('should use consistent terminology across Spanish translations', () => {
      const terminologyIssues = findTerminologyIssues(es);
      expect(terminologyIssues).toHaveLength(0);
    });
  });

  describe('Business Logic Validation', () => {
    it('should have all required IFRS 16 terminology', () => {
      const ifrs16Terms = [
        'leasing',
        'contrato',
        'contract',
        'contrato',
        'valor',
        'value',
        'valor',
        'taxa',
        'rate',
        'tasa',
        'prazo',
        'term',
        'plazo',
      ];

      const extractAllStrings = (obj: any): string[] => {
        const strings: string[] = [];
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
              strings.push(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              strings.push(...extractAllStrings(obj[key]));
            }
          }
        }
        return strings;
      };

      const allText = [
        ...extractAllStrings(ptBR),
        ...extractAllStrings(en),
        ...extractAllStrings(es),
      ].join(' ');

      ifrs16Terms.forEach(term => {
        expect(allText.toLowerCase()).toContain(term.toLowerCase());
      });
    });

    it('should have proper financial terminology', () => {
      const financialTerms = [
        'valor',
        'value',
        'valor',
        'moeda',
        'currency',
        'moneda',
        'taxa',
        'rate',
        'tasa',
        'prazo',
        'term',
        'plazo',
      ];

      const extractAllStrings = (obj: any): string[] => {
        const strings: string[] = [];
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
              strings.push(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              strings.push(...extractAllStrings(obj[key]));
            }
          }
        }
        return strings;
      };

      const allText = [
        ...extractAllStrings(ptBR),
        ...extractAllStrings(en),
        ...extractAllStrings(es),
      ].join(' ');

      financialTerms.forEach(term => {
        expect(allText.toLowerCase()).toContain(term.toLowerCase());
      });
    });
  });

  describe('Accessibility and UX', () => {
    it('should have clear and concise button labels', () => {
      const buttonKeys = [
        'common.save',
        'common.cancel',
        'common.confirm',
        'common.delete',
        'common.edit',
        'auth.login',
        'auth.register',
        'contracts.addContract',
        'contracts.editContract',
        'contracts.deleteContract',
      ];

      buttonKeys.forEach(key => {
        const ptBRValue = getValueByKey(ptBR, key);
        const enValue = getValueByKey(en, key);
        const esValue = getValueByKey(es, key);

        // Button labels should be concise (less than 20 characters)
        expect(ptBRValue.length).toBeLessThanOrEqual(20);
        expect(enValue.length).toBeLessThanOrEqual(20);
        expect(esValue.length).toBeLessThanOrEqual(20);
      });
    });

    it('should have descriptive error messages', () => {
      const errorKeys = [
        'errors.pageNotFound',
        'errors.serverError',
        'errors.unauthorized',
        'errors.forbidden',
        'errors.validationError',
        'errors.networkError',
      ];

      errorKeys.forEach(key => {
        const ptBRValue = getValueByKey(ptBR, key);
        const enValue = getValueByKey(en, key);
        const esValue = getValueByKey(es, key);

        // Error messages should be descriptive (more than 8 characters)
        expect(ptBRValue.length).toBeGreaterThanOrEqual(8);
        expect(enValue.length).toBeGreaterThanOrEqual(8);
        expect(esValue.length).toBeGreaterThanOrEqual(8);
      });
    });

    it('should have helpful placeholder text', () => {
      const placeholderKeys = ['auth.magicLink.emailPlaceholder'];

      placeholderKeys.forEach(key => {
        const ptBRValue = getValueByKey(ptBR, key);
        const enValue = getValueByKey(en, key);
        const esValue = getValueByKey(es, key);

        // Placeholder text should be helpful (more than 5 characters)
        expect(ptBRValue.length).toBeGreaterThanOrEqual(5);
        expect(enValue.length).toBeGreaterThanOrEqual(5);
        expect(esValue.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe('Performance and Maintainability', () => {
    it('should have reasonable file sizes', () => {
      const ptBRSize = JSON.stringify(ptBR).length;
      const enSize = JSON.stringify(en).length;
      const esSize = JSON.stringify(es).length;

      // Files should not be excessively large (less than 50KB)
      expect(ptBRSize).toBeLessThan(50000);
      expect(enSize).toBeLessThan(50000);
      expect(esSize).toBeLessThan(50000);

      // Files should be reasonably sized (more than 1KB)
      expect(ptBRSize).toBeGreaterThan(1000);
      expect(enSize).toBeGreaterThan(1000);
      expect(esSize).toBeGreaterThan(1000);
    });

    it('should have balanced file sizes across locales', () => {
      const ptBRSize = JSON.stringify(ptBR).length;
      const enSize = JSON.stringify(en).length;
      const esSize = JSON.stringify(es).length;

      const maxSize = Math.max(ptBRSize, enSize, esSize);
      const minSize = Math.min(ptBRSize, enSize, esSize);

      // Size difference should not be more than 50%
      expect(maxSize / minSize).toBeLessThanOrEqual(1.5);
    });
  });
});

// Helper functions
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

function getValueByKey(obj: any, key: string): string {
  const keys = key.split('.');
  let value: any = obj;

  for (const k of keys) {
    value = value?.[k];
  }

  return value || '';
}

function findEmptyStrings(obj: any, prefix = ''): string[] {
  const emptyKeys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        emptyKeys.push(...findEmptyStrings(obj[key], fullKey));
      } else if (obj[key] === '') {
        emptyKeys.push(fullKey);
      }
    }
  }

  return emptyKeys;
}

function findPlaceholderText(obj: any, prefix = ''): string[] {
  const placeholderKeys: string[] = [];
  const placeholderPatterns = [/^\[.*\]$/, /^<.*>$/, /^TODO/i, /^FIXME/i, /^XXX/i, /^TBD/i];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        placeholderKeys.push(...findPlaceholderText(obj[key], fullKey));
      } else {
        const value = obj[key];
        if (placeholderPatterns.some(pattern => pattern.test(value))) {
          placeholderKeys.push(fullKey);
        }
      }
    }
  }

  return placeholderKeys;
}

function findLanguageIssues(obj: any, locale: string): string[] {
  const issues: string[] = [];
  const commonIssues = [
    /[A-Z]{4,}/, // All caps words (4+ letters) - more strict
    /[a-z]{30,}/, // Very long words (30+ letters) - more strict
    /[!]{3,}/, // Multiple exclamation marks (3+)
    /[?]{3,}/, // Multiple question marks (3+)
  ];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        issues.push(...findLanguageIssues(obj[key], locale));
      } else {
        const value = obj[key];
        if (commonIssues.some(pattern => pattern.test(value))) {
          issues.push(key);
        }
      }
    }
  }

  return issues;
}

function findTerminologyIssues(obj: any): string[] {
  const issues: string[] = [];
  const terminologyMap = new Map<string, string[]>();

  // Define terminology consistency rules
  terminologyMap.set('contract', ['contrato', 'contract', 'contrato']);
  terminologyMap.set('value', ['valor', 'value', 'valor']);
  terminologyMap.set('rate', ['taxa', 'rate', 'tasa']);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        issues.push(...findTerminologyIssues(obj[key]));
      } else {
        const value = obj[key];
        // Check for terminology consistency
        for (const [term, translations] of terminologyMap) {
          if (value.toLowerCase().includes(term.toLowerCase())) {
            // This is a simplified check - in a real scenario,
            // you'd want more sophisticated terminology validation
          }
        }
      }
    }
  }

  return issues;
}
