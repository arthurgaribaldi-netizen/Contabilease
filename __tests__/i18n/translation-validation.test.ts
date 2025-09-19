/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { validateMagicLinkTranslations, validateTranslations } from '@/lib/i18n/validation';

describe('Translation Validation', () => {
  describe('validateTranslations', () => {
    it('should validate all translation files have consistent keys', () => {
      const result = validateTranslations();

      expect(result.isValid).toBe(true);
      expect(result.missingKeys).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing keys in translations', () => {
      // Este teste verifica se a estrutura está consistente
      const result = validateTranslations();

      if (!result.isValid) {
        console.warn('Translation inconsistencies found:', result.missingKeys);
      }

      // Aceita algumas chaves extras, mas não chaves faltando
      expect(result.missingKeys).toHaveLength(0);
    });
  });

  describe('validateMagicLinkTranslations', () => {
    it('should validate all required magic link translation keys exist', () => {
      const result = validateMagicLinkTranslations();

      expect(result.isValid).toBe(true);
      expect(result.missingKeys).toHaveLength(0);
    });

    it('should have all required magic link keys', () => {
      const result = validateMagicLinkTranslations();

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

      expect(result.missingKeys).toHaveLength(0);

      // Verificar se todas as chaves estão presentes
      for (const key of requiredKeys) {
        expect(result.missingKeys).not.toContain(key);
      }
    });
  });
});


