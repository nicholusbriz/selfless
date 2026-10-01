// lib/social/attachStats.ts
/**
 * Shared stats helper.
 *
 * Given a viewer and a list of user IDs, returns a Map keyed by ID with
 * each user's live counts + the viewer's relationship to them.
 *
 * Used by:
 *   - /api/social/trending
 *   - /api/social/connections/[userId]
 *   - /api/social/likes/[userId]
 *
 * All counts are computed LIVE from Follow / Like / ProfileView documents.
 */

import { prisma } from '@/lib/prisma/client';

export interface UserStats {
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

export const EMPTY_STATS: UserStats = {
  followersCount: 0,
  followingCount: 0,
  likesReceivedCount: 0,
  profileViewsCount: 0,
  isFollowing: false,
  isLiked: false,
};

export async function getStatsForUsers(
  viewerId: string | null,
  userIds: string[],
): Promise<Map<string, UserStats>> {
  if (userIds.length === 0) return new Map();

  const [followerGroups, followingGroups, likeGroups, viewGroups] =
    await Promise.all([
      prisma.follow.groupBy({
        by: ['followingId'],
        where: { followingId: { in: userIds } },
        _count: { _all: true },
      }),
      prisma.follow.groupBy({
        by: ['followerId'],
        where: { followerId: { in: userIds } },
        _count: { _all: true },
      }),
      prisma.like.groupBy({
        by: ['likedUserId'],
        where: { likedUserId: { in: userIds } },
        _count: { _all: true },
      }),
      prisma.profileView.groupBy({
        by: ['profileUserId'],
        where: { profileUserId: { in: userIds } },
        _count: { _all: true },
      }),
    ]);

  const followerMap = new Map(
    followerGroups.map((g) => [g.followingId, g._count._all]),
  );
  const followingMap = new Map(
    followingGroups.map((g) => [g.followerId, g._count._all]),
  );
  const likeMap = new Map(
    likeGroups.map((g) => [g.likedUserId, g._count._all]),
  );
  const viewMap = new Map(
    viewGroups.map((g) => [g.profileUserId, g._count._all]),
  );

  let followingSet = new Set<string>();
  let likingSet = new Set<string>();

  if (viewerId) {
    const [follows, likes] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: viewerId, followingId: { in: userIds } },
        select: { followingId: true },
      }),
      prisma.like.findMany({
        where: { likerId: viewerId, likedUserId: { in: userIds } },
        select: { likedUserId: true },
      }),
    ]);
    followingSet = new Set(follows.map((f) => f.followingId));
    likingSet = new Set(likes.map((l) => l.likedUserId));
  }

  const result = new Map<string, UserStats>();
  for (const id of userIds) {
    result.set(id, {
      followersCount: followerMap.get(id) ?? 0,
      followingCount: followingMap.get(id) ?? 0,
      likesReceivedCount: likeMap.get(id) ?? 0,
      profileViewsCount: viewMap.get(id) ?? 0,
      isFollowing: followingSet.has(id),
      isLiked: likingSet.has(id),
    });
  }
  return result;
}