import { useEffect } from 'react';

export function useActivityTracker() {
  useEffect(() => {
    // Heartbeat every 30 seconds
    const interval = setInterval(async () => {
      try {
        await fetch('/api/user/heartbeat', { method: 'POST' });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 30000);

    // Heartbeat on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetch('/api/user/heartbeat', { method: 'POST' }).catch((error) => {
          console.error('Heartbeat failed:', error);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}