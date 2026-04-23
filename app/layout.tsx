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
  metadataBase: 'https://selfless-henna.vercel.app',
  title: "Selfless Ce Freedomcity Tech center",
  description: "Created by Atbriz Nicholus Software Developer at Byu ldaho",
  icons: {
    icon: "/favicon.ico.png",
    shortcut: "/favicon.ico.png",
    apple: "/favicon.ico.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Freedom City Tech Center",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Freedom City Tech Center",
    title: "Freedom City Tech Center - Cleaning Registration System",
    description: "Professional cleaning registration system for Freedom City Tech Center",
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
    title: "Freedom City Tech Center",
    description: "Professional cleaning registration system",
    images: ["/freedom.png"],
  },
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
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
