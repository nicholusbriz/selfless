'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export function SessionValidator() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const checkTokenVersion = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          // If auth fails, sign out
          await signOut({ redirect: true, callbackUrl: '/login' });
          return;
        }

        const data = await response.json();
        
        // If tokenVersion doesn't match, sign out
        if (data.tokenVersion !== session.user.tokenVersion) {
          await signOut({ redirect: true, callbackUrl: '/login' });
        }
      } catch (error) {
        console.error('Error checking token version:', error);
      }
    };

    // Check immediately on mount
    checkTokenVersion();

    // Check every 30 seconds
    const interval = setInterval(checkTokenVersion, 30000);

    return () => clearInterval(interval);
  }, [session]);

  return null;
}
