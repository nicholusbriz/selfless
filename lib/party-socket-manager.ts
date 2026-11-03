import PartySocket from 'partysocket';

interface ConnectionInfo {
  socket: PartySocket;
  refCount: number;
  persistent: boolean;
  userId: string;
}

class PartySocketManager {
  private connections = new Map<string, ConnectionInfo>();

  async getOrCreateConnection(
    room: string,
    options: { userId: string; persistent?: boolean },
  ): Promise<PartySocket | null> {
    const host = process.env.NEXT_PUBLIC_PARTYSERVER_HOST;

    if (!host && process.env.NODE_ENV === 'production') {
      return null;
    }

    const connectionKey = room;

    // Check if we already have a connection to this room
    const existing = this.connections.get(connectionKey);
    if (
      existing &&
      existing.userId === options.userId &&
      existing.socket.readyState !== WebSocket.CLOSING &&
      existing.socket.readyState !== WebSocket.CLOSED
    ) {
      console.info('[socket-manager] Reusing existing connection for room:', room);
      existing.refCount++;
      return existing.socket;
    }

    // Replace stale, closed, or differently-authenticated connections.
    if (existing) {
      console.info('[socket-manager] Replacing stale connection for room:', room);
      existing.socket.close();
      this.connections.delete(connectionKey);
    }

    // Create new connection
    console.info('[socket-manager] Creating new connection for room:', room);
    const socket = new PartySocket({
      host: host || 'localhost:8787',
      party: 'main',
      room,
      query: { userId: options.userId },
    });

    this.connections.set(connectionKey, {
      socket,
      refCount: 1,
      persistent: options.persistent || false,
      userId: options.userId,
    });

    return socket;
  }

  releaseConnection(room: string): void {
    const connection = this.connections.get(room);
    if (!connection) return;

    connection.refCount--;

    // Don't close persistent connections
    if (connection.persistent) {
      console.info('[socket-manager] Persistent connection, not closing:', room);
      return;
    }

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
