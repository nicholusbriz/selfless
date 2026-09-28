'use client';

import { useEffect } from 'react';

export function ActivityTracker() {
  useEffect(() => {
    // Track activity every 30 seconds
    const interval = setInterval(async () => {
      try {
        await fetch('/api/user/activity', { method: 'POST' });
      } catch (error) {
        console.error('Activity tracking failed:', error);
      }
    }, 30000);

    // Track on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetch('/api/user/activity', { method: 'POST' }).catch((error) => {
          console.error('Activity tracking failed:', error);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
