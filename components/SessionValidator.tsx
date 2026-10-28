'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { readJsonObject } from '@/lib/api-response';

export function SessionValidator() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const checkTokenVersion = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          // If auth fails, sign out
          await signOut({ redirect: true, callbackUrl: '/' });
          return;
        }

        const data = await readJsonObject(response);

        // If tokenVersion doesn't match, sign out
        if (data.tokenVersion !== session.user.tokenVersion) {
          await signOut({ redirect: true, callbackUrl: '/' });
        }
      } catch (error) {
        console.error('Error checking token version:', error);
      }
    };

    // Check immediately on mount
    checkTokenVersion();

    // Check on window focus (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  return null;
}
