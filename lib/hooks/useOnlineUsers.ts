'use client';

import {
  useOnlineUsersContext,
  type OnlineUser,
} from '@/lib/contexts/OnlineUsersContext';

export type { OnlineUser } from '@/lib/contexts/OnlineUsersContext';

interface PresenceUser {
  id?: string | null;
}

export function useOnlineUsers(user: PresenceUser | null | undefined) {
  const { onlineUsers, isLoading } = useOnlineUsersContext();

  return {
    users: user?.id
      ? onlineUsers.filter((onlineUser) => onlineUser.userId !== user.id)
      : [],
    isLoading: Boolean(user?.id) && isLoading,
  };
}
