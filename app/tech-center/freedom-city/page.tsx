// app/tech-center/freedom-city/page.tsx
import { Metadata } from 'next'
import FreedomCityHero from './components/Hero'

export const metadata: Metadata = {
  title: 'Freedom City Tech Center | Selfless CE Student Portal',
  description: 'Freedom City Tech Center - Part of the Selfless CE multi-tenant educational platform in Kampala, Uganda. Access courses, grades, announcements, and connect with fellow students.',
  keywords: ['Freedom City Tech Center', 'Selfless CE', 'Uganda education', 'student portal', 'BYU Idaho', 'Kampala tech center', 'educational platform'],
  openGraph: {
    title: 'Freedom City Tech Center | Selfless CE Student Portal',
    description: 'Freedom City Tech Center - Part of the Selfless CE multi-tenant educational platform in Kampala, Uganda.',
    url: 'https://selfless-henna.vercel.app/tech-center/freedom-city',
    siteName: 'Selfless CE Student Portal',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://selfless-henna.vercel.app/tech-center/freedom-city',
  },
}

export default function FreedomCityPage() {
  return <FreedomCityHero />;
}