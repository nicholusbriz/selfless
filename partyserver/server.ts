/// <reference types="@cloudflare/workers-types" />

import {
  routePartykitRequest,
  Server,
} from "partyserver";
import type {
  Connection,
  ConnectionContext,
} from "partyserver";
import { verifyPartyTicket } from "../lib/party-ticket";

interface OnlineUser {
  userId: string;
}

interface Invalidation {
  type: "invalidate";
  resource: "messages" | "profile" | "social" | "approvals";
  conversationId?: string;
  userId?: string;
}

interface Env extends Cloudflare.Env {
  Main: DurableObjectNamespace<MainServer>;
  PARTYSERVER_SYNC_SECRET: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    const secret = this.env.PARTYSERVER_SYNC_SECRET;
    const connectionUrl = new URL(context.request.url);
    const ticket = connectionUrl.searchParams.get("ticket");
    const publicPresenceUserId =
      this.name === "online-users"
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
      (this.name !== "online-users" && this.name !== `user:${userId}`)
    ) {
      console.warn("[partyserver] WebSocket connection rejected.", {
        room: this.name === "online-users" ? "online-users" : "user",
        reason:
          this.name === "online-users" && !publicPresenceUserId
            ? "missing-user-id"
            : this.name === "online-users" &&
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
      connection.close(1008, "Unauthorized");
      return;
    }

    connection.setState({ userId });
    if (this.name !== "online-users") return;

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
    if (this.name !== "online-users") return;

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
    if (request.method !== "POST") {
      return new Response("PartyServer server running", {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const secret = this.env.PARTYSERVER_SYNC_SECRET;
    if (
      typeof secret !== "string" ||
      request.headers.get("authorization") !== `Bearer ${secret}`
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    let event: unknown;
    try {
      event = await request.json();
    } catch {
      return new Response("Invalid event", { status: 400 });
    }
    if (!isRecord(event) || event.type !== "invalidate") {
      console.warn("[partyserver] Invalidation request rejected: invalid event.");
      return new Response("Invalid event", { status: 400 });
    }

    let invalidation: Invalidation;
    if (
      event.resource === "messages" &&
      typeof event.conversationId === "string"
    ) {
      invalidation = {
        type: "invalidate",
        resource: "messages",
        conversationId: event.conversationId,
      };
    } else if (
      (event.resource === "profile" || event.resource === "social") &&
      typeof event.userId === "string"
    ) {
      invalidation = {
        type: "invalidate",
        resource: event.resource,
        userId: event.userId,
      };
    } else if (event.resource === "approvals") {
      invalidation = { type: "invalidate", resource: "approvals" };
    } else {
      return new Response("Invalid event", { status: 400 });
    }

    this.safeBroadcast(JSON.stringify(invalidation));
    console.info("[partyserver] Invalidation broadcast.", {
      room: this.name === "online-users" ? "online-users" : "user",
      resource: invalidation.resource,
    });
    return new Response(null, { status: 204 });
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