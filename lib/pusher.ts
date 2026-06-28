// Server-side Pusher instance for broadcasting
import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Channel naming helpers
export const getUserChannel = (userId: string) => `presence-user-${userId}`;
export const getRoleChannel = (role: string) => `presence-role-${role}`;
