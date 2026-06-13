import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/components/QueryProvider';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: 'https://selfless-henna.vercel.app',
  title: "Freedom City Tech Center - Academic Dashboard",
  description: "Academic management system for Freedom City Tech Center - Track students, courses, and academic progress",
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
    title: "Freedom City Tech Center - Academic Dashboard",
    description: "Academic management system for Freedom City Tech Center - Track students, courses, and academic progress",
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
    title: "Freedom City Tech Center - Academic Dashboard",
    description: "Academic management system for Freedom City Tech Center",
    images: ["/freedom.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ServiceWorkerRegistration />
          <main className="flex-1">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}