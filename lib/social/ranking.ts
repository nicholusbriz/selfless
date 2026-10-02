// lib/social/ranking.ts
// Followers-first, likes as tie-breaker, name for stability.

import type { Rankable } from '@/lib/social/types';

export function compareFollowersThenLikes(a: Rankable, b: Rankable): number {
  const af = a.followersCount || 0;
  const bf = b.followersCount || 0;
  if (bf !== af) return bf - af;

  const al = Math.max(0, a.likesReceivedCount || 0);
  const bl = Math.max(0, b.likesReceivedCount || 0);
  if (bl !== al) return bl - al;

  const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
  const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
  return nameA.localeCompare(nameB);
}

export function rankByTrending<T extends Rankable>(list: T[]): T[] {
  return [...list]
    .filter((u) => (u.followersCount || 0) > 0 || (u.likesReceivedCount || 0) > 0)
    .sort(compareFollowersThenLikes);
}
