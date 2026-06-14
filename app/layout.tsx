import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from '@/components/QueryProvider';
import PWAInstall from '@/components/PWAInstall';
import MusicButton from '@/components/MusicButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://selfless-henna.vercel.app'),
  title: "Freedom City Tech Center - Selfless CE | Academic Management System",
  description: "Freedom City Tech Center, Seeta Tech Center, Ntinda Teach Center, Masaka Teach Center, Jinja Tech Center, Mbale Tech Center, Kololo Stake Center, Kaboowa Tech Center - Academic management system by Selfless CE. Track students, courses, and academic progress. Developed by Nicholus Turyamureba (Atbriz) and Cyber Touch.",
  keywords: "Freedom City Tech Center, Seeta Tech Center, Ntinda Teach Center, Masaka Teach Center, Jinja Tech Center, Mbale Tech Center, Kololo Stake Center, Kaboowa Tech Center, Selfless CE, Nicholus Turyamureba, Atbriz, Cyber Touch, academic management, student tracking, course management, tech education, Uganda tech centers",
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
    title: "Freedom Tech",
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
    siteName: "Freedom City Tech Center",
    title: "Freedom City Tech Center - Selfless CE | Academic Management System",
    description: "Academic management system for Freedom City Tech Center, Seeta Tech Center, Ntinda Teach Center, Masaka Teach Center, Jinja Tech Center, Mbale Tech Center, Kololo Stake Center, Kaboowa Tech Center. Track students, courses, and academic progress. Developed by Nicholus Turyamureba (Atbriz) and Cyber Touch.",
    images: [
      {
        url: "/freedom.png",
        width: 512,
        height: 512,
        alt: "Freedom City Tech Center Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freedom City Tech Center - Selfless CE | Academic Management System",
    description: "Academic management system for Freedom City Tech Center, Seeta Tech Center, Ntinda Teach Center, Masaka Teach Center, Jinja Tech Center, Mbale Tech Center, Kololo Stake Center, Kaboowa Tech Center. Developed by Nicholus Turyamureba (Atbriz) and Cyber Touch.",
    images: ["/freedom.png"],
    creator: "@atbriz",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Freedom City Tech Center",
              "alternateName": [
                "Seeta Tech Center",
                "Ntinda Teach Center",
                "Masaka Teach Center",
                "Jinja Tech Center",
                "Mbale Tech Center",
                "Kololo Stake Center",
                "Kaboowa Tech Center"
              ],
              "description": "Academic management system for tech education centers in Uganda. Track students, courses, and academic progress.",
              "url": "https://selfless-henna.vercel.app",
              "logo": "https://selfless-henna.vercel.app/freedom.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+256 761 996 296",
                "contactType": "customer service",
                "email": "info@freedomcitytech.com",
                "areaServed": "Uganda",
                "availableLanguage": "English"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Freedom City Tech Center",
                "addressLocality": "Kampala",
                "addressCountry": "UG"
              },
              "founder": {
                "@type": "Person",
                "name": "Nicholus Turyamureba",
                "alternateName": "Atbriz",
                "jobTitle": "Software Developer"
              },
              "creator": {
                "@type": "Organization",
                "name": "Cyber Touch",
                "description": "Software development company"
              },
              "keywords": [
                "Freedom City Tech Center",
                "Seeta Tech Center",
                "Ntinda Teach Center",
                "Masaka Teach Center",
                "Jinja Tech Center",
                "Mbale Tech Center",
                "Kololo Stake Center",
                "Kaboowa Tech Center",
                "Selfless CE",
                "Nicholus Turyamureba",
                "Atbriz",
                "Cyber Touch",
                "academic management",
                "student tracking",
                "course management",
                "tech education",
                "Uganda tech centers"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <PWAInstall />
          <main className="flex-1">
            {children}
          </main>
          <MusicButton />
        </QueryProvider>
      </body>
    </html>
  );
}