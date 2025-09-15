import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://contabilease.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pt-BR/',
          '/en/',
          '/es/',
          '/api/health',
          '/pt-BR/ifrs16-demo',
          '/pt-BR/contract-modifications-demo',
          '/en/ifrs16-demo',
          '/en/contract-modifications-demo',
          '/es/ifrs16-demo',
          '/es/contract-modifications-demo',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/dashboard/',
          '/contracts/',
          '/auth/verify/',
          '/pt-BR/dashboard/',
          '/pt-BR/contracts/',
          '/pt-BR/auth/verify/',
          '/en/dashboard/',
          '/en/contracts/',
          '/en/auth/verify/',
          '/es/dashboard/',
          '/es/contracts/',
          '/es/auth/verify/',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
