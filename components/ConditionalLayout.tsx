"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Header } from '@/app/components/ui/header-2';
import Footer from '@/components/Footer';

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
