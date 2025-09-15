import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/locales';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Load messages directly based on URL param to avoid server config coupling
  const messages = (await import(`@/lib/i18n/dictionaries/${locale}.json`)).default;

  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
