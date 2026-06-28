'use client';

import Pusher from 'pusher-js';
import type { Channel } from 'pusher-js';

// Client-side Pusher instance
export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: '/api/pusher/auth',
  auth: {
    headers: {},
  },
});

// Channel naming helpers
export const getUserChannel = (userId: string) => `presence-user-${userId}`;
export const getRoleChannel = (role: string) => `presence-role-${role}`;

// Subscribe to user-specific channel
export const subscribeToUser = (userId: string): Channel => {
  const channel = pusherClient.subscribe(getUserChannel(userId));
  return channel;
};

// Subscribe to role-specific channel
export const subscribeToRole = (role: string): Channel => {
  const channel = pusherClient.subscribe(getRoleChannel(role));
  return channel;
};

// Unsubscribe from channels
export const unsubscribeFromUser = (userId: string) => {
  pusherClient.unsubscribe(getUserChannel(userId));
};

export const unsubscribeFromRole = (role: string) => {
  pusherClient.unsubscribe(getRoleChannel(role));
};
