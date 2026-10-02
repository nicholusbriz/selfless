import PartySocket from 'partysocket';

let cachedTicket: { ticket: string; expiresAt: number } | null = null;

async function getPartyTicket(): Promise<string | null> {
  if (cachedTicket && cachedTicket.expiresAt > Date.now() + 10_000) {
    return cachedTicket.ticket;
  }

  try {
    const response = await fetch('/api/partykit-ticket', { cache: 'no-store' });
    if (!response.ok) return null;

    const ticket = (await response.json()) as {
      ticket?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof ticket.ticket !== 'string' ||
      typeof ticket.expiresAt !== 'number'
    ) {
      return null;
    }

    cachedTicket = { ticket: ticket.ticket, expiresAt: ticket.expiresAt };
    return ticket.ticket;
  } catch {
    return null;
  }
}

export async function createPartySocket(room: string) {
  const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

  if (!host && process.env.NODE_ENV === 'production') {
    return null;
  }

  return new PartySocket({
    host: host || 'localhost:1999',
    party: 'main',
    room,
    query: async () => {
      const ticket = await getPartyTicket();
      return ticket ? { ticket } : {};
    },
  });
}

export function createPublicPresenceSocket(userId: string) {
  const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

  if (!host && process.env.NODE_ENV === 'production') {
    return null;
  }

  return new PartySocket({
    host: host || 'localhost:1999',
    party: 'main',
    room: 'online-users',
    query: { userId },
  });
}