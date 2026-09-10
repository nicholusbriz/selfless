import type { PartyKitServer } from "partykit/server";

interface UserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  image?: string | null;
  techCenter?: {
    id: string;
    name: string;
  };
  connectedAt: string;
}

// In-memory storage for online users
const onlineUsers = new Map<string, UserInfo>();
const socketToUser = new Map<string, string>();
const userSockets = new Map<string, Set<string>>();

export default {
  async onConnect(ws, room) {
    console.log(`User connected: ${ws.id}`);
    
    // Extract user info from URL query parameters
    const url = new URL(ws.uri);
    const userParam = url.searchParams.get('user');
    
    if (userParam) {
      try {
        const userInfo: UserInfo = JSON.parse(userParam);
        userInfo.connectedAt = new Date().toISOString();
        
        console.log('User info from URL:', userInfo);
        
        const sockets = userSockets.get(userInfo.userId) || new Set<string>();
        sockets.add(ws.id);
        userSockets.set(userInfo.userId, sockets);
        socketToUser.set(ws.id, userInfo.userId);

        // Broadcast only when this is the user's first connection.
        if (!onlineUsers.has(userInfo.userId)) {
          onlineUsers.set(userInfo.userId, userInfo);

          room.broadcast(JSON.stringify({
            type: "user-joined",
            user: userInfo,
          }));
        }
      } catch (e) {
        console.error('Failed to parse user info:', e);
      }
    }
    
    // Send current online users
    const usersArray = Array.from(onlineUsers.values());
    ws.send(JSON.stringify({
      type: "current-online-users",
      users: usersArray,
    }));
  },

  async onClose(ws, room) {
    console.log(`User disconnected: ${ws.id}`);
    
    const userId = socketToUser.get(ws.id);
    if (userId) {
      socketToUser.delete(ws.id);

      const sockets = userSockets.get(userId);
      sockets?.delete(ws.id);

      // A user remains online while at least one tab is connected.
      if (sockets && sockets.size > 0) return;

      userSockets.delete(userId);
      onlineUsers.delete(userId);
      room.broadcast(JSON.stringify({
        type: "user-left",
        userId,
      }));
    }
  },

  async onRequest() {
    return new Response("PartyKit server running");
  },
} satisfies PartyKitServer;
