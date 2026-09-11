import PartySocket from 'partysocket';

export function createPartySocket(room: string) {
  const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

  if (!host && process.env.NODE_ENV === 'production') {
    return null;
  }

  return new PartySocket({
    host: host || 'localhost:1999',
    party: 'main',
    room,
  });
}