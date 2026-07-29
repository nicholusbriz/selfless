// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers';
import PWAInstall from '@/components/PWAInstall';

export const metadata: Metadata = {
  metadataBase: new URL('https://selfless-henna.vercel.app'),
  title: "Selfless CE Student Self Service Portal | Centralized Multi-Tenant Platform",
  description: "Selfless CE Student Self Service Portal is the official centralized multi-tenant platform for students across all Selfless CE Tech Centers. Students can track BYU-Idaho courses and credits, receive tutor feedback, participate in daily chores, communicate with peers, access organizational policies, receive announcements, and manage their academic journey through one centralized student portal.",
  keywords: "Selfless CE, Selfless CE Student Portal, Selfless CE Student Self Service Portal, Freedom City Tech Center, Mbale Tech Center, Masaka Tech Center, Jinja Tech Center, Ntinda Tech Center, Sseta Tech Center, Lira Tech Center, BYU Idaho, Student Portal, Student Management System, Academic Tracking, Student Self Service, Tutor Management, Student Collaboration, Selfless CE Organization, Uganda Student Portal",
  authors: [{ name: "Nicholus Turyamureba", url: "https://selfless-henna.vercel.app" }],
  creator: "Atbriz",
  publisher: "Cyber Touch",
  icons: {
    icon: "/freedom.png",
    shortcut: "/freedom.png",
    apple: "/freedom.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Selfless CE Portal",
    startupImage: [
      {
        url: "/freedom.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Selfless CE Student Self Service Portal",
    title: "Selfless CE Student Self Service Portal | Centralized Multi-Tenant Platform",
    description: "The official centralized multi-tenant platform for students across all Selfless CE Tech Centers. Track BYU-Idaho courses, receive tutor feedback, manage academic progress, and collaborate with peers through one unified student portal serving Freedom City, Mbale, Masaka, Jinja, Ntinda, Sseta, and Lira Tech Centers.",
    url: "https://selfless-henna.vercel.app",
    images: [
      {
        url: "/freedom.png",
        width: 512,
        height: 512,
        alt: "Selfless CE Student Self Service Portal Logo",
      },
    ],
  },
  verification: {
    google: "CWp1CoMCJwY7mM1h2Ds4IjRT6rRLqmNL3hy8-mU_MLQ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Selfless CE",
                "alternateName": [
                  "Selfless CE Organization",
                  "Selfless CE Student Self Service Portal",
                  "Selfless CE Tech Centers"
                ],
                "description": "Selfless CE is a multi-tenant educational organization operating multiple tech centers across Uganda. The organization provides a centralized student self-service portal for academic management, BYU-Idaho course tracking, tutor feedback, and student collaboration.",
                "url": "https://selfless-henna.vercel.app",
                "logo": "https://selfless-henna.vercel.app/freedom.png",
                "sameAs": [],
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Kampala",
                  "addressCountry": "UG"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+256 761 996 296",
                  "contactType": "customer service",
                  "areaServed": "Uganda",
                  "availableLanguage": "English"
                },
                "founder": {
                  "@type": "Person",
                  "name": "Nicholus Turyamureba",
                  "alternateName": "Atbriz",
                  "jobTitle": "Software Developer"
                },
                "subOrganization": [
                  {
                    "@type": "EducationalOrganization",
                    "name": "Freedom City Tech Center",
                    "description": "Freedom City Tech Center is a Selfless CE tech center serving students in Kampala, providing BYU-Idaho academic programs and technical education.",
                    "url": "https://selfless-henna.vercel.app",
                    "parentOrganization": {
                      "@type": "Organization",
                      "name": "Selfless CE"
                    }
                  },
                  {
                    "@type": "EducationalOrganization",
                    "name": "Mbale Tech Center",
                    "description": "Mbale Tech Center is a Selfless CE tech center serving students in Eastern Uganda, providing BYU-Idaho academic programs and technical education.",
                    "url": "https://selfless-henna.vercel.app",
                    "parentOrganization": {
                      "@type": "Organization",
                      "name": "Selfless CE"
                    }
                  },
                  {
                    "@type": "EducationalOrganization",
                    "name": "Masaka Tech Center",
                    "description": "Masaka Tech Center is a Selfless CE tech center serving students in Central Uganda, providing BYU-Idaho academic programs and technical education.",
                    "url": "https://selfless-henna.vercel.app",
                    "parentOrganization": {
                      "@type": "Organization",
                      "name": "Selfless CE"
                    }
                  },
                  {
                    "@type": "EducationalOrganization",
                    "name": "Jinja Tech Center",
                    "description": "Jinja Tech Center is a Selfless CE tech center serving students in Jinja, providing BYU-Idaho academic programs and technical education.",
                    "url": "https://selfless-henna.vercel.app",
                    "parentOrganization": {
                      "@type": "Organization",
                      "name": "Selfless CE"
                    }
                  },
                  {
                    "@type": "EducationalOrganization",
                    "name": "Ntinda Tech Center",
                    "description": "Ntinda Tech Center is a Selfless CE tech center serving students in Ntinda, Kampala, providing BYU-Idaho academic programs and technical education.",
                    "url": "https://selfless-henna.vercel.app",
                    "parentOrganization": {
                      "@type": "Organization",
                      "name": "Selfless CE"
                    }
                  },
                  {
                    "@type": "EducationalOrganization",
                    "name": "Sseta Tech Center",
                    "description": "Sseta Tech Center is a Selfless CE tech center serving students in Sseta region, providing BYU-Idaho academic programs and technical education.",
                    "url": "https://selfless-henna.vercel.app",
                    "parentOrganization": {
                      "@type": "Organization",
                      "name": "Selfless CE"
                    }
                  },
                  {
                    "@type": "EducationalOrganization",
                    "name": "Lira Tech Center",
                    "description": "Lira Tech Center is a Selfless CE tech center serving students in Northern Uganda, providing BYU-Idaho academic programs and technical education.",
                    "url": "https://selfless-henna.vercel.app",
                    "parentOrganization": {
                      "@type": "Organization",
                      "name": "Selfless CE"
                    }
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Selfless CE Student Self Service Portal",
                "alternateName": "Selfless CE Portal",
                "url": "https://selfless-henna.vercel.app",
                "description": "The official centralized multi-tenant platform for students across all Selfless CE Tech Centers. Track BYU-Idaho courses, receive tutor feedback, manage academic progress, and collaborate with peers.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://selfless-henna.vercel.app/search?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Selfless CE"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Selfless CE Student Self Service Portal",
                "url": "https://selfless-henna.vercel.app",
                "description": "A centralized multi-tenant student portal for Selfless CE Organization. Students from Freedom City, Mbale, Masaka, Jinja, Ntinda, Sseta, and Lira Tech Centers use this platform to track BYU-Idaho courses, submit credits, receive tutor feedback, manage attendance, participate in chores, communicate with peers, and access organizational policies.",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web",
                "browserRequirements": "Requires JavaScript",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "featureList": [
                  "BYU-Idaho course tracking",
                  "Credit submission and management",
                  "Tutor feedback and grades",
                  "Attendance tracking",
                  "Daily chore management",
                  "Student communication",
                  "Academic collaboration",
                  "Policy handbook access",
                  "Profile management",
                  "Announcements system"
                ],
                "publisher": {
                  "@type": "Organization",
                  "name": "Selfless CE"
                },
                "author": {
                  "@type": "Person",
                  "name": "Nicholus Turyamureba",
                  "alternateName": "Atbriz"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "Selfless CE",
                "description": "Selfless CE is an educational organization operating multiple tech centers across Uganda, providing BYU-Idaho academic programs and technical education through a centralized student self-service portal.",
                "url": "https://selfless-henna.vercel.app",
                "educationalLevel": "Higher Education",
                "educationalUse": "Academic Management, Course Tracking, Student Portal",
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Academic Programs",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Course",
                        "name": "BYU-Idaho Online Courses",
                        "description": "Online courses from Brigham Young University-Idaho available to Selfless CE students"
                      }
                    }
                  ]
                },
                "areaServed": [
                  {
                    "@type": "City",
                    "name": "Kampala"
                  },
                  {
                    "@type": "City",
                    "name": "Mbale"
                  },
                  {
                    "@type": "City",
                    "name": "Masaka"
                  },
                  {
                    "@type": "City",
                    "name": "Jinja"
                  },
                  {
                    "@type": "City",
                    "name": "Ntinda"
                  },
                  {
                    "@type": "AdministrativeArea",
                    "name": "Sseta"
                  },
                  {
                    "@type": "City",
                    "name": "Lira"
                  }
                ]
              }
            ])
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <PWAInstall />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}