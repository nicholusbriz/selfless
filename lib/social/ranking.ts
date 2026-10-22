// lib/social/ranking.ts
// Profile image priority, then followers, likes as tie-breaker, name for stability.

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

export function compareProfileImageFirst(a: Rankable, b: Rankable): number {
  // Priority 1: Has profile image (users with images come first)
  const aHasImage = !!(a.profileImageUrl && a.profileImageUrl.trim() !== '');
  const bHasImage = !!(b.profileImageUrl && b.profileImageUrl.trim() !== '');
  if (aHasImage !== bHasImage) {
    return bHasImage ? 1 : -1; // Users with images come first
  }

  // Priority 2: Profile views (if both have or both don't have images)
  const av = a.profileViewsCount || 0;
  const bv = b.profileViewsCount || 0;
  if (bv !== av) return bv - av;

  // Priority 3: Followers count
  const af = a.followersCount || 0;
  const bf = b.followersCount || 0;
  if (bf !== af) return bf - af;

  // Priority 4: Likes count
  const al = Math.max(0, a.likesReceivedCount || 0);
  const bl = Math.max(0, b.likesReceivedCount || 0);
  if (bl !== al) return bl - al;

  // Priority 5: Name for stability
  const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
  const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
  return nameA.localeCompare(nameB);
}

export function rankByTrending<T extends Rankable>(list: T[]): T[] {
  return [...list]
    .filter((u) => (u.followersCount || 0) > 0 || (u.likesReceivedCount || 0) > 0)
    .sort(compareProfileImageFirst);
}
