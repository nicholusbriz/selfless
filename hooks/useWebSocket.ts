import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

interface WebSocketHookReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
}

// Singleton socket instance
let globalSocket: Socket | null = null;
let globalSocketUser: string | null = null;

export const useWebSocket = (): WebSocketHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        globalSocketUser = null;
      }
      setIsConnected(false);
      return;
    }

    // Check if we need to create a new socket
    const userId = user.id;
    const shouldCreateSocket = !globalSocket || globalSocketUser !== userId;

    if (shouldCreateSocket) {
      // Disconnect existing socket if user changed
      if (globalSocket) {
        globalSocket.disconnect();
      }

      // Create new socket connection
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        path: '/api/socket',
        query: {
          userId: user.id,
          role: user.role?.name || 'student'
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      globalSocket = newSocket;
      globalSocketUser = userId;

      newSocket.on('connect', () => {
        console.log('WebSocket connected:', newSocket.id);
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setError(err);
        setIsConnected(false);
      });
    }

    // Set up listeners for the existing socket
    const socket = globalSocket;
    if (socket) {
      const handleConnect = () => {
        setIsConnected(true);
        setError(null);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
      };

      const handleError = (err: Error) => {
        setError(err);
        setIsConnected(false);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleError);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleError);
      };
    }
  }, [user]);

  return { socket: globalSocket, isConnected, error };
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

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, ...dependencies]);
};
