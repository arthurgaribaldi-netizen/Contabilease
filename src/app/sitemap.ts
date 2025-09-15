import { locales } from '@/i18n/locales';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://contabilease.com';
  const currentDate = new Date().toISOString();

  // Static pages that exist for all locales
  const staticPages = [
    {
      url: '/',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: '/auth/login',
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: '/auth/signup',
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: '/ifrs16-demo',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: '/contract-modifications-demo',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Generate sitemap entries for all locales and static pages
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page.url}`,
        lastModified: page.lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: locales.reduce((acc, loc) => {
            acc[loc] = `${baseUrl}/${loc}${page.url}`;
            return acc;
          }, {} as Record<string, string>),
        },
      });
    }
  }

  // Add API health check
  sitemapEntries.push({
    url: `${baseUrl}/api/health`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.3,
  });

  return sitemapEntries;
}
