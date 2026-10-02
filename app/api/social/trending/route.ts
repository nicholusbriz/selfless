// app/api/social/trending/route.ts
/**
 * TRENDING STUDENTS API ROUTE
 *
 * Returns the top N users ranked by:
 *   1. followersCount DESC
 *   2. likesReceivedCount DESC
 *   3. name A-Z
 *
 * Each user is returned with all their stats baked in:
 *   - followersCount
 *   - followingCount
 *   - likesReceivedCount
 *   - profileViewsCount
 *   - isFollowing (does the viewer follow them)
 *   - isLiked     (has the viewer liked them)
 *
 * Uses the centralized getStatsForUsers function to compute LIVE stats
 * from Follow/Like/ProfileView tables, ensuring consistency with the
 * Students and Connections pages.
 *
 * Same shape as /api/students so the client renders rows identically.
 *
 * GET /api/social/trending?limit=10
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';
import { getStatsForUsers, EMPTY_STATS } from '@/lib/social/attachStats';

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
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const viewerId = currentUser.id;

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit') ?? '10');
    const limit = Math.min(
      Math.max(Number.isFinite(limitParam) ? limitParam : 10, 1),
      100,
    );

    // -------- 1. Find users with activity (followers or likes) --------
    const [followerGroups, likeGroups] = await Promise.all([
      prisma.follow.groupBy({
        by: ['followingId'],
        _count: { _all: true },
      }),
      prisma.like.groupBy({
        by: ['likedUserId'],
        _count: { _all: true },
      }),
    ]);

    const activeIds = new Set<string>([
      ...followerGroups.map((g) => g.followingId),
      ...likeGroups.map((g) => g.likedUserId),
    ]);

    if (activeIds.size === 0) {
      return NextResponse.json(
        { students: [], generatedAt: new Date().toISOString() },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } },
      );
    }

    // -------- 2. Fetch profile info for candidates --------
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(activeIds) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        techCenter: { select: { id: true, name: true } },
      },
    });

    // -------- 3. Get live stats using centralized function --------
    const userIds = users.map((u) => u.id);
    const statsMap = await getStatsForUsers(viewerId, userIds);

    // -------- 4. Rank and filter --------
    const ranked = users
      .map((u) => {
        const stats = statsMap.get(u.id) ?? EMPTY_STATS;
        return {
          ...u,
          ...stats,
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

    // -------- 5. Build response rows --------
    const students: TrendingStudent[] = ranked.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      profileImageUrl: u.profileImageUrl,
      techCenter: u.techCenter,
      followersCount: u.followersCount,
      followingCount: u.followingCount,
      likesReceivedCount: u.likesReceivedCount,
      profileViewsCount: u.profileViewsCount,
      isFollowing: u.isFollowing,
      isLiked: u.isLiked,
    }));

    return NextResponse.json(
      { students, generatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[trending] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending students' },
      { status: 500 },
    );
  }
}