/// <reference types="@cloudflare/workers-types" />

import {
  routePartykitRequest,
  Server,
} from "partyserver";
import type {
  Connection,
  ConnectionContext,
} from "partyserver";

interface OnlineUser {
  userId: string;
}

interface Env extends Cloudflare.Env {
  Main: DurableObjectNamespace<MainServer>;
}

export class MainServer extends Server<Env> {
  /**
   * Broadcast that tolerates dead connections.
   *
   * Partyserver's `this.broadcast()` calls `.send()` on every connection in
   * the room. After a page refresh the browser tears down the WebSocket
   * without a clean close handshake; the DO's connection set can still
   * contain that connection for a moment. Writing to it throws
   * "Network connection lost", which — uncaught — aborts the handler and
   * surfaces in the Worker logs. Guard each send individually.
   */
  private safeBroadcast(payload: string): void {
    for (const conn of this.getConnections()) {
      try {
        conn.send(payload);
      } catch {
        // Connection is already gone. Skip it.
      }
    }
  }

  async onConnect(
    connection: Connection<OnlineUser>,
    context: ConnectionContext,
  ): Promise<void> {
    // Only accept connections to the online-users room
    if (this.name !== "online-users") {
      console.warn("[partyserver] Connection rejected: only online-users room is supported");
      connection.close(1008, "Room not supported");
      return;
    }

    const connectionUrl = new URL(context.request.url);
    const userId = connectionUrl.searchParams.get("userId");

    // Validate userId is a valid MongoDB ObjectId format
    if (!userId || !/^[a-f\d]{24}$/i.test(userId)) {
      console.warn("[partyserver] Connection rejected: invalid or missing userId");
      connection.close(1008, "Invalid userId");
      return;
    }

    connection.setState({ userId });

    const existingUserIds = new Set(
      Array.from(this.getConnections<OnlineUser>())
        .filter((existingConnection) => existingConnection.id !== connection.id)
        .map((existingConnection) => existingConnection.state?.userId)
        .filter((connectedUserId): connectedUserId is string =>
          Boolean(connectedUserId),
        ),
    );

    if (!existingUserIds.has(userId)) {
      this.safeBroadcast(JSON.stringify({ type: "user-joined", userId }));
    }

    console.info("[partyserver] Online-users WebSocket connected.", {
      onlineUserCount: new Set([...existingUserIds, userId]).size,
    });

    try {
      connection.send(
        JSON.stringify({
          type: "current-online-users",
          userIds: Array.from(new Set([...existingUserIds, userId])),
        }),
      );
    } catch {
      // The joining connection vanished immediately (rare, but possible).
    }
  }

  async onClose(connection: Connection<OnlineUser>): Promise<void> {
    const userId = connection.state?.userId;
    if (!userId) return;

    const stillConnected = Array.from(this.getConnections<OnlineUser>()).some(
      (existingConnection) =>
        existingConnection.id !== connection.id &&
        existingConnection.state?.userId === userId,
    );
    if (!stillConnected) {
      this.safeBroadcast(JSON.stringify({ type: "user-left", userId }));
    }
    console.info("[partyserver] Online-users WebSocket closed.", {
      userStillConnected: stillConnected,
    });
  }

  async onRequest(request: Request): Promise<Response> {
    // Only handle GET requests for health checks
    if (request.method === "GET") {
      return new Response("PartyServer online-users running", {
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Reject all other requests (no invalidation endpoints)
    return new Response("Method not allowed", { status: 405 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;