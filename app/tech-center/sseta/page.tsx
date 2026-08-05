// app/tech-center/sseta/page.tsx
import { Metadata } from 'next'
import SsetaHero from './components/Hero'

export const metadata: Metadata = {
  title: 'Sseta Tech Center | Selfless CE Student Portal',
  description: 'Sseta Tech Center - Part of the Selfless CE multi-tenant educational platform in Central Region, Uganda. Access courses, grades, announcements, and connect with fellow students.',
  keywords: ['Sseta Tech Center', 'Selfless CE', 'Uganda education', 'student portal', 'BYU Idaho', 'Sseta tech center', 'educational platform'],
  openGraph: {
    title: 'Sseta Tech Center | Selfless CE Student Portal',
    description: 'Sseta Tech Center - Part of the Selfless CE multi-tenant educational platform in Central Region, Uganda.',
    url: 'https://selfless-henna.vercel.app/tech-center/sseta',
    siteName: 'Selfless CE Student Portal',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://selfless-henna.vercel.app/tech-center/sseta',
  },
}

export default function SsetaPage() {
  return <SsetaHero />;
}