'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { OnlineUsersProvider } from '@/lib/contexts/OnlineUsersContext';

export function OnlineUsersProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <OnlineUsersProvider userId={user?.id}>{children}</OnlineUsersProvider>;
}
