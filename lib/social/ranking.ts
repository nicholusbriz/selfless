// lib/social/ranking.ts
// Profile image priority, then followers and likes as tie-breakers.

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

  // Priority 2: Followers count
  const af = a.followersCount || 0;
  const bf = b.followersCount || 0;
  if (bf !== af) return bf - af;

  // Priority 3: Likes count
  const al = Math.max(0, a.likesReceivedCount || 0);
  const bl = Math.max(0, b.likesReceivedCount || 0);
  if (bl !== al) return bl - al;

  // Priority 4: Name for stability
  const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
  const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
  return nameA.localeCompare(nameB);
}

export function compareSuperadminWithImageFirst(a: Rankable, b: Rankable): number {
  // Priority 1: Role hierarchy (super_admin > admin > tutor > student)
  const rolePriority: Record<string, number> = {
    super_admin: 4,
    admin: 3,
    teacher: 2,
    student: 1,
  };
  const aPriority = rolePriority[a.role || ''] || 0;
  const bPriority = rolePriority[b.role || ''] || 0;
  if (aPriority !== bPriority) {
    return bPriority - aPriority;
  }

  // Priority 2: Has profile image (within the same role, users with images come first)
  const aHasImage = !!(a.profileImageUrl && a.profileImageUrl.trim() !== '');
  const bHasImage = !!(b.profileImageUrl && b.profileImageUrl.trim() !== '');
  if (aHasImage !== bHasImage) {
    return bHasImage ? 1 : -1;
  }

  // Priority 3: Followers count (highest to lowest)
  const af = a.followersCount || 0;
  const bf = b.followersCount || 0;
  if (bf !== af) return bf - af;

  // Priority 4: Likes count (highest to lowest)
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
    .filter((u) =>
      !!(u.profileImageUrl && u.profileImageUrl.trim() !== '') &&
      ((u.followersCount || 0) > 0 ||
        (u.likesReceivedCount || 0) > 0 ||
        ((u.role === 'super_admin' || u.role === 'admin' || u.role === 'teacher') &&
          (u.role !== 'super_admin' || !!(u.previousTechCenterId))))
    )
    .sort(compareSuperadminWithImageFirst);
}

export function rankStudentsByTrending<T extends Rankable>(list: T[]): T[] {
  return [...list]
    .filter((u) =>
      !!(u.profileImageUrl && u.profileImageUrl.trim() !== '') &&
      (u.followersCount || 0) >= 2
    )
    .sort((a, b) => {
      const af = a.followersCount || 0;
      const bf = b.followersCount || 0;
      if (bf !== af) return bf - af;

      const al = a.likesReceivedCount || 0;
      const bl = b.likesReceivedCount || 0;
      if (bl !== al) return bl - al;

      const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
      const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
}

export function rankStudentsByTrendingCustom<T extends {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  followersCount: number;
  likesReceivedCount: number;
}>(list: T[]): T[] {
  return [...list]
    .filter((u) =>
      !!(u.profileImageUrl && u.profileImageUrl.trim() !== '') &&
      (u.followersCount || 0) >= 2
    )
    .sort((a, b) => {
      const af = a.followersCount || 0;
      const bf = b.followersCount || 0;
      if (bf !== af) return bf - af;

      const al = a.likesReceivedCount || 0;
      const bl = b.likesReceivedCount || 0;
      if (bl !== al) return bl - al;

      const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
      const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
}
