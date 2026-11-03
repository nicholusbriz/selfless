'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { OnlineUsersProvider } from '@/lib/contexts/OnlineUsersContext';
import PersistentPublicHeader from '@/app/components/PersistentPublicHeader';

export function OnlineUsersProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <OnlineUsersProvider userId={user?.id}>
      <PersistentPublicHeader />
      {children}
    </OnlineUsersProvider>
  );
}
