import { useEffect } from 'react';

export function useActivityTracker(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/user/heartbeat', { method: 'POST' });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    void sendHeartbeat();
    const interval = setInterval(() => {
      void sendHeartbeat();
    }, 30000);

    // Heartbeat on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
}