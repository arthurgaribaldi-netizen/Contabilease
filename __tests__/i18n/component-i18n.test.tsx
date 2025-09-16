/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 *
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslation, testLocales } from '../utils/test-i18n';

// Mock components that use translations
const MockComponent = ({ locale = 'pt-BR' }: { locale?: string }) => {
  return (
    <div>
      <h1>{getTranslation('dashboard.welcome', locale)}</h1>
      <button>{getTranslation('common.save', locale)}</button>
      <button>{getTranslation('common.cancel', locale)}</button>
      <p>{getTranslation('auth.magicLink.title', locale)}</p>
      <p>{getTranslation('contracts.title', locale)}</p>
    </div>
  );
};

const MockFormComponent = ({ locale = 'pt-BR' }: { locale?: string }) => {
  return (
    <form>
      <label htmlFor='email'>{getTranslation('auth.email', locale)}</label>
      <input
        id='email'
        type='email'
        placeholder={getTranslation('auth.magicLink.emailPlaceholder', locale)}
      />
      <button type='submit'>{getTranslation('auth.magicLink.sendButton', locale)}</button>
    </form>
  );
};

const MockNavigationComponent = ({ locale = 'pt-BR' }: { locale?: string }) => {
  return (
    <nav>
      <a href='/dashboard'>{getTranslation('navigation.dashboard', locale)}</a>
      <a href='/contracts'>{getTranslation('navigation.contracts', locale)}</a>
      <a href='/settings'>{getTranslation('navigation.settings', locale)}</a>
    </nav>
  );
};

describe('Component Internationalization', () => {
  describe('Basic Component Rendering', () => {
    testLocales.forEach(locale => {
      it(`should render correctly in ${locale}`, () => {
        render(<MockComponent locale={locale} />);

        expect(screen.getByText(getTranslation('dashboard.welcome', locale))).toBeInTheDocument();
        expect(screen.getByText(getTranslation('common.save', locale))).toBeInTheDocument();
        expect(screen.getByText(getTranslation('common.cancel', locale))).toBeInTheDocument();
        expect(
          screen.getByText(getTranslation('auth.magicLink.title', locale))
        ).toBeInTheDocument();
        expect(screen.getByText(getTranslation('contracts.title', locale))).toBeInTheDocument();
      });
    });
  });

  describe('Form Component Internationalization', () => {
    testLocales.forEach(locale => {
      it(`should render form correctly in ${locale}`, () => {
        render(<MockFormComponent locale={locale} />);

        expect(screen.getByLabelText(getTranslation('auth.email', locale))).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(getTranslation('auth.magicLink.emailPlaceholder', locale))
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: getTranslation('auth.magicLink.sendButton', locale) })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Component Internationalization', () => {
    testLocales.forEach(locale => {
      it(`should render navigation correctly in ${locale}`, () => {
        render(<MockNavigationComponent locale={locale} />);

        expect(
          screen.getByRole('link', { name: getTranslation('navigation.dashboard', locale) })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('link', { name: getTranslation('navigation.contracts', locale) })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('link', { name: getTranslation('navigation.settings', locale) })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Translation Consistency', () => {
    it('should have consistent button text across locales', () => {
      const buttonTexts = {
        'pt-BR': getTranslation('common.save', 'pt-BR'),
        en: getTranslation('common.save', 'en'),
        es: getTranslation('common.save', 'es'),
      };

      // All button texts should be different (properly translated)
      expect(buttonTexts['pt-BR']).not.toBe(buttonTexts.en);
      expect(buttonTexts['pt-BR']).not.toBe(buttonTexts.es);
      expect(buttonTexts.en).not.toBe(buttonTexts.es);

      // All button texts should be non-empty
      expect(buttonTexts['pt-BR']).toBeTruthy();
      expect(buttonTexts.en).toBeTruthy();
      expect(buttonTexts.es).toBeTruthy();
    });

    it('should have consistent form labels across locales', () => {
      const emailLabels = {
        'pt-BR': getTranslation('auth.email', 'pt-BR'),
        en: getTranslation('auth.email', 'en'),
        es: getTranslation('auth.email', 'es'),
      };

      // All labels should be different (properly translated)
      expect(emailLabels['pt-BR']).not.toBe(emailLabels.en);
      expect(emailLabels['pt-BR']).not.toBe(emailLabels.es);
      expect(emailLabels.en).not.toBe(emailLabels.es);

      // All labels should be non-empty
      expect(emailLabels['pt-BR']).toBeTruthy();
      expect(emailLabels.en).toBeTruthy();
      expect(emailLabels.es).toBeTruthy();
    });

    it('should have consistent navigation text across locales', () => {
      const dashboardLinks = {
        'pt-BR': getTranslation('navigation.dashboard', 'pt-BR'),
        en: getTranslation('navigation.dashboard', 'en'),
        es: getTranslation('navigation.dashboard', 'es'),
      };

      // All navigation texts should be non-empty
      expect(dashboardLinks['pt-BR']).toBeTruthy();
      expect(dashboardLinks.en).toBeTruthy();
      expect(dashboardLinks.es).toBeTruthy();

      // At least some should be different (properly translated)
      const uniqueValues = new Set(Object.values(dashboardLinks));
      expect(uniqueValues.size).toBeGreaterThan(1);
    });
  });

  describe('Accessibility with Internationalization', () => {
    testLocales.forEach(locale => {
      it(`should maintain accessibility in ${locale}`, () => {
        render(<MockFormComponent locale={locale} />);

        const emailInput = screen.getByLabelText(getTranslation('auth.email', locale));
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'email');

        const submitButton = screen.getByRole('button', {
          name: getTranslation('auth.magicLink.sendButton', locale),
        });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveAttribute('type', 'submit');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translations gracefully', () => {
      const MissingTranslationComponent = () => {
        return <div>{getTranslation('nonexistent.key', 'pt-BR')}</div>;
      };

      render(<MissingTranslationComponent />);

      // Should display the key itself when translation is missing
      expect(screen.getByText('nonexistent.key')).toBeInTheDocument();
    });

    it('should handle invalid locale gracefully', () => {
      const InvalidLocaleComponent = () => {
        return <div>{getTranslation('common.save', 'invalid-locale' as any)}</div>;
      };

      render(<InvalidLocaleComponent />);

      // Should fallback to default behavior
      expect(screen.getByText('common.save')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render components quickly with translations', () => {
      const startTime = Date.now();

      render(<MockComponent locale='pt-BR' />);

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should handle multiple locale switches efficiently', () => {
      const { rerender } = render(<MockComponent locale='pt-BR' />);

      const startTime = Date.now();

      testLocales.forEach(locale => {
        rerender(<MockComponent locale={locale} />);
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(500); // Should handle all locales in less than 500ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty translation values', () => {
      const EmptyTranslationComponent = () => {
        return <div>{getTranslation('common.loading', 'pt-BR')}</div>;
      };

      render(<EmptyTranslationComponent />);

      // Should display the translation or fallback
      expect(screen.getByText(getTranslation('common.loading', 'pt-BR'))).toBeInTheDocument();
    });

    it('should handle special characters in translations', () => {
      const SpecialCharComponent = () => {
        return <div>{getTranslation('auth.magicLink.title', 'pt-BR')}</div>;
      };

      render(<SpecialCharComponent />);

      // Should handle special characters properly
      expect(screen.getByText(getTranslation('auth.magicLink.title', 'pt-BR'))).toBeInTheDocument();
    });

    it('should handle long translation strings', () => {
      const LongTranslationComponent = () => {
        return <div>{getTranslation('auth.magicLink.howItWorksDescription', 'pt-BR')}</div>;
      };

      render(<LongTranslationComponent />);

      // Should handle long strings properly
      expect(
        screen.getByText(getTranslation('auth.magicLink.howItWorksDescription', 'pt-BR'))
      ).toBeInTheDocument();
    });
  });

  describe('Integration with NextIntl', () => {
    it('should work with NextIntlClientProvider', () => {
      const messages = {
        'dashboard.welcome': 'Welcome to Contabilease',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
      };

      render(
        <NextIntlClientProvider locale='en' messages={messages}>
          <MockComponent locale='en' />
        </NextIntlClientProvider>
      );

      expect(screen.getByText('Welcome to Contabilease')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should handle locale switching with NextIntlClientProvider', () => {
      const ptBRMessages = {
        'dashboard.welcome': 'Bem-vindo ao Contabilease',
        'common.save': 'Salvar',
        'common.cancel': 'Cancelar',
      };

      const enMessages = {
        'dashboard.welcome': 'Welcome to Contabilease',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
      };

      const { rerender } = render(
        <NextIntlClientProvider locale='pt-BR' messages={ptBRMessages}>
          <MockComponent locale='pt-BR' />
        </NextIntlClientProvider>
      );

      expect(screen.getByText('Bem-vindo ao Contabilease')).toBeInTheDocument();

      rerender(
        <NextIntlClientProvider locale='en' messages={enMessages}>
          <MockComponent locale='en' />
        </NextIntlClientProvider>
      );

      expect(screen.getByText('Welcome to Contabilease')).toBeInTheDocument();
    });
  });
});
