'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

// Create a client with PWA-optimized settings
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // PWA Optimizations:
        staleTime: 5 * 60 * 1000, // 5 minutes - perfect for mobile
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors (client faults)
          const err = error as { status?: number };
          if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) return false;
          // Retry up to 2 times for network issues
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false, // Better for mobile battery
        refetchOnReconnect: true,   // Important for PWA offline/online transitions
        networkMode: 'online',      // Only fetch when online
      },
      mutations: {
        retry: 1, // Retry mutations once for network issues
        networkMode: 'online',
      },
    },
  });
}

// AuthSync component to sync auth state on page load
function AuthSync() {
  const { fetchUser, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // If localStorage says authenticated but we don't have user data, fetch it
    if (isAuthenticated && !user) {
      console.log('AuthSync: Fetching user data...');
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}