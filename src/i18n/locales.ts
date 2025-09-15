export const locales = ['pt-BR', 'en', 'es'] as const;
export type AppLocale = (typeof locales)[number];
