import { NextApiRequest } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getSocketServer, NextApiResponseWithSocket } from '@/lib/websocket-server';

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    const httpServer: HTTPServer = res.socket.server as any;
    const io = getSocketServer(httpServer);
    res.socket.server.io = io;
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
