'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function PageTracker() {
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!pathname) return;

    // Fire-and-forget. Endpoint dedupes within 24h,
    // so repeat calls for the same page are cheap.
    void fetch('/api/user/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagePath: pathname }),
      keepalive: true,
    }).catch(() => {
      // Tracking failures never break the app
    });
  }, [pathname, status]);

  return null;
}