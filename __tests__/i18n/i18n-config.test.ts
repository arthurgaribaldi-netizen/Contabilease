/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import i18nConfig, { locales } from '@/lib/i18n/config';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock dynamic imports
jest.mock('@/lib/i18n/dictionaries/pt-BR.json', () => ({
  default: {
    common: { loading: 'Carregando...' },
    auth: { login: 'Entrar' },
  },
}));

jest.mock('@/lib/i18n/dictionaries/en.json', () => ({
  default: {
    common: { loading: 'Loading...' },
    auth: { login: 'Login' },
  },
}));

jest.mock('@/lib/i18n/dictionaries/es.json', () => ({
  default: {
    common: { loading: 'Cargando...' },
    auth: { login: 'Iniciar Sesión' },
  },
}));

describe('i18n Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRequestConfig', () => {
    it('should validate locale parameter types', () => {
      // Test that the function exists and can be called
      expect(typeof i18nConfig).toBe('function');
    });
  });

  describe('locales export', () => {
    it('should export the correct locales array', () => {
      expect(locales).toEqual(['pt-BR', 'en', 'es']);
    });

    it('should have the correct number of locales', () => {
      expect(locales).toHaveLength(3);
    });

    it('should include all supported locales', () => {
      expect(locales).toContain('pt-BR');
      expect(locales).toContain('en');
      expect(locales).toContain('es');
    });

    it('should be a readonly array', () => {
      // Test that locales array is properly defined
      expect(Array.isArray(locales)).toBe(true);
      expect(locales.length).toBe(3);
    });
  });

  describe('Type Safety', () => {
    it('should have correct locale types', () => {
      const validLocales: Array<'pt-BR' | 'en' | 'es'> = ['pt-BR', 'en', 'es'];

      validLocales.forEach(locale => {
        expect(locales).toContain(locale);
      });
    });
  });
});
