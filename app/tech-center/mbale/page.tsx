// app/tech-center/mbale/page.tsx
import { Metadata } from 'next'
import MbaleHero from './components/Hero'

export const metadata: Metadata = {
  title: 'Mbale Tech Center | Selfless CE Student Portal',
  description: 'Mbale Tech Center - Part of the Selfless CE multi-tenant educational platform in Mbale, Uganda. Access courses, grades, announcements, and connect with fellow students.',
  keywords: ['Mbale Tech Center', 'Selfless CE', 'Uganda education', 'student portal', 'BYU Idaho', 'Mbale tech center', 'educational platform'],
  openGraph: {
    title: 'Mbale Tech Center | Selfless CE Student Portal',
    description: 'Mbale Tech Center - Part of the Selfless CE multi-tenant educational platform in Mbale, Uganda.',
    url: 'https://selfless-henna.vercel.app/tech-center/mbale',
    siteName: 'Selfless CE Student Portal',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://selfless-henna.vercel.app/tech-center/mbale',
  },
}

export default function MbalePage() {
  return <MbaleHero />;
}