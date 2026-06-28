'use client';

import Pusher from 'pusher-js';
import type { Channel, PresenceChannel } from 'pusher-js';
import { useAuthStore } from '@/stores/authStore';

// Client-side Pusher instance
export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: '/api/pusher/auth',
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        const userId = useAuthStore.getState().user?.id;
        fetch(options.authEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-user-id': userId || ''
          },
          body: new URLSearchParams({
            socket_id: socketId,
            channel_name: channel.name
          })
        })
        .then(response => response.json())
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
      }
    };
  }
});

// Channel naming helpers
export const getUserChannel = (userId: string) => `private-user-${userId}`;
export const getRoleChannel = (role: string) => `presence-role-${role}`;
export const getOnlineUsersChannel = () => `presence-online-users`;

// Subscribe to user-specific private channel
export const subscribeToUser = (userId: string): PresenceChannel => {
  const channel = pusherClient.subscribe(getUserChannel(userId)) as PresenceChannel;
  return channel;
};

// Subscribe to role-specific presence channel
export const subscribeToRole = (role: string): PresenceChannel => {
  const channel = pusherClient.subscribe(getRoleChannel(role)) as PresenceChannel;
  return channel;
};

// Subscribe to shared online users presence channel
export const subscribeToOnlineUsers = (): PresenceChannel => {
  const channel = pusherClient.subscribe(getOnlineUsersChannel()) as PresenceChannel;
  return channel;
};

// Unsubscribe from channels
export const unsubscribeFromUser = (userId: string) => {
  pusherClient.unsubscribe(getUserChannel(userId));
};

export const unsubscribeFromRole = (role: string) => {
  pusherClient.unsubscribe(getRoleChannel(role));
};

export const unsubscribeFromOnlineUsers = () => {
  pusherClient.unsubscribe(getOnlineUsersChannel());
};
