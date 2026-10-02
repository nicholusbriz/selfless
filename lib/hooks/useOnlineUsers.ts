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
        'PartyKit presence is disabled because NEXT_PUBLIC_PARTYKIT_HOST is not configured.'
      );
      return;
    }

    let socket: Awaited<ReturnType<typeof createPartySocket>> = null;
    let disposed = false;
    const onlineUserIds = new Set<string>();

    const fetchPresenceUsers = async (userIds: string[]) => {
      if (userIds.length === 0) return [];

      console.info('[presence-client] Fetching online profiles.', {
        requestedCount: userIds.length,
      });
      const response = await fetch(
        `/api/users/presence?ids=${encodeURIComponent(userIds.join(','))}`,
        { cache: 'no-store' },
      );
      if (!response.ok) {
        console.error('[presence-client] Profile request failed.', {
          status: response.status,
        });
        throw new Error('Failed to fetch online user profiles');
      }

      const data = await response.json();
      const users = (Array.isArray(data.users) ? data.users : []).map(
        (presenceUser: PresenceProfile) => ({
          userId: presenceUser.id,
          firstName: presenceUser.firstName,
          lastName: presenceUser.lastName,
          fullName: `${presenceUser.firstName} ${presenceUser.lastName}`.trim(),
          image: presenceUser.profileImageUrl,
          techCenter: presenceUser.techCenter || undefined,
          connectedAt: new Date().toISOString(),
        }),
      ) as OnlineUser[];
      console.info('[presence-client] Online profiles received.', {
        returnedCount: users.length,
      });
      return users;
    };

    const refreshPresenceUsers = async (userIds: string[]) => {
      try {
        const fetchedUsers = await fetchPresenceUsers(userIds);
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
        const data = JSON.parse(event.data);
        console.info('[presence-client] PartyKit message received.', {
          type: typeof data?.type === 'string' ? data.type : 'unknown',
          userCount: Array.isArray(data?.userIds) ? data.userIds.length : undefined,
        });

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
          setPresenceState((previousState) => ({
            userId: currentUserId,
            users: (
              previousState?.userId === currentUserId
                ? previousState.users
                : []
            )
              .filter((onlineUser) => onlineUser.userId !== data.userId),
          }));
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

    const handleOpen = () => {
      console.info('[presence-client] PartyKit WebSocket connected.');
    };

    const handleClose = (event: CloseEvent) => {
      console.warn('[presence-client] PartyKit WebSocket closed.', {
        code: event.code,
        wasClean: event.wasClean,
      });
    };

    void createPartySocket('online-users').then((connectedSocket) => {
      if (!connectedSocket || disposed) {
        if (!connectedSocket) {
          console.error('[presence-client] PartyKit socket was not created.');
        }
        connectedSocket?.close();
        return;
      }

      socket = connectedSocket;
      socket.addEventListener('open', handleOpen);
      socket.addEventListener('message', handleMessage);
      socket.addEventListener('error', handleError);
      socket.addEventListener('close', handleClose);
    }).catch((error: unknown) => {
      console.error('[presence-client] Failed to create PartyKit socket.', error);
    });

    return () => {
      disposed = true;
      socket?.removeEventListener('open', handleOpen);
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
