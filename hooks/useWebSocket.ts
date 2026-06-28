import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { pusherClient, subscribeToUser, subscribeToRole, unsubscribeFromUser, unsubscribeFromRole } from '@/lib/pusher-client';
import type { Channel } from 'pusher-js';

interface WebSocketHookReturn {
  socket: Channel | null;
  isConnected: boolean;
  error: Error | null;
}

// Singleton channel instances
let userChannel: Channel | null = null;
let roleChannel: Channel | null = null;
let currentUserId: string | null = null;
let currentRole: string | null = null;

export const useWebSocket = (): WebSocketHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (userChannel) {
        unsubscribeFromUser(currentUserId || '');
        userChannel = null;
      }
      if (roleChannel) {
        unsubscribeFromRole(currentRole || '');
        roleChannel = null;
      }
      currentUserId = null;
      currentRole = null;
      setIsConnected(false);
      return;
    }

    const userId = user.id;
    const role = user.role?.name || 'student';
    const shouldReconnect = currentUserId !== userId || currentRole !== role;

    if (shouldReconnect) {
      // Unsubscribe from old channels
      if (userChannel && currentUserId) {
        unsubscribeFromUser(currentUserId);
      }
      if (roleChannel && currentRole) {
        unsubscribeFromRole(currentRole);
      }

      // Subscribe to new channels
      try {
        userChannel = subscribeToUser(userId);
        roleChannel = subscribeToRole(role);

        currentUserId = userId;
        currentRole = role;

        // Listen for connection state
        pusherClient.connection.bind('connected', () => {
          console.log('Pusher connected');
          setIsConnected(true);
          setError(null);
        });

        pusherClient.connection.bind('disconnected', () => {
          console.log('Pusher disconnected');
          setIsConnected(false);
        });

        pusherClient.connection.bind('error', (err: any) => {
          console.error('Pusher connection error:', err);
          setError(err);
          setIsConnected(false);
        });
      } catch (err) {
        console.error('Error subscribing to Pusher channels:', err);
        setError(err as Error);
        setIsConnected(false);
      }
    }

    return () => {
      // Cleanup connection listeners
      pusherClient.connection.unbind('connected');
      pusherClient.connection.unbind('disconnected');
      pusherClient.connection.unbind('error');
    };
  }, [user]);

  // Return the user channel as the primary socket
  return { socket: userChannel, isConnected, error };
};

export const useWebSocketEvent = <T = any>(
  event: string,
  callback: (data: T) => void,
  dependencies: any[] = []
) => {
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (data: T) => {
      callback(data);
    };

    socket.bind(event, handler);

    return () => {
      socket.unbind(event, handler);
    };
  }, [socket, event, ...dependencies]);
};
