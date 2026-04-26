import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: 'https://selfless-oev0or5tk-nicholusbrizs-projects.vercel.app',
  title: {
    default: "Freedom City Tech Center - Professional Registration System",
    template: "%s | Freedom City Tech Center"
  },
  description: "Professional cleaning and course registration system for Freedom City Tech Center. Developed by Atbriz Nicholus Software Developer in Kampala, Uganda. Streamline student registrations, track cleaning schedules, and manage course credits efficiently.",
  keywords: [
    "Freedom City Tech Center",
    "cleaning registration",
    "course registration",
    "student management",
    "Atbriz Nicholus",
    "software developer Kampala Uganda",
    "tech center management",
    "education management system",
    "student tracking",
    "course credits",
    "cleaning schedule",
    "Nicholus Turyamureba",
    "Selfless ce organisation",
    "professional registration system"
  ] as string[],
  authors: [{ name: "Atbriz Nicholus", url: "https://selfless-oev0or5tk-nicholusbrizs-projects.vercel.app" }],
  creator: "Atbriz Nicholus Software Developer",
  publisher: "Freedom City Tech Center",
  icons: {
    icon: [
      { url: "/favicon.ico.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico.png",
    apple: [
      { url: "/favicon.ico.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
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
  verification: {
    google: "googlec261d0559dd1f6cb.html",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Freedom City Tech Center",
    startupImage: [
      {
        url: "/freedom.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    siteName: "Freedom City Tech Center",
    title: "Freedom City Tech Center - Professional Registration System",
    description: "Professional cleaning and course registration system developed by Atbriz Nicholus Software Developer in Kampala, Uganda. Streamline student registrations and management.",
    url: "https://selfless-oev0or5tk-nicholusbrizs-projects.vercel.app",
    locale: "en_US",
    images: [
      {
        url: "/freedom.png",
        width: 1200,
        height: 630,
        alt: "Freedom City Tech Center - Professional Registration System",
        type: "image/png",
      },
      {
        url: "/freedom.png",
        width: 512,
        height: 512,
        alt: "Freedom City Tech Center Logo",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freedom City Tech Center - Professional Registration System",
    description: "Professional cleaning and course registration system by Atbriz Nicholus Software Developer Kampala Uganda",
    site: "@freedomcitytech",
    creator: "@atbrizdev",
    images: [
      {
        url: "/freedom.png",
        width: 1200,
        height: 630,
        alt: "Freedom City Tech Center",
      }
    ],
  },
  other: {
    "author": "Atbriz Nicholus Software Developer",
    "developer": "Atbriz Nicholus",
    "developer-email": "atbriz256@gmail.com",
    "developer-location": "Kampala, Uganda",
    "developer-website": "https://selfless-oev0or5tk-nicholusbrizs-projects.vercel.app",
    "contact-email": "atbriz256@gmail.com",
    "organization": "Freedom City Tech Center",
    "category": "Education, Technology, Software Development"
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
