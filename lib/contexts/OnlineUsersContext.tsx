'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createPublicPresenceSocket } from '@/lib/party-socket';
import { getPartySocketManager } from '@/lib/party-socket-manager';

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
}

const OnlineUsersContext = createContext<OnlineUsersContextValue | undefined>(undefined);

interface OnlineUsersProviderProps {
  children: ReactNode;
  userId: string | null | undefined;
}

const STORAGE_KEY = 'online-users-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getUserId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const userId = (value as { userId?: unknown }).userId;
  return typeof userId === 'string' ? userId : null;
}

function loadFromCache(): OnlineUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return [];
    const { users, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return users || [];
  } catch {
    return [];
  }
}

function saveToCache(users: OnlineUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ users, timestamp: Date.now() })
    );
  } catch (error) {
    console.error('Failed to cache online users:', error);
  }
}

export function OnlineUsersProvider({ children, userId }: OnlineUsersProviderProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(() => loadFromCache());
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<any | null>(null);

  useEffect(() => {
    if (!userId) {
      setOnlineUsers([]);
      return;
    }

    setIsLoading(true);

    const initSocket = async () => {
      const newSocket = await createPublicPresenceSocket(userId);
      if (!newSocket) {
        setIsLoading(false);
        return;
      }

      const onlineUserIds = new Set<string>();
      let fetchTimeout: NodeJS.Timeout | null = null;

      const fetchProfiles = async (userIds: string[]) => {
        if (userIds.length === 0) return;
        
        // Debounce rapid successive calls
        if (fetchTimeout) {
          clearTimeout(fetchTimeout);
        }
        
        fetchTimeout = setTimeout(async () => {
          try {
            const response = await fetch(
              `/api/users/presence?ids=${encodeURIComponent(userIds.join(','))}`,
              { cache: 'no-store' }
            );
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
            
            setOnlineUsers(users);
            saveToCache(users);
          } catch (error) {
            console.error('Failed to fetch presence profiles:', error);
          }
        }, 300); // 300ms debounce
      };

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
            setOnlineUsers(prev => prev.filter(u => u.userId !== message.userId));
            saveToCache(onlineUsers.filter(u => u.userId !== message.userId));
          }
        } catch (error) {
          console.error('Failed to parse presence message:', error);
        }
      };

      newSocket.addEventListener('message', handleMessage);
      newSocket.addEventListener('open', () => {
        newSocket.send(JSON.stringify({ type: 'request-roster' }));
        setIsLoading(false);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socket) {
        getPartySocketManager().releaseConnection('online-users');
        setSocket(null);
      }
    };
  }, [userId]);

  const value: OnlineUsersContextValue = {
    onlineUsers,
    isLoading,
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
