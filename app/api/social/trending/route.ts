// app/api/social/trending/route.ts
/**
 * TRENDING STUDENTS API ROUTE
 *
 * Counts followers/likes LIVE from the Follow and Like collections on
 * every request — so updates, deletes, and unfollows are reflected
 * immediately. No counter fields on User are trusted.
 *
 * Only users with at least 1 follower OR at least 1 like are returned.
 *
 * Ranked by:
 *   1. followersCount DESC
 *   2. likesReceivedCount DESC
 *   3. name A-Z
 *
 * GET /api/social/trending?limit=10
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

// Never cache this route — the response depends on live DB counts.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TrendingStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

export async function GET(request: Request) {
  try {
    let currentUserId: string | null = null;
    try {
      const currentUser = await requireAuth();
      currentUserId = currentUser.id;
    } catch {
      currentUserId = null;
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit') ?? '10');
    const limit = Math.min(
      Math.max(Number.isFinite(limitParam) ? limitParam : 10, 1),
      100,
    );

    // -------- 1. Aggregate live counts from Follow / Like --------
    // Only fetch IDs that actually appear in a relationship.
    const [followerGroups, followingGroups, likeGroups] = await Promise.all([
      prisma.follow.groupBy({
        by: ['followingId'],
        _count: { _all: true },
      }),
      prisma.follow.groupBy({
        by: ['followerId'],
        _count: { _all: true },
      }),
      prisma.like.groupBy({
        by: ['likedUserId'],
        _count: { _all: true },
      }),
    ]);

    const followerMap = new Map<string, number>(
      followerGroups.map((g) => [g.followingId, g._count._all]),
    );
    const followingMap = new Map<string, number>(
      followingGroups.map((g) => [g.followerId, g._count._all]),
    );
    const likeMap = new Map<string, number>(
      likeGroups.map((g) => [g.likedUserId, g._count._all]),
    );

    // -------- 2. Candidate IDs = anyone with followers or likes --------
    const activeIds = new Set<string>([
      ...followerMap.keys(),
      ...likeMap.keys(),
    ]);

    if (activeIds.size === 0) {
      return NextResponse.json(
        { students: [], generatedAt: new Date().toISOString() },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        },
      );
    }

    // -------- 3. Fetch only the active users' profile info --------
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(activeIds) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        techCenter: {
          select: { id: true, name: true },
        },
      },
    });

    // -------- 4. Score and rank (followers first) --------
    const ranked = users
      .map((u) => {
        const followersCount = followerMap.get(u.id) ?? 0;
        const followingCount = followingMap.get(u.id) ?? 0;
        const likesReceivedCount = likeMap.get(u.id) ?? 0;
        return {
          ...u,
          followersCount,
          followingCount,
          likesReceivedCount,
        };
      })
      .filter((u) => u.followersCount > 0 || u.likesReceivedCount > 0)
      .sort((a, b) => {
        if (b.followersCount !== a.followersCount)
          return b.followersCount - a.followersCount;
        if (b.likesReceivedCount !== a.likesReceivedCount)
          return b.likesReceivedCount - a.likesReceivedCount;
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
      })
      .slice(0, limit);

    // -------- 5. Overlay current user's follow/like state --------
    const topIds = ranked.map((u) => u.id);
    let followingSet = new Set<string>();
    let likingSet = new Set<string>();

    if (currentUserId && topIds.length > 0) {
      const [follows, likes] = await Promise.all([
        prisma.follow.findMany({
          where: { followerId: currentUserId, followingId: { in: topIds } },
          select: { followingId: true },
        }),
        prisma.like.findMany({
          where: { likerId: currentUserId, likedUserId: { in: topIds } },
          select: { likedUserId: true },
        }),
      ]);
      followingSet = new Set(follows.map((f) => f.followingId));
      likingSet = new Set(likes.map((l) => l.likedUserId));
    }

    const students: TrendingStudent[] = ranked.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      profileImageUrl: u.profileImageUrl,
      techCenter: u.techCenter,
      followersCount: u.followersCount,
      followingCount: u.followingCount,
      likesReceivedCount: u.likesReceivedCount,
      isFollowing: followingSet.has(u.id),
      isLiked: likingSet.has(u.id),
    }));

    return NextResponse.json(
      { students, generatedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch (error: unknown) {
    console.error('[trending] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending students' },
      { status: 500 },
    );
  }
}