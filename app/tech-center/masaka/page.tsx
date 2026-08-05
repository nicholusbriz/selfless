// app/tech-center/masaka/page.tsx
import { Metadata } from 'next'
import MasakaHero from './components/Hero'

export const metadata: Metadata = {
  title: 'Masaka Tech Center | Selfless CE Student Portal',
  description: 'Masaka Tech Center - Part of the Selfless CE multi-tenant educational platform in Masaka, Uganda. Access courses, grades, announcements, and connect with fellow students.',
  keywords: ['Masaka Tech Center', 'Selfless CE', 'Uganda education', 'student portal', 'BYU Idaho', 'Masaka tech center', 'educational platform'],
  openGraph: {
    title: 'Masaka Tech Center | Selfless CE Student Portal',
    description: 'Masaka Tech Center - Part of the Selfless CE multi-tenant educational platform in Masaka, Uganda.',
    url: 'https://selfless-henna.vercel.app/tech-center/masaka',
    siteName: 'Selfless CE Student Portal',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://selfless-henna.vercel.app/tech-center/masaka',
  },
}

export default function MasakaPage() {
  return <MasakaHero />;
}