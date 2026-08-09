import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://selfless-henna.vercel.app'
  const currentDate = new Date()
  
  // Tech centers in Uganda
  const techCenters = [
    { slug: 'freedom-city', name: 'Freedom City Tech Center', location: 'Kampala' },
    { slug: 'jinja', name: 'Jinja Tech Center', location: 'Jinja' },
    { slug: 'lira', name: 'Lira Tech Center', location: 'Lira' },
    { slug: 'masaka', name: 'Masaka Tech Center', location: 'Masaka' },
    { slug: 'mbale', name: 'Mbale Tech Center', location: 'Mbale' },
    { slug: 'ntinda', name: 'Ntinda Tech Center', location: 'Kampala' },
    { slug: 'sseta', name: 'Sseta Tech Center', location: 'Central Region' },
  ]
  
  // Main pages
  const mainPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1,
    }
  ]
  
  // Tech center pages with high SEO priority
  const techCenterPages = techCenters.map(tc => ({
    url: `${baseUrl}/tech-center/${tc.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  
  // Dashboard pages (lower priority as they require authentication)
  const dashboardPages = [
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dashboard/overview`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dashboard/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/settings`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/students`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/courses`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/grades`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/announcements`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/notifications`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dashboard/cleaning`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dashboard/football-team`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dashboard/internships`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/temple-trips`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dashboard/support-groups`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dashboard/ai`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.4,
    },
  ]
  
  // Admin pages (lowest priority - require admin access)
  const adminPages = [
    {
      url: `${baseUrl}/dashboard/admin`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dashboard/admin/teachers`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dashboard/admin/tech-centers`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dashboard/admin/users`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dashboard/admin/cleaning`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/dashboard/teacher`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dashboard/teacher/students`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dashboard/teacher/grades`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dashboard/super-admin`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/dashboard/super-admin/centers`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/dashboard/super-admin/users`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/dashboard/super-admin/logs`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/dashboard/super-admin/settings`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/dashboard/super-admin/knowledge-base`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.1,
    },
  ]
  
  return [...mainPages, ...techCenterPages, ...dashboardPages, ...adminPages]
}
