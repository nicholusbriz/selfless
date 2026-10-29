import PartySocket from 'partysocket';

interface ConnectionInfo {
  socket: PartySocket;
  refCount: number;
}

class PartySocketManager {
  private connections = new Map<string, ConnectionInfo>();

  async getOrCreateConnection(
    room: string,
    options: {
      userId?: string;
      ticket?: string | (() => Promise<string | undefined>);
    } = {},
  ): Promise<PartySocket | null> {
    const host = process.env.NEXT_PUBLIC_PARTYSERVER_HOST;

    if (!host && process.env.NODE_ENV === 'production') {
      return null;
    }

    const connectionKey = room;

    console.info('[socket-manager] Getting connection for room:', room, 'with options:', options);

    // Check if we already have a connection to this room
    const existing = this.connections.get(connectionKey);
    if (existing && existing.socket.readyState === WebSocket.OPEN) {
      console.info('[socket-manager] Reusing existing connection for room:', room);
      existing.refCount++;
      return existing.socket;
    }

    // Clean up closed connections
    if (existing && existing.socket.readyState !== WebSocket.OPEN) {
      console.info('[socket-manager] Cleaning up closed connection for room:', room);
      existing.socket.close();
      this.connections.delete(connectionKey);
    }

    // Create new connection
    console.info('[socket-manager] Creating new connection for room:', room);
    const socket = new PartySocket({
      host: host || 'localhost:8787',
      party: 'main',
      room,
      query: async () => {
        if (options.userId) {
          console.info('[socket-manager] Using userId query param:', options.userId);
          return { userId: options.userId };
        }
        if (typeof options.ticket === 'function') {
          const ticket = await options.ticket();
          console.info('[socket-manager] Using ticket query param:', ticket ? 'present' : 'missing');
          return ticket ? { ticket } : {};
        }
        if (options.ticket) {
          console.info('[socket-manager] Using ticket query param (static):', options.ticket);
          return { ticket: options.ticket };
        }
        console.info('[socket-manager] No auth params provided');
        return {};
      },
    });

    this.connections.set(connectionKey, {
      socket,
      refCount: 1,
    });

    return socket;
  }

  releaseConnection(room: string): void {
    const connection = this.connections.get(room);
    if (!connection) return;

    connection.refCount--;

    if (connection.refCount <= 0) {
      connection.socket.close();
      this.connections.delete(room);
    }
  }

  // Close all connections (useful for cleanup)
  closeAll(): void {
    for (const [room, connection] of this.connections) {
      connection.socket.close();
    }
    this.connections.clear();
  }
}

// Singleton instance
let managerInstance: PartySocketManager | null = null;

export function getPartySocketManager(): PartySocketManager {
  if (!managerInstance) {
    managerInstance = new PartySocketManager();
  }
  return managerInstance;
}
