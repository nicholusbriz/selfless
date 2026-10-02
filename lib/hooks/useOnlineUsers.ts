'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPartySocket } from '@/lib/partykit';

export interface OnlineUser {
  userId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  image?: string | null;
  techCenter?: {
    id: string;
    name: string;
  };
  connectedAt: string;
}

interface PresenceUser {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  profileImageUrl?: string | null;
  techCenter?: {
    id: string;
    name: string;
  } | null;
}

export function useOnlineUsers(user: PresenceUser | null | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) {
      setOnlineUsers([]);
      return;
    }

    const partyKitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

    if (!partyKitHost && process.env.NODE_ENV === 'production') {
      console.warn(
        'PartyKit presence is disabled because NEXT_PUBLIC_PARTYKIT_HOST is not configured.'
      );
      return;
    }

    let socket: Awaited<ReturnType<typeof createPartySocket>> = null;
    let disposed = false;
    const onlineUserIds = new Set<string>();

    const fetchPresenceUsers = async (userIds: string[]) => {
      if (userIds.length === 0) return [];

      const response = await fetch(
        `/api/users/presence?ids=${encodeURIComponent(userIds.join(','))}`,
        { cache: 'no-store' },
      );
      if (!response.ok) throw new Error('Failed to fetch online user profiles');

      const data = await response.json();
      return (Array.isArray(data.users) ? data.users : []).map(
        (presenceUser: Omit<OnlineUser, 'userId' | 'image' | 'fullName' | 'connectedAt'> & { id: string }) => ({
          userId: presenceUser.id,
          firstName: presenceUser.firstName,
          lastName: presenceUser.lastName,
          fullName: `${presenceUser.firstName} ${presenceUser.lastName}`.trim(),
          image: presenceUser.profileImageUrl,
          techCenter: presenceUser.techCenter || undefined,
          connectedAt: new Date().toISOString(),
        }),
      ) as OnlineUser[];
    };

    const refreshPresenceUsers = async (userIds: string[]) => {
      try {
        const fetchedUsers = await fetchPresenceUsers(userIds);
        setOnlineUsers((previous) => {
          const currentUsers = new Map(
            previous.map((onlineUser) => [onlineUser.userId, onlineUser]),
          );
          for (const onlineUser of fetchedUsers) {
            if (onlineUserIds.has(onlineUser.userId)) {
              currentUsers.set(onlineUser.userId, onlineUser);
            }
          }
          return Array.from(currentUsers.values()).filter((onlineUser) =>
            onlineUserIds.has(onlineUser.userId),
          );
        });
      } catch (error) {
        console.error('Failed to refresh online user profiles:', error);
      }
    };

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'current-online-users') {
          onlineUserIds.clear();
          for (const userId of Array.isArray(data.userIds) ? data.userIds : []) {
            if (typeof userId === 'string') onlineUserIds.add(userId);
          }
          void refreshPresenceUsers(Array.from(onlineUserIds));
        } else if (data.type === 'user-joined' && typeof data.userId === 'string') {
          onlineUserIds.add(data.userId);
          void refreshPresenceUsers([data.userId]);
        } else if (data.type === 'user-left') {
          onlineUserIds.delete(data.userId);
          setOnlineUsers((previous) => (
            previous.filter((onlineUser) => onlineUser.userId !== data.userId)
          ));
        } else if (
          data.type === 'invalidate' &&
          data.resource === 'profile' &&
          onlineUserIds.has(data.userId)
        ) {
          void refreshPresenceUsers([data.userId]);
        } else if (
          data.type === 'invalidate' &&
          data.resource === 'approvals' &&
          ['admin', 'super_admin', 'dev'].includes(user.role || '')
        ) {
          void queryClient.invalidateQueries({
            queryKey: ['super-admin-pending-approvals'],
          });
          void queryClient.invalidateQueries({
            queryKey: ['super-admin-approval-stats'],
          });
        }
      } catch (error) {
        console.error('Failed to parse presence message:', error);
      }
    };

    const handleError = (error: Event) => {
      console.warn(
        'PartyKit presence connection interrupted; the client will reconnect.',
        {
          eventType: error.type,
          readyState: socket?.readyState,
        }
      );
    };

    void createPartySocket('online-users').then((connectedSocket) => {
      if (!connectedSocket || disposed) {
        connectedSocket?.close();
        return;
      }

      socket = connectedSocket;
      socket.addEventListener('message', handleMessage);
      socket.addEventListener('error', handleError);
    });

    return () => {
      disposed = true;
      socket?.removeEventListener('message', handleMessage);
      socket?.removeEventListener('error', handleError);
      socket?.close();
    };
  }, [user?.id, user?.role, queryClient]);

  return user?.id ? onlineUsers : [];
}
