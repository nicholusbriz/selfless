'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes - garbage collect after 10 minutes
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnReconnect: true, // Refetch when network reconnects
        retry: 3, // Retry failed requests 3 times
        retryDelay: 1000, // Wait 1 second between retries
      },
      mutations: {
        retry: 1, // Retry failed mutations once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
