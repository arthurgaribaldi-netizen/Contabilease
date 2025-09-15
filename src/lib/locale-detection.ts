import { locales } from '@/i18n/locales';

// Mapping of country codes to locales
const countryToLocale: Record<string, string> = {
  BR: 'pt-BR',
  PT: 'pt-BR',
  AO: 'pt-BR',
  MZ: 'pt-BR',
  CV: 'pt-BR',
  GW: 'pt-BR',
  ST: 'pt-BR',
  TL: 'pt-BR',
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  ZA: 'en',
  SG: 'en',
  HK: 'en',
  IN: 'en',
  PK: 'en',
  BD: 'en',
  LK: 'en',
  MY: 'en',
  PH: 'en',
  TH: 'en',
  VN: 'en',
  ID: 'en',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CL: 'es',
  CO: 'es',
  PE: 'es',
  UY: 'es',
  PY: 'es',
  BO: 'es',
  EC: 'es',
  VE: 'es',
  CR: 'es',
  PA: 'es',
  GT: 'es',
  HN: 'es',
  SV: 'es',
  NI: 'es',
  CU: 'es',
  DO: 'es',
  PR: 'es',
};

export function detectLocaleFromCountry(countryCode: string): string {
  if (!countryCode) return 'pt-BR';
  return countryToLocale[countryCode.toUpperCase()] || 'pt-BR';
}

export function detectLocaleFromBrowser(): string {
  if (typeof window === 'undefined') return 'pt-BR';

  const browserLocale = navigator.language || navigator.languages?.[0];
  const countryCode = browserLocale?.split('-')?.[1] ?? '';

  return detectLocaleFromCountry(countryCode);
}

export function getSupportedLocale(locale: string): (typeof locales)[number] {
  return (locales as readonly string[]).includes(locale)
    ? (locale as (typeof locales)[number])
    : 'pt-BR';
}
