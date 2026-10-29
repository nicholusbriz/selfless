import { getPartySocketManager } from './party-socket-manager';

let cachedTicket: { ticket: string; expiresAt: number } | null = null;

async function getPartyTicket(): Promise<string | undefined> {
  if (cachedTicket && cachedTicket.expiresAt > Date.now() + 10_000) {
    return cachedTicket.ticket;
  }

  try {
    const response = await fetch('/api/party-ticket', { cache: 'no-store' });
    if (!response.ok) return undefined;

    const ticket = (await response.json()) as {
      ticket?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof ticket.ticket !== 'string' ||
      typeof ticket.expiresAt !== 'number'
    ) {
      return undefined;
    }

    cachedTicket = { ticket: ticket.ticket, expiresAt: ticket.expiresAt };
    return ticket.ticket;
  } catch {
    return undefined;
  }
}

export async function createPartyServerSocket(room: string) {
  const manager = getPartySocketManager();
  return manager.getOrCreateConnection(room, {
    ticket: getPartyTicket,
  });
}

export async function createPublicPresenceSocket(userId: string) {
  const manager = getPartySocketManager();
  return manager.getOrCreateConnection('online-users', {
    userId,
  });
}