// app/tech-center/lira/page.tsx
import { Metadata } from 'next'
import LiraHero from './components/Hero'

export const metadata: Metadata = {
  title: 'Lira Tech Center | Selfless CE Student Portal',
  description: 'Lira Tech Center - Part of the Selfless CE multi-tenant educational platform in Lira, Uganda. Access courses, grades, announcements, and connect with fellow students.',
  keywords: ['Lira Tech Center', 'Selfless CE', 'Uganda education', 'student portal', 'BYU Idaho', 'Lira tech center', 'educational platform'],
  openGraph: {
    title: 'Lira Tech Center | Selfless CE Student Portal',
    description: 'Lira Tech Center - Part of the Selfless CE multi-tenant educational platform in Lira, Uganda.',
    url: 'https://selfless-henna.vercel.app/tech-center/lira',
    siteName: 'Selfless CE Student Portal',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://selfless-henna.vercel.app/tech-center/lira',
  },
}

export default function LiraPage() {
  return <LiraHero />;
}