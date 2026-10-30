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
export const revalidate = 300; // Cache for 5 minutes - trending data doesn't change frequently

interface TrendingStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: { name: string } | null;
  techCenter: { id: string; name: string } | null;
  previousTechCenter: { id: string; name: string } | null;
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
    const limitParam = Number(searchParams.get('limit') ?? '20');
    const offsetParam = Number(searchParams.get('offset') ?? '0');
    const limit = Math.min(
      Math.max(Number.isFinite(limitParam) ? limitParam : 20, 1),
      100,
    );
    const offset = Math.max(Number.isFinite(offsetParam) ? Math.floor(offsetParam) : 0, 0);

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
        {
          students: [],
          generatedAt: new Date().toISOString(),
          hasMore: false,
          nextOffset: offset,
          totalCount: 0,
        },
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
        role: { select: { name: true } },
        previousTechCenterId: true,
        techCenter: { select: { id: true, name: true } },
      },
    });

    const followerCountById = new Map(
      followerGroups.map((group) => [group.followingId, group._count._all]),
    );
    const likesCountById = new Map(
      likeGroups.map((group) => [group.likedUserId, group._count._all]),
    );

    // -------- 3. Rank candidates before loading detailed stats --------
    const ranked = users
      .map((user) => ({
        ...user,
        followersCount: followerCountById.get(user.id) ?? 0,
        likesReceivedCount: likesCountById.get(user.id) ?? 0,
      }))
      .filter(
        (user) =>
          Boolean(user.profileImageUrl?.trim()) && user.followersCount >= 1,
      )
      .sort((a, b) => {
        if (b.followersCount !== a.followersCount)
          return b.followersCount - a.followersCount;
        if (b.likesReceivedCount !== a.likesReceivedCount)
          return b.likesReceivedCount - a.likesReceivedCount;
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
      });

    const pageUsers = ranked.slice(offset, offset + limit);
    const pageUserIds = pageUsers.map((user) => user.id);
    const previousTechCenterIds = Array.from(
      new Set(
        pageUsers
          .filter((user) => user.role?.name === 'super_admin')
          .map((user) => user.previousTechCenterId)
          .filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          )
      ),
    );
    const [statsMap, previousTechCenters] = await Promise.all([
      getStatsForUsers(viewerId, pageUserIds),
      previousTechCenterIds.length > 0
        ? prisma.techCenter.findMany({
            where: { id: { in: previousTechCenterIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);
    const previousTechCentersById = new Map(
      previousTechCenters.map((techCenter) => [techCenter.id, techCenter]),
    );

    // -------- 4. Build response rows --------
    const students: TrendingStudent[] = pageUsers.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role ?? null,
      techCenter: user.techCenter,
      previousTechCenter:
        user.role?.name === 'super_admin' && user.previousTechCenterId
          ? previousTechCentersById.get(user.previousTechCenterId) ?? null
          : null,
      ...EMPTY_STATS,
      ...(statsMap.get(user.id) ?? EMPTY_STATS),
      followersCount: user.followersCount,
      likesReceivedCount: user.likesReceivedCount,
    }));

    return NextResponse.json(
      {
        students,
        generatedAt: new Date().toISOString(),
        hasMore: offset + students.length < ranked.length,
        nextOffset: offset + students.length,
        totalCount: ranked.length,
      },
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