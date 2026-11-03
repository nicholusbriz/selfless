'use client';

import {
  useOnlineUsersContext,
  type OnlineUser,
} from '@/lib/contexts/OnlineUsersContext';

export type { OnlineUser } from '@/lib/contexts/OnlineUsersContext';

interface PresenceUser {
  id?: string | null;
}

export function useOnlineUsers(
  user: PresenceUser | null | undefined,
  options: { includeCurrentUser?: boolean } = {},
) {
  const { onlineUsers, isLoading, isConnected } = useOnlineUsersContext();
  const uniqueUsers = Array.from(
    new Map(onlineUsers.map((onlineUser) => [onlineUser.userId, onlineUser])).values(),
  );

  return {
    users: !user?.id || !isConnected
      ? []
      : options.includeCurrentUser
        ? uniqueUsers
        : uniqueUsers.filter((onlineUser) => onlineUser.userId !== user.id),
    isLoading: Boolean(user?.id) && isLoading,
    isConnected: Boolean(user?.id) && isConnected,
  };
}
