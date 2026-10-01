// lib/social/cacheKeys.ts
// Canonical cache keys + adapter contract for page-specific shapes.

import type { SocialPatch } from '@/lib/social/types';

export const socialKeys = {
  students: ['students'] as const,
  trending: ['social', 'trending'] as const,
  followers: (userId?: string) => ['connections', 'followers', userId] as const,
  following: (userId?: string) => ['connections', 'following', userId] as const,
  likes: (userId?: string) => ['connections', 'likes', userId] as const,
  userStats: (userId?: string) => ['currentUserStats', userId] as const,
} as const;

export interface PageCacheAdapter {
  queryKey: readonly unknown[];
  patch: (old: unknown, targetId: string, patch: SocialPatch) => unknown;
  find?: (old: unknown, targetId: string) => any | undefined;
}
