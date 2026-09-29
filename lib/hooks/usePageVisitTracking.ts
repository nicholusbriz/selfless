// lib/hooks/usePageVisitTracking.ts
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePageVisitTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page visit when pathname changes
    if (pathname) {
      // Send to analytics API (fire and forget, don't await)
      fetch('/api/analytics/page-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pagePath: pathname }),
      }).catch((error) => {
        // Silently fail - we don't want to break the user experience
        console.error('Failed to track page visit:', error);
      });
    }
  }, [pathname]);
}
