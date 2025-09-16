/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { locales } from '@/i18n/locales';
import {
  detectLocaleFromBrowser,
  detectLocaleFromCountry,
  getSupportedLocale,
} from '@/lib/locale-detection';

describe('Locale Detection', () => {
  describe('detectLocaleFromCountry', () => {
    it('should return pt-BR for Portuguese-speaking countries', () => {
      expect(detectLocaleFromCountry('BR')).toBe('pt-BR');
      expect(detectLocaleFromCountry('PT')).toBe('pt-BR');
      expect(detectLocaleFromCountry('AO')).toBe('pt-BR');
      expect(detectLocaleFromCountry('MZ')).toBe('pt-BR');
      expect(detectLocaleFromCountry('CV')).toBe('pt-BR');
      expect(detectLocaleFromCountry('GW')).toBe('pt-BR');
      expect(detectLocaleFromCountry('ST')).toBe('pt-BR');
      expect(detectLocaleFromCountry('TL')).toBe('pt-BR');
    });

    it('should return en for English-speaking countries', () => {
      expect(detectLocaleFromCountry('US')).toBe('en');
      expect(detectLocaleFromCountry('GB')).toBe('en');
      expect(detectLocaleFromCountry('CA')).toBe('en');
      expect(detectLocaleFromCountry('AU')).toBe('en');
      expect(detectLocaleFromCountry('NZ')).toBe('en');
      expect(detectLocaleFromCountry('IE')).toBe('en');
      expect(detectLocaleFromCountry('ZA')).toBe('en');
      expect(detectLocaleFromCountry('SG')).toBe('en');
      expect(detectLocaleFromCountry('HK')).toBe('en');
      expect(detectLocaleFromCountry('IN')).toBe('en');
      expect(detectLocaleFromCountry('PK')).toBe('en');
      expect(detectLocaleFromCountry('BD')).toBe('en');
      expect(detectLocaleFromCountry('LK')).toBe('en');
      expect(detectLocaleFromCountry('MY')).toBe('en');
      expect(detectLocaleFromCountry('PH')).toBe('en');
      expect(detectLocaleFromCountry('TH')).toBe('en');
      expect(detectLocaleFromCountry('VN')).toBe('en');
      expect(detectLocaleFromCountry('ID')).toBe('en');
    });

    it('should return es for Spanish-speaking countries', () => {
      expect(detectLocaleFromCountry('ES')).toBe('es');
      expect(detectLocaleFromCountry('MX')).toBe('es');
      expect(detectLocaleFromCountry('AR')).toBe('es');
      expect(detectLocaleFromCountry('CL')).toBe('es');
      expect(detectLocaleFromCountry('CO')).toBe('es');
      expect(detectLocaleFromCountry('PE')).toBe('es');
      expect(detectLocaleFromCountry('UY')).toBe('es');
      expect(detectLocaleFromCountry('PY')).toBe('es');
      expect(detectLocaleFromCountry('BO')).toBe('es');
      expect(detectLocaleFromCountry('EC')).toBe('es');
      expect(detectLocaleFromCountry('VE')).toBe('es');
      expect(detectLocaleFromCountry('CR')).toBe('es');
      expect(detectLocaleFromCountry('PA')).toBe('es');
      expect(detectLocaleFromCountry('GT')).toBe('es');
      expect(detectLocaleFromCountry('HN')).toBe('es');
      expect(detectLocaleFromCountry('SV')).toBe('es');
      expect(detectLocaleFromCountry('NI')).toBe('es');
      expect(detectLocaleFromCountry('CU')).toBe('es');
      expect(detectLocaleFromCountry('DO')).toBe('es');
      expect(detectLocaleFromCountry('PR')).toBe('es');
    });

    it('should return pt-BR as default for unknown countries', () => {
      expect(detectLocaleFromCountry('XX')).toBe('pt-BR');
      expect(detectLocaleFromCountry('FR')).toBe('pt-BR');
      expect(detectLocaleFromCountry('DE')).toBe('pt-BR');
      expect(detectLocaleFromCountry('IT')).toBe('pt-BR');
    });

    it('should handle case insensitive country codes', () => {
      expect(detectLocaleFromCountry('br')).toBe('pt-BR');
      expect(detectLocaleFromCountry('BR')).toBe('pt-BR');
      expect(detectLocaleFromCountry('Br')).toBe('pt-BR');
      expect(detectLocaleFromCountry('us')).toBe('en');
      expect(detectLocaleFromCountry('US')).toBe('en');
      expect(detectLocaleFromCountry('Us')).toBe('en');
      expect(detectLocaleFromCountry('es')).toBe('es');
      expect(detectLocaleFromCountry('ES')).toBe('es');
      expect(detectLocaleFromCountry('Es')).toBe('es');
    });

    it('should return pt-BR for empty or null country codes', () => {
      expect(detectLocaleFromCountry('')).toBe('pt-BR');
      expect(detectLocaleFromCountry(null as any)).toBe('pt-BR');
      expect(detectLocaleFromCountry(undefined as any)).toBe('pt-BR');
    });
  });

  describe('detectLocaleFromBrowser', () => {
    const originalNavigator = global.navigator;

    beforeEach(() => {
      // Reset navigator mock
      delete (global as any).navigator;
    });

    afterEach(() => {
      global.navigator = originalNavigator;
    });

    it('should handle browser environment correctly', () => {
      // Test that the function works in browser environment
      global.navigator = {
        language: 'pt-BR',
      } as Navigator;

      expect(detectLocaleFromBrowser()).toBe('pt-BR');
    });

    it('should detect locale from navigator.language', () => {
      global.navigator = {
        language: 'pt-BR',
      } as Navigator;

      expect(detectLocaleFromBrowser()).toBe('pt-BR');
    });

    it('should detect locale from navigator.languages[0] when language is not available', () => {
      global.navigator = {
        languages: ['en-US'],
      } as Navigator;

      expect(detectLocaleFromBrowser()).toBe('en');
    });

    it('should handle complex locale strings', () => {
      global.navigator = {
        language: 'es-ES',
      } as Navigator;

      expect(detectLocaleFromBrowser()).toBe('es');
    });

    it('should handle locale strings without country code', () => {
      global.navigator = {
        language: 'pt',
      } as Navigator;

      expect(detectLocaleFromBrowser()).toBe('pt-BR');
    });

    it('should return pt-BR when no valid locale is found', () => {
      global.navigator = {
        language: 'fr-FR',
      } as Navigator;

      expect(detectLocaleFromBrowser()).toBe('pt-BR');
    });

    it('should handle empty language strings', () => {
      global.navigator = {
        language: '',
      } as Navigator;

      expect(detectLocaleFromBrowser()).toBe('pt-BR');
    });
  });

  describe('getSupportedLocale', () => {
    it('should return the locale if it is supported', () => {
      expect(getSupportedLocale('pt-BR')).toBe('pt-BR');
      expect(getSupportedLocale('en')).toBe('en');
      expect(getSupportedLocale('es')).toBe('es');
    });

    it('should return pt-BR as default for unsupported locales', () => {
      expect(getSupportedLocale('fr')).toBe('pt-BR');
      expect(getSupportedLocale('de')).toBe('pt-BR');
      expect(getSupportedLocale('it')).toBe('pt-BR');
      expect(getSupportedLocale('invalid')).toBe('pt-BR');
    });

    it('should handle case sensitivity', () => {
      expect(getSupportedLocale('PT-BR')).toBe('pt-BR');
      expect(getSupportedLocale('EN')).toBe('pt-BR'); // Case sensitive, so falls back to default
      expect(getSupportedLocale('ES')).toBe('pt-BR'); // Case sensitive, so falls back to default
    });

    it('should handle empty or null input', () => {
      expect(getSupportedLocale('')).toBe('pt-BR');
      expect(getSupportedLocale(null as any)).toBe('pt-BR');
      expect(getSupportedLocale(undefined as any)).toBe('pt-BR');
    });
  });

  describe('Integration Tests', () => {
    it('should work with all supported locales', () => {
      locales.forEach(locale => {
        expect(getSupportedLocale(locale)).toBe(locale);
      });
    });

    it('should provide consistent fallback behavior', () => {
      const unsupportedLocales = ['fr', 'de', 'it', 'ja', 'ko', 'zh'];

      unsupportedLocales.forEach(locale => {
        expect(getSupportedLocale(locale)).toBe('pt-BR');
      });
    });

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        '',
        null,
        undefined,
        ' ',
        'invalid-locale',
        'pt-BR-extra',
        'en-US',
        'es-ES',
      ];

      edgeCases.forEach(locale => {
        const result = getSupportedLocale(locale as any);
        expect(locales).toContain(result);
      });
    });
  });
});
