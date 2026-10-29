'use client';

import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPublicPresenceSocket } from '@/lib/party-socket';
import { getPartySocketManager } from '@/lib/party-socket-manager';

// Global singleton to track presence state across components
let globalPresenceState: {
  userId: string | null;
  users: OnlineUser[];
  socket: any | null;
  refCount: number;
} = {
  userId: null,
  users: [],
  socket: null,
  refCount: 0,
};

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
  user?: unknown;
  users?: unknown;
  resource?: unknown;
}

function getUserId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const userId = (value as { userId?: unknown }).userId;
  return typeof userId === 'string' ? userId : null;
}

export function useOnlineUsers(user: PresenceUser | null | undefined) {
  const [, forceUpdate] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;

    // Increment ref count
    globalPresenceState.refCount++;

    // If user changed or no socket, create new connection
    if (globalPresenceState.userId !== currentUserId || !globalPresenceState.socket) {
      globalPresenceState.userId = currentUserId;
      globalPresenceState.users = [];
      
      const initSocket = async () => {
        const socket = await createPublicPresenceSocket(currentUserId);
        if (!socket) return;

        const onlineUserIds = new Set<string>();

        const handleMessage = (event: MessageEvent<string>) => {
          try {
            const parsed: unknown = JSON.parse(event.data);
            if (!parsed || typeof parsed !== 'object') return;
            const message = parsed as PresenceMessage;

            if (message.type === 'current-online-users') {
              onlineUserIds.clear();
              if (Array.isArray(message.userIds)) {
                message.userIds.forEach(id => {
                  if (typeof id === 'string') onlineUserIds.add(id);
                });
              }
              fetchProfiles(Array.from(onlineUserIds));
            } else if (message.type === 'user-joined' && typeof message.userId === 'string') {
              onlineUserIds.add(message.userId);
              fetchProfiles([message.userId]);
            } else if (message.type === 'user-left' && typeof message.userId === 'string') {
              onlineUserIds.delete(message.userId);
              globalPresenceState.users = globalPresenceState.users.filter(u => u.userId !== message.userId);
              forceUpdate({});
            }
          } catch (error) {
            console.error('Failed to parse presence message:', error);
          }
        };

        const fetchProfiles = async (userIds: string[]) => {
          if (userIds.length === 0) return;
          const response = await fetch(`/api/users/presence?ids=${encodeURIComponent(userIds.join(','))}`, { cache: 'no-store' });
          if (!response.ok) return;
          const data: { users?: PresenceProfile[] } = await response.json();
          const users = (Array.isArray(data.users) ? data.users : []).map(profile => ({
            userId: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            fullName: `${profile.firstName} ${profile.lastName}`.trim(),
            image: profile.profileImageUrl,
            techCenter: profile.techCenter || undefined,
            connectedAt: new Date().toISOString(),
          }));
          globalPresenceState.users = users;
          forceUpdate({});
        };

        socket.addEventListener('message', handleMessage);
        socket.addEventListener('open', () => socket.send(JSON.stringify({ type: 'request-roster' })));
        
        globalPresenceState.socket = socket;
      };

      initSocket();
    }

    return () => {
      globalPresenceState.refCount--;
      if (globalPresenceState.refCount <= 0) {
        if (globalPresenceState.socket) {
          getPartySocketManager().releaseConnection('online-users');
          globalPresenceState.socket = null;
        }
        globalPresenceState.userId = null;
        globalPresenceState.users = [];
      }
    };
  }, [user?.id]);

  return globalPresenceState.userId === user?.id ? globalPresenceState.users : [];
}
