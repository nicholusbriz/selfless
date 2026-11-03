'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { createPublicPresenceSocket } from '@/lib/party-socket';

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

interface OnlineUsersContextValue {
  onlineUsers: OnlineUser[];
  isLoading: boolean;
  isConnected: boolean;
}

const OnlineUsersContext = createContext<OnlineUsersContextValue | undefined>(undefined);

interface OnlineUsersProviderProps {
  children: ReactNode;
  userId: string | null | undefined;
}

function uniqueOnlineUsers(users: OnlineUser[]): OnlineUser[] {
  return Array.from(new Map(users.map((user) => [user.userId, user])).values());
}

export function OnlineUsersProvider({ children, userId }: OnlineUsersProviderProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) {
      setOnlineUsers([]);
      setIsLoading(false);
      setIsConnected(false);
      return;
    }

    setOnlineUsers([]);
    setIsLoading(true);
    setIsConnected(false);
    let isEffectActive = true;
    let fetchTimeout: ReturnType<typeof setTimeout> | null = null;
    let cleanupSocket: (() => void) | null = null;

    const initSocket = async () => {
      const newSocket = await createPublicPresenceSocket(userId);
      if (!isEffectActive) return;
      if (!newSocket) {
        setIsLoading(false);
        setIsConnected(false);
        return;
      }

      const onlineUserIds = new Set<string>();
      const pendingProfileIds = new Set<string>();
      let replaceRosterOnFetch = false;

      const fetchProfiles = (userIds: string[], replaceRoster = false) => {
        if (userIds.length === 0) return;

        if (replaceRoster) {
          pendingProfileIds.clear();
          replaceRosterOnFetch = true;
        }
        userIds.forEach((id) => pendingProfileIds.add(id));

        if (fetchTimeout) {
          clearTimeout(fetchTimeout);
        }

        fetchTimeout = setTimeout(() => {
          const requestedIds = Array.from(pendingProfileIds);
          const replaceRoster = replaceRosterOnFetch;
          pendingProfileIds.clear();
          replaceRosterOnFetch = false;

          void (async () => {
            try {
              const response = await fetch(
                `/api/users/presence?ids=${encodeURIComponent(requestedIds.join(','))}`,
                { cache: 'no-store' }
              );
              if (!response.ok || !isEffectActive) return;

              const data: { users?: PresenceProfile[] } = await response.json();
              const users = uniqueOnlineUsers(
                (Array.isArray(data.users) ? data.users : [])
                  .filter((profile) => onlineUserIds.has(profile.id))
                  .map((profile) => ({
                    userId: profile.id,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
                    image: profile.profileImageUrl,
                    techCenter: profile.techCenter || undefined,
                    connectedAt: new Date().toISOString(),
                  })),
              );

              setOnlineUsers((previous) => {
                const nextUsers = uniqueOnlineUsers(
                  replaceRoster ? users : [...previous, ...users],
                ).filter((onlineUser) => onlineUserIds.has(onlineUser.userId));
                return nextUsers;
              });
            } catch (error) {
              console.error('Failed to fetch presence profiles:', error);
            }
          })();
        }, 300);
      };

      const handleMessage = (event: MessageEvent<string>) => {
        if (!isEffectActive) return;
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
            if (onlineUserIds.size === 0) {
              setOnlineUsers([]);
            } else {
              fetchProfiles(Array.from(onlineUserIds), true);
            }
          } else if (message.type === 'user-joined' && typeof message.userId === 'string') {
            onlineUserIds.add(message.userId);
            fetchProfiles([message.userId]);
          } else if (message.type === 'user-left' && typeof message.userId === 'string') {
            onlineUserIds.delete(message.userId);
            setOnlineUsers((previous) => {
              return previous.filter((user) => user.userId !== message.userId);
            });
          }
        } catch (error) {
          console.error('Failed to parse presence message:', error);
        }
      };

      const handleOpen = () => {
        if (!isEffectActive) return;
        console.log('[online-users] Socket connected');
        setIsConnected(true);
        newSocket.send(JSON.stringify({ type: 'request-roster' }));
        setIsLoading(false);
      };

      const handleClose = () => {
        if (!isEffectActive) return;
        cleanupSocket?.();
        cleanupSocket = null;
        console.log('[online-users] Socket disconnected, attempting reconnect...');
        setIsConnected(false);
        setOnlineUsers([]);
        setIsLoading(false);
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[online-users] Reconnecting...');
          void initSocket();
        }, 3000);
      };

      newSocket.addEventListener('message', handleMessage);
      newSocket.addEventListener('open', handleOpen);
      newSocket.addEventListener('close', handleClose);
      cleanupSocket = () => {
        newSocket.removeEventListener('message', handleMessage);
        newSocket.removeEventListener('open', handleOpen);
        newSocket.removeEventListener('close', handleClose);
      };

      if (newSocket.readyState === WebSocket.OPEN) {
        handleOpen();
      }

    };

    void initSocket();

    return () => {
      isEffectActive = false;
      cleanupSocket?.();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
      // Don't release the connection on unmount - keep it alive
      // Only release if explicitly needed
    };
  }, [userId]);

  const value: OnlineUsersContextValue = {
    onlineUsers,
    isLoading,
    isConnected,
  };

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export function useOnlineUsersContext(): OnlineUsersContextValue {
  const context = useContext(OnlineUsersContext);
  if (context === undefined) {
    throw new Error('useOnlineUsersContext must be used within OnlineUsersProvider');
  }
  return context;
}
