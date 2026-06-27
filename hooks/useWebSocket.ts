import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

interface WebSocketHookReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
}

export const useWebSocket = (): WebSocketHookReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socket',
      query: {
        userId: user.id,
        role: user.role?.name || 'student'
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

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

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return { socket, isConnected, error };
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
  }, [socket, event, callback, ...dependencies]);
};
