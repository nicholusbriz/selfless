'use client';

import { useEffect, useState } from 'react';
import PartySocket from 'partysocket';

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
  email?: string | null;
  profileImageUrl?: string | null;
  techCenter?: {
    id: string;
    name: string;
  } | null;
}

export function useOnlineUsers(user: PresenceUser | null | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const partyKitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

    if (!partyKitHost && process.env.NODE_ENV === 'production') {
      console.warn(
        'PartyKit presence is disabled because NEXT_PUBLIC_PARTYKIT_HOST is not configured.'
      );
      return;
    }

    const userInfo = {
      userId: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      image: user.profileImageUrl || null,
      techCenter: user.techCenter || undefined,
    };

    const socket = new PartySocket({
      room: 'online-users',
      host: partyKitHost || 'localhost:1999',
      query: { user: JSON.stringify(userInfo) },
    });

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'current-online-users') {
          setOnlineUsers(data.users || []);
        } else if (data.type === 'user-joined' && data.user) {
          setOnlineUsers((previous) => (
            previous.some((onlineUser) => onlineUser.userId === data.user.userId)
              ? previous
              : [...previous, data.user]
          ));
        } else if (data.type === 'user-left') {
          setOnlineUsers((previous) => (
            previous.filter((onlineUser) => onlineUser.userId !== data.userId)
          ));
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
          readyState: socket.readyState,
        }
      );
    };

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('error', handleError);
      socket.close();
    };
  }, [user?.id, user?.firstName, user?.lastName, user?.email, user?.profileImageUrl, user?.techCenter]);

  return user?.id ? onlineUsers : [];
}
