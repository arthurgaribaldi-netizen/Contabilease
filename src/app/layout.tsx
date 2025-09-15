import ResourcePreloader from '@/components/performance/ResourcePreloader';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { ThemeProvider } from '@/lib/theme-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'Contabilease - Software IFRS 16 para Contadores | Substitua Planilhas Excel',
  description: 'Economize 2 horas por contrato com cálculos automáticos de IFRS 16. Relatórios profissionais, backup seguro. Por apenas R$ 29/mês. Teste grátis por 30 dias.',
  keywords: [
    'IFRS 16', 'cálculo leasing', 'planilha excel', 'contador', 'controller', 
    'auditoria', 'conformidade', 'relatórios contábeis', 'software contábil',
    'leasing', 'arrendamento', 'valor presente', 'depreciação', 'amortização'
  ],
  authors: [{ name: 'Contabilease Team' }],
  creator: 'Contabilease',
  publisher: 'Contabilease',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://contabilease.com'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://contabilease.com',
    title: 'Contabilease - Software IFRS 16 para Contadores',
    description: 'Substitua planilhas Excel por cálculos automáticos de IFRS 16. Economize tempo e entregue relatórios profissionais.',
    siteName: 'Contabilease',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contabilease - Software IFRS 16 para Contadores',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contabilease - Software IFRS 16 para Contadores',
    description: 'Substitua planilhas Excel por cálculos automáticos de IFRS 16. Economize tempo e entregue relatórios profissionais.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://contabilease.com',
    languages: {
      'pt-BR': 'https://contabilease.com/pt-BR',
      'en': 'https://contabilease.com/en',
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  other: {
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#3b82f6',
    'color-scheme': 'light dark',
    'supported-color-schemes': 'light dark',
  },
};

const criticalCSS = `
  /* Critical CSS for LCP optimization */
  body { 
    font-family: ${inter.style.fontFamily}, system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(to bottom, transparent, rgb(255, 255, 255)) rgb(248, 250, 252);
    color: rgb(15, 23, 42);
  }
  .min-h-screen { min-height: 100vh; }
  .bg-gradient-to-br { background: linear-gradient(to bottom right, rgb(239, 246, 255), rgb(224, 231, 255)); }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
  .text-center { text-align: center; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .font-bold { font-weight: 700; }
  .text-gray-900 { color: rgb(17, 24, 39); }
  .mb-4 { margin-bottom: 1rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-gray-600 { color: rgb(75, 85, 99); }
  .mb-8 { margin-bottom: 2rem; }
  .grid { display: grid; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .gap-6 { gap: 1.5rem; }
  .max-w-4xl { max-width: 56rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .bg-white { background-color: rgb(255, 255, 255); }
  .rounded-lg { border-radius: 0.5rem; }
  .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
  .p-6 { padding: 1.5rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .font-semibold { font-weight: 600; }
  .text-gray-800 { color: rgb(31, 41, 55); }
  .mb-2 { margin-bottom: 0.5rem; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .text-green-600 { color: rgb(22, 163, 74); }
  .text-blue-600 { color: rgb(37, 99, 235); }
  .text-red-600 { color: rgb(220, 38, 38); }
  .mt-8 { margin-top: 2rem; }
  .bg-primary-600 { background-color: rgb(37, 99, 235); }
  .hover\\:bg-primary-700:hover { background-color: rgb(29, 78, 216); }
  .text-white { color: rgb(255, 255, 255); }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
  .duration-200 { transition-duration: 200ms; }
  
  @media (min-width: 768px) {
    .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
`;

function CriticalCSS() {
  return <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR' suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <CriticalCSS />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ResourcePreloader />
        <AccessibilityProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
