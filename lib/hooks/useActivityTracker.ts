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

    // Heartbeat every 60s while the tab is visible
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void sendHeartbeat();
      }
    }, 60000);

    // Heartbeat on visibility change (user returns to tab), throttled
    let lastVisibilityBeat = 0;
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (
        document.visibilityState === 'visible' &&
        now - lastVisibilityBeat > 30000
      ) {
        lastVisibilityBeat = now;
        void sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
}