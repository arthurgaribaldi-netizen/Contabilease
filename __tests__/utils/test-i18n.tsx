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
import { NextIntlClientProvider } from 'next-intl';
import { ReactElement } from 'react';

// Available translations for tests
const translations = {
  'pt-BR': ptBR,
  en: en,
  es: es,
};

interface TestI18nProviderProps {
  children: ReactElement;
  locale?: keyof typeof translations;
}

/**
 * Test provider that wraps components with NextIntl context
 * Uses actual translation files instead of hardcoded mocks
 */
export function TestI18nProvider({ children, locale = 'pt-BR' }: TestI18nProviderProps) {
  const messages = translations[locale];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Helper function to render components with i18n context
 */
export function renderWithI18n(
  component: ReactElement,
  locale: keyof typeof translations = 'pt-BR'
) {
  const { render } = require('@testing-library/react');

  return render(<TestI18nProvider locale={locale}>{component}</TestI18nProvider>);
}

/**
 * Get translation value for testing
 */
export function getTranslation(key: string, locale: keyof typeof translations = 'pt-BR'): string {
  const messages = translations[locale];
  const keys = key.split('.');

  let value: any = messages;
  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}

/**
 * Available locales for testing
 */
export const testLocales = Object.keys(translations) as Array<keyof typeof translations>;
