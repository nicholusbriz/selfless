import { NextRequest } from 'next/server';
import type { Server as HTTPServer } from 'http';
import { getSocketServer } from '@/lib/websocket-server';

type SocketRequest = NextRequest & {
  socket?: {
    server?: HTTPServer;
  };
};

// This is required for Socket.IO to work with Next.js App Router
export async function GET(req: NextRequest) {
  // Get the HTTP server from the request
  const server = (req as SocketRequest).socket?.server;
  
  if (server) {
    // Initialize Socket.IO with the server
    getSocketServer(server);
    console.log('[Socket.IO] Server initialized');
  } else {
    console.warn('[Socket.IO] No server found in request');
  }
  
  // Return a 101 Switching Protocols response for WebSocket upgrade
  return new Response(null, {
    status: 101,
    statusText: 'Switching Protocols',
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
    },
  });
}

// Optional: Handle POST requests if needed
export async function POST() {
  return new Response('OK', { status: 200 });
}
