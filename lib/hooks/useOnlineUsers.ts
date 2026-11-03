'use client';

import { useOnlineUsersContext } from '@/lib/contexts/OnlineUsersContext';
import type { OnlineUser } from '@/lib/contexts/OnlineUsersContext';

interface PresenceUser {
  id?: string | null;
  role?: string | null;
}

export function useOnlineUsers(user: PresenceUser | null | undefined): OnlineUser[] {
  const { onlineUsers } = useOnlineUsersContext();
  
  // Only return online users if the current user is authenticated
  return user?.id ? onlineUsers : [];
}
