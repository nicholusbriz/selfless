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
 * Same shape as /api/students so the client renders rows identically.
 *
 * GET /api/social/trending?limit=10
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

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

    // -------- 1. Live counts from Follow / Like / ProfileView --------
    const [followerGroups, followingGroups, likeGroups, viewGroups] =
      await Promise.all([
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
        prisma.profileView.groupBy({
          by: ['profileUserId'],
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
    const viewMap = new Map<string, number>(
      viewGroups.map((g) => [g.profileUserId, g._count._all]),
    );

    // -------- 2. Candidate IDs = anyone with activity --------
    const activeIds = new Set<string>([
      ...followerMap.keys(),
      ...likeMap.keys(),
    ]);

    if (activeIds.size === 0) {
      return NextResponse.json(
        { students: [], generatedAt: new Date().toISOString() },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } },
      );
    }

    // -------- 3. Fetch profile info for candidates --------
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

    // -------- 4. Rank --------
    const ranked = users
      .map((u) => ({
        ...u,
        followersCount: followerMap.get(u.id) ?? 0,
        followingCount: followingMap.get(u.id) ?? 0,
        likesReceivedCount: likeMap.get(u.id) ?? 0,
        profileViewsCount: viewMap.get(u.id) ?? 0,
      }))
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

    // -------- 5. Viewer state (does the viewer follow/like each) --------
    const topIds = ranked.map((u) => u.id);

    const [myFollows, myLikes] = await Promise.all([
      topIds.length > 0
        ? prisma.follow.findMany({
            where: { followerId: viewerId, followingId: { in: topIds } },
            select: { followingId: true },
          })
        : Promise.resolve([]),
      topIds.length > 0
        ? prisma.like.findMany({
            where: { likerId: viewerId, likedUserId: { in: topIds } },
            select: { likedUserId: true },
          })
        : Promise.resolve([]),
    ]);

    const followingSet = new Set(myFollows.map((f) => f.followingId));
    const likingSet = new Set(myLikes.map((l) => l.likedUserId));

    // -------- 6. Build response rows --------
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
      isFollowing: followingSet.has(u.id),
      isLiked: likingSet.has(u.id),
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