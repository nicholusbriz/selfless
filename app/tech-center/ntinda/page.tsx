// app/tech-center/ntinda/page.tsx
import { Metadata } from 'next'
import NtindaHero from './components/Hero'

export const metadata: Metadata = {
  title: 'Ntinda Tech Center | Selfless CE Student Portal',
  description: 'Ntinda Tech Center - Part of the Selfless CE multi-tenant educational platform in Kampala, Uganda. Access courses, grades, announcements, and connect with fellow students.',
  keywords: ['Ntinda Tech Center', 'Selfless CE', 'Uganda education', 'student portal', 'BYU Idaho', 'Ntinda tech center', 'educational platform'],
  openGraph: {
    title: 'Ntinda Tech Center | Selfless CE Student Portal',
    description: 'Ntinda Tech Center - Part of the Selfless CE multi-tenant educational platform in Kampala, Uganda.',
    url: 'https://selfless-henna.vercel.app/tech-center/ntinda',
    siteName: 'Selfless CE Student Portal',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://selfless-henna.vercel.app/tech-center/ntinda',
  },
}

export default function NtindaPage() {
  return <NtindaHero />;
}