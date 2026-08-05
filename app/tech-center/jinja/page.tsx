// app/tech-center/jinja/page.tsx
import { Metadata } from 'next'
import JinjaHero from './components/Hero'

export const metadata: Metadata = {
  title: 'Jinja Tech Center | Selfless CE Student Portal',
  description: 'Jinja Tech Center - Part of the Selfless CE multi-tenant educational platform in Jinja, Uganda. Access courses, grades, announcements, and connect with fellow students.',
  keywords: ['Jinja Tech Center', 'Selfless CE', 'Uganda education', 'student portal', 'BYU Idaho', 'Jinja tech center', 'educational platform'],
  openGraph: {
    title: 'Jinja Tech Center | Selfless CE Student Portal',
    description: 'Jinja Tech Center - Part of the Selfless CE multi-tenant educational platform in Jinja, Uganda.',
    url: 'https://selfless-henna.vercel.app/tech-center/jinja',
    siteName: 'Selfless CE Student Portal',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://selfless-henna.vercel.app/tech-center/jinja',
  },
}

export default function JinjaPage() {
  return <JinjaHero />;
}