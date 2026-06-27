import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';

export type NextApiResponseWithSocket = NextApiRequest & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | null = null;

export const getSocketServer = (server: HTTPServer): SocketIOServer => {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join user-specific room
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        socket.join(`user:${userId}`);
      }

      // Join role-specific rooms
      const userRole = socket.handshake.query.role as string;
      if (userRole) {
        socket.join(`role:${userRole}`);
      }

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return io;
};

export const broadcastToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const broadcastToRole = (role: string, event: string, data: any) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

export const broadcastToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
