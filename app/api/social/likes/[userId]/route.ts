// app/api/social/likes/[userId]/route.ts
/**
 * LIKES LIST API ROUTE
 *
 * Fetches users who liked a specific profile, and users that profile liked.
 *
 * Optimizations:
 *   - Hard cap on results (MAX_RESULTS) so the endpoint is bounded
 *   - Adds `isFollowing` for each returned user (single query)
 *     so the client doesn't need a second lookup
 *   - Uses `select` on every relation, no full User fetch
 *   - 30s private cache header
 *
 * GET /api/social/likes/[userId]
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

// Hard cap on likes returned in each direction.
const MAX_RESULTS = 500;

// Fields we return for every user (liker or likedUser).
// Kept identical to the previous response shape so the frontend
// doesn't need any changes.
const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  previousTechCenterId: true,
  role: { select: { name: true } },
  techCenter: {
    select: {
      id: true,
      name: true,
    },
  },
  followersCount: true,
  followingCount: true,
  likesReceivedCount: true,
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;

    // -------- 1. Fetch received + sent likes in parallel --------
    const [receivedLikes, sentLikes] = await Promise.all([
      prisma.like.findMany({
        where: { likedUserId: targetUserId },
        select: {
          createdAt: true,
          liker: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_RESULTS,
      }),
      prisma.like.findMany({
        where: { likerId: targetUserId },
        select: {
          createdAt: true,
          likedUser: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_RESULTS,
      }),
    ]);

    const relatedUsers = [
      ...receivedLikes.map((like) => like.liker),
      ...sentLikes.map((like) => like.likedUser),
    ];

    // -------- 2. Resolve "previous tech centers" for super_admins --------
    const previousTechCenterIds = Array.from(
      new Set(
        relatedUsers.flatMap((user) =>
          !user.techCenter &&
          user.role?.name === 'super_admin' &&
          user.previousTechCenterId
            ? [user.previousTechCenterId]
            : [],
        ),
      ),
    );

    const previousTechCenters = previousTechCenterIds.length
      ? await prisma.techCenter.findMany({
          where: { id: { in: previousTechCenterIds } },
          select: { id: true, name: true },
        })
      : [];

    const previousTechCentersById = new Map(
      previousTechCenters.map((tc) => [tc.id, tc]),
    );

    const getTechCenter = (user: (typeof relatedUsers)[number]) =>
      user.techCenter ??
      (user.role?.name === 'super_admin' && user.previousTechCenterId
        ? previousTechCentersById.get(user.previousTechCenterId) ?? null
        : null);

    // -------- 3. Fetch isFollowing for the current user --------
    // One extra query — bounded by how many unique users are in the response.
    const uniqueUserIds = Array.from(
      new Set(relatedUsers.map((u) => u.id)),
    );

    const myFollows =
      uniqueUserIds.length > 0
        ? await prisma.follow.findMany({
            where: {
              followerId: currentUser.id,
              followingId: { in: uniqueUserIds },
            },
            select: { followingId: true },
          })
        : [];

    const followingSet = new Set(myFollows.map((f) => f.followingId));

    // -------- 4. Build the response (same shape as before) --------
    const likers = receivedLikes.map((like) => ({
      id: like.liker.id,
      firstName: like.liker.firstName,
      lastName: like.liker.lastName,
      profileImageUrl: like.liker.profileImageUrl,
      techCenter: getTechCenter(like.liker),
      followersCount: like.liker.followersCount,
      followingCount: like.liker.followingCount,
      likesReceivedCount: like.liker.likesReceivedCount,
      likedAt: like.createdAt,
      // ✅ NEW: isFollowing, so the client doesn't need a second lookup
      isFollowing: followingSet.has(like.liker.id),
    }));

    const likedUsers = sentLikes.map((like) => ({
      id: like.likedUser.id,
      firstName: like.likedUser.firstName,
      lastName: like.likedUser.lastName,
      profileImageUrl: like.likedUser.profileImageUrl,
      techCenter: getTechCenter(like.likedUser),
      followersCount: like.likedUser.followersCount,
      followingCount: like.likedUser.followingCount,
      likesReceivedCount: like.likedUser.likesReceivedCount,
      likedAt: like.createdAt,
      isLiked: true,
      // ✅ NEW: isFollowing
      isFollowing: followingSet.has(like.likedUser.id),
    }));

    return NextResponse.json(
      {
        likers,
        totalLikes: likers.length,
        likedUsers,
        totalLikedUsers: likedUsers.length,
      },
      {
        headers: {
          // 30s cache — likes don't change often, and the client
          // invalidates this after likes/unlikes anyway.
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (error: unknown) {
    console.error('Likes list API error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 },
    );
  }
}