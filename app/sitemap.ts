import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.selflessstudentportal.org';

// Bump this date whenever you make a meaningful content change
// so Google knows something is actually new.
const LAST_UPDATED = '2026-10-16';

const publicPages: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  lastModified: string;
}[] = [
    {
      // Homepage — most important, changes frequently
      path: '',
      changeFrequency: 'weekly',
      priority: 1.0,
      lastModified: LAST_UPDATED,
    },
    {
      // Features page — high value for SEO
      path: '/features',
      changeFrequency: 'monthly',
      priority: 0.9,
      lastModified: LAST_UPDATED,
    },
    {
      // Tech Centers listing — key discovery page
      path: '/tech-centers',
      changeFrequency: 'monthly',
      priority: 0.9,
      lastModified: LAST_UPDATED,
    },
    {
      // About page
      path: '/about',
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: LAST_UPDATED,
    },
    {
      // Help / support page
      path: '/help',
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: LAST_UPDATED,
    },
    {
      // Terms of service — rarely changes
      path: '/terms',
      changeFrequency: 'yearly',
      priority: 0.3,
      lastModified: LAST_UPDATED,
    },
    {
      // Privacy policy — rarely changes
      path: '/privacy',
      changeFrequency: 'yearly',
      priority: 0.3,
      lastModified: LAST_UPDATED,
    },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(lastModified),
    changeFrequency,
    priority,
  }));
}
