'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPublicPresenceSocket } from '@/lib/partykit';

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

interface PresenceMessage {
  type?: unknown;
  userId?: unknown;
  userIds?: unknown;
  resource?: unknown;
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

    const socket = createPublicPresenceSocket(currentUserId);
    if (!socket) {
      console.error('PartyKit presence socket could not be created.');
      return;
    }
    console.info('[presence] Connecting to PartyKit online-users room.');

    let disposed = false;
    const onlineUserIds = new Set<string>();

    const fetchPresenceUsers = async (
      userIds: string[],
    ): Promise<OnlineUser[]> => {
      if (userIds.length === 0) return [];

      console.info('[presence] Requesting online profiles.', {
        requestedCount: userIds.length,
      });
      const response = await fetch(
        `/api/users/presence?ids=${encodeURIComponent(userIds.join(','))}`,
        { cache: 'no-store' },
      );
      if (!response.ok) {
        console.error('[presence] Profile request failed.', {
          status: response.status,
        });
        throw new Error(
          `Presence profile request failed with status ${response.status}`,
        );
      }

      const data: { users?: PresenceProfile[] } = await response.json();
      const users = (Array.isArray(data.users) ? data.users : []).map((profile) => ({
        userId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        image: profile.profileImageUrl,
        techCenter: profile.techCenter || undefined,
        connectedAt: new Date().toISOString(),
      }));
      console.info('[presence] Online profiles received.', {
        returnedCount: users.length,
      });
      return users;
    };

    const refreshPresenceUsers = async (userIds: string[]) => {
      try {
        const fetchedUsers = await fetchPresenceUsers(userIds);
        if (disposed) return;

        setPresenceState((previousState) => {
          const previous =
            previousState?.userId === currentUserId ? previousState.users : [];
          const usersById = new Map(
            previous.map((onlineUser) => [onlineUser.userId, onlineUser]),
          );
          for (const onlineUser of fetchedUsers) {
            if (onlineUserIds.has(onlineUser.userId)) {
              usersById.set(onlineUser.userId, onlineUser);
            }
          }
          return {
            userId: currentUserId,
            users: Array.from(usersById.values()).filter((onlineUser) =>
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
        const parsed: unknown = JSON.parse(event.data);
        if (!parsed || typeof parsed !== 'object') return;
        const message = parsed as PresenceMessage;
        const messageType =
          typeof message.type === 'string' ? message.type : 'unknown';
        const userCount = Array.isArray(message.userIds)
          ? message.userIds.length
          : 'not-provided';
        console.info(
          `[presence] PartyKit message received: type=${messageType}; userCount=${userCount}`,
        );

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
      console.warn('PartyKit presence connection interrupted.', {
        eventType: event.type,
        readyState: socket.readyState,
      });
    };

    const handleOpen = () => {
      console.info('[presence] PartyKit WebSocket connected.');
    };

    const handleClose = (event: CloseEvent) => {
      console.warn('[presence] PartyKit WebSocket closed.', {
        code: event.code,
        wasClean: event.wasClean,
      });
    };

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);
    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);

    return () => {
      disposed = true;
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('error', handleError);
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('close', handleClose);
      socket.close();
    };
  }, [user?.id, user?.role, queryClient]);

  return presenceState && presenceState.userId === user?.id
    ? presenceState.users
    : [];
}
