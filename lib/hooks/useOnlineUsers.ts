'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createPublicPresenceSocket,
} from '@/lib/partykit';

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
  role?: string | null;
}

interface PresenceProfile {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: {
    id: string;
    name: string;
  } | null;
}

export function useOnlineUsers(user: PresenceUser | null | undefined) {
  const [presenceState, setPresenceState] = useState<{
    userId: string;
    users: OnlineUser[];
  } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;
    const partyKitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

    if (!partyKitHost && process.env.NODE_ENV === 'production') {
      console.warn(
        'PartyKit presence is disabled because NEXT_PUBLIC_PARTYKIT_HOST is not configured.',
      );
      return;
    }

    let socket: ReturnType<typeof createPublicPresenceSocket> = null;
    let disposed = false;
    const onlineUserIds = new Set<string>();

    const fetchPresenceUsers = async (userIds: string[]) => {
      if (userIds.length === 0) return [];

      const response = await fetch(
        `/api/users/presence?ids=${encodeURIComponent(userIds.join(','))}`,
        { cache: 'no-store' },
      );
      if (!response.ok) {
        throw new Error(
          `Presence request failed with status ${response.status}`,
        );
      }

      const data: { users?: PresenceProfile[] } = await response.json();
      return (Array.isArray(data.users) ? data.users : []).map((profile) => ({
        userId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        image: profile.profileImageUrl,
        techCenter: profile.techCenter || undefined,
        connectedAt: new Date().toISOString(),
      }));
    };

    const refreshPresenceUsers = async (userIds: string[]) => {
      try {
        const fetchedUsers = await fetchPresenceUsers(userIds);
        if (disposed) return;

        setPresenceState((previousState) => {
          const previous =
            previousState?.userId === currentUserId ? previousState.users : [];
          const currentUsers = new Map(
            previous.map((onlineUser) => [onlineUser.userId, onlineUser]),
          );
          for (const onlineUser of fetchedUsers) {
            if (onlineUserIds.has(onlineUser.userId)) {
              currentUsers.set(onlineUser.userId, onlineUser);
            }
          }
          return {
            userId: currentUserId,
            users: Array.from(currentUsers.values()).filter((onlineUser) =>
              onlineUserIds.has(onlineUser.userId),
            ),
          };
        });
      } catch (error) {
        console.error('Failed to refresh online user profiles:', error);
      }
    };

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const data: unknown = JSON.parse(event.data);
        if (!data || typeof data !== 'object') return;
        const message = data as {
          type?: unknown;
          userId?: unknown;
          userIds?: unknown;
          resource?: unknown;
        };

        if (message.type === 'current-online-users') {
          onlineUserIds.clear();
          for (const id of Array.isArray(message.userIds) ? message.userIds : []) {
            if (typeof id === 'string') onlineUserIds.add(id);
          }
          void refreshPresenceUsers(Array.from(onlineUserIds));
        } else if (
          message.type === 'user-joined' &&
          typeof message.userId === 'string'
        ) {
          onlineUserIds.add(message.userId);
          void refreshPresenceUsers([message.userId]);
        } else if (
          message.type === 'user-left' &&
          typeof message.userId === 'string'
        ) {
          onlineUserIds.delete(message.userId);
          setPresenceState((previousState) => ({
            userId: currentUserId,
            users: (
              previousState?.userId === currentUserId
                ? previousState.users
                : []
            ).filter((onlineUser) => onlineUser.userId !== message.userId),
          }));
        } else if (
          message.type === 'invalidate' &&
          message.resource === 'profile' &&
          typeof message.userId === 'string' &&
          onlineUserIds.has(message.userId)
        ) {
          void refreshPresenceUsers([message.userId]);
        } else if (
          message.type === 'invalidate' &&
          message.resource === 'approvals' &&
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

    const handleError = (event: Event) => {
      console.warn('PartyKit public presence connection interrupted.', {
        eventType: event.type,
        readyState: socket?.readyState,
      });
    };

    const handleClose = (event: CloseEvent) => {
      console.warn('PartyKit public presence connection closed.', {
        code: event.code,
        wasClean: event.wasClean,
      });
    };

    socket = createPublicPresenceSocket(currentUserId);
    if (!socket) {
      console.error('Failed to create PartyKit public presence socket.');
      return;
    }

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);
    socket.addEventListener('close', handleClose);

    return () => {
      disposed = true;
      socket?.removeEventListener('message', handleMessage);
      socket?.removeEventListener('error', handleError);
      socket?.removeEventListener('close', handleClose);
      socket?.close();
    };
  }, [user?.id, user?.role, queryClient]);

  return presenceState && presenceState.userId === user?.id
    ? presenceState.users
    : [];
}
