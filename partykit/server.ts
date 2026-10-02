import type { PartyKitServer } from "partykit/server";
import { verifyPartyTicket } from "../lib/partykit-ticket";

interface OnlineUser {
  userId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default {
  async onConnect(ws, room) {
    const secret = room.env.PARTYKIT_SYNC_SECRET;
    const connectionUrl = new URL(ws.uri);
    const ticket = connectionUrl.searchParams.get("ticket");
    const publicPresenceUserId =
      room.id === "online-users"
        ? connectionUrl.searchParams.get("userId")
        : null;
    const userId =
      publicPresenceUserId && /^[a-f\d]{24}$/i.test(publicPresenceUserId)
        ? publicPresenceUserId
        : typeof secret === "string" && ticket
          ? await verifyPartyTicket(ticket, secret)
          : null;
    if (
      !userId ||
      (room.id !== "online-users" && room.id !== `user:${userId}`)
    ) {
      console.warn("[partykit] WebSocket connection rejected.", {
        room: room.id === "online-users" ? "online-users" : "user",
        reason:
          room.id === "online-users" && !publicPresenceUserId
            ? "missing-user-id"
            : room.id === "online-users" &&
                !/^[a-f\d]{24}$/i.test(publicPresenceUserId || "")
              ? "invalid-user-id"
              : typeof secret !== "string"
                ? "missing-secret"
                : !ticket
              ? "missing-ticket"
              : !userId
                ? "invalid-ticket"
                : "room-mismatch",
      });
      ws.close(1008, "Unauthorized");
      return;
    }

    ws.setState({ userId });
    if (room.id !== "online-users") return;

    const existingUserIds = new Set(
      Array.from(room.getConnections())
        .map((connection) =>
          (connection.state as OnlineUser | null)?.userId,
        )
        .filter((connectedUserId): connectedUserId is string => Boolean(connectedUserId)),
    );

    if (!existingUserIds.has(userId)) {
      room.broadcast(JSON.stringify({ type: "user-joined", userId }));
    }

    console.info("[partykit] Online-users WebSocket connected.", {
      onlineUserCount: new Set([...existingUserIds, userId]).size,
    });
    ws.send(JSON.stringify({
      type: "current-online-users",
      userIds: Array.from(new Set([...existingUserIds, userId])),
    }));
  },

  async onClose(ws, room) {
    if (room.id !== "online-users") return;

    const userId = (ws.state as OnlineUser | null)?.userId;
    if (!userId) return;

    const stillConnected = Array.from(room.getConnections()).some(
      (connection) =>
        connection.id !== ws.id &&
        (connection.state as OnlineUser | null)?.userId === userId,
    );
    if (!stillConnected) {
      room.broadcast(JSON.stringify({ type: "user-left", userId }));
    }
    console.info("[partykit] Online-users WebSocket closed.", {
      userStillConnected: stillConnected,
    });
  },

  async onRequest(request, room) {
    if (request.method === 'POST') {
      const secret = room.env.PARTYKIT_SYNC_SECRET;
      if (
        typeof secret !== 'string' ||
        request.headers.get('authorization') !== `Bearer ${secret}`
      ) {
        return new Response('Unauthorized', { status: 401 });
      }

      const event: unknown = await request.json().catch(() => null);
      if (!isRecord(event) || event.type !== 'invalidate') {
        console.warn('[partykit] Invalidation request rejected: invalid event.');
        return new Response('Invalid event', { status: 400 });
      }

      let invalidation: Record<string, string>;
      if (
        event.resource === 'messages' &&
        typeof event.conversationId === 'string'
      ) {
        invalidation = {
          type: 'invalidate',
          resource: 'messages',
          conversationId: event.conversationId,
        };
      } else if (
        (event.resource === 'profile' || event.resource === 'social') &&
        typeof event.userId === 'string'
      ) {
        invalidation = {
          type: 'invalidate',
          resource: event.resource,
          userId: event.userId,
        };
      } else if (event.resource === 'approvals') {
        invalidation = {
          type: 'invalidate',
          resource: 'approvals',
        };
      } else {
        return new Response('Invalid event', { status: 400 });
      }

      room.broadcast(JSON.stringify(invalidation));
      console.info('[partykit] Invalidation broadcast.', {
        room: room.id === 'online-users' ? 'online-users' : 'user',
        resource: invalidation.resource,
      });
      return new Response(null, { status: 204 });
    }

    return new Response('PartyKit server running', {
      headers: { 'Cache-Control': 'no-store' },
    });
  },
} satisfies PartyKitServer;
