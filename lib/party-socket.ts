import { getPartySocketManager } from './party-socket-manager';

export async function createPublicPresenceSocket(userId: string) {
  const manager = getPartySocketManager();
  return manager.getOrCreateConnection('online-users', {
    userId,
  });
}