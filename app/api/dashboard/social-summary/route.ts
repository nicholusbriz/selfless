// app/api/dashboard/social-summary/route.ts
/**
 * DASHBOARD SOCIAL SUMMARY API
 *
 * Merges multiple social stats APIs into one call to reduce dashboard load time:
 *   - /api/social/me (personal stats)
 *   - /api/social/trending?limit=50 (trending users, includes superadmins with profile images)
 *   - /api/social/likes/${userId} (recent likes activity)
 *   - /api/social/connections/${userId}?type=followers (recent followers activity)
 *
 * Returns a single response with all social data needed for the dashboard.
 *
 * GET /api/dashboard/social-summary?limit=50
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getStatsForUsers, EMPTY_STATS } from '@/lib/social/attachStats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TrendingStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: string | null;
  techCenter: { id: string; name: string } | null;
  previousTechCenter: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

interface ActivityUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: { id: string; name: string } | null;
  likedAt?: string;
  connectedAt?: string;
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const viewerId = currentUser.id;
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit') ?? '50');
    const limit = Math.min(
      Math.max(Number.isFinite(limitParam) ? limitParam : 50, 1),
      100,
    );

    // ===== 1. Fetch personal stats (was /api/social/me) =====
    const [followersCount, followingCount, likesReceivedCount, profileViewsCount] =
      await Promise.all([
        prisma.follow.count({ where: { followingId: currentUser.id } }),
        prisma.follow.count({ where: { followerId: currentUser.id } }),
        prisma.like.count({ where: { likedUserId: currentUser.id } }),
        prisma.profileView.count({ where: { profileUserId: currentUser.id } }),
      ]);

    const meStats = {
      id: currentUser.id,
      followersCount,
      followingCount,
      likesReceivedCount,
      profileViewsCount,
    };

    // ===== 2. Fetch trending users (was /api/social/trending) =====
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

    // Also fetch all admins and tutors with profile images
    const privilegedUsersWithImages = await prisma.user.findMany({
      where: {
        role: { name: { in: ['super_admin', 'admin', 'teacher'] } },
        AND: [
          { profileImageUrl: { not: null } },
          { profileImageUrl: { not: '' } },
        ],
        OR: [
          { role: { name: { not: 'super_admin' } } },
          { previousTechCenterId: { not: null } },
        ],
      },
      select: { id: true },
    });

    privilegedUsersWithImages.forEach((u) => activeIds.add(u.id));

    let trendingStudents: TrendingStudent[] = [];
    if (activeIds.size > 0) {
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

      const userIds = users.map((u) => u.id);
      const previousTechCenterIds = Array.from(
        new Set(
          users
            .filter((user) => user.role?.name === 'super_admin')
            .map((user) => user.previousTechCenterId)
            .filter(
              (id): id is string => typeof id === 'string' && id.length > 0,
            ),
        ),
      );
      const [statsMap, previousTechCenters] = await Promise.all([
        getStatsForUsers(viewerId, userIds),
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

      const ranked = users
        .map((u) => {
          const stats = statsMap.get(u.id) ?? EMPTY_STATS;
          return {
            ...u,
            ...stats,
          };
        })
        .filter((u) =>
          Boolean(u.profileImageUrl?.trim()) &&
          (u.followersCount > 0 ||
            u.likesReceivedCount > 0 ||
            ((u.role?.name === 'super_admin' || u.role?.name === 'admin' || u.role?.name === 'teacher') &&
              (u.role?.name !== 'super_admin' || Boolean(u.previousTechCenterId))))
        )
        .sort((a, b) => {
          // Priority 1: Role hierarchy (super_admin > admin > tutor > student)
          const rolePriority: Record<string, number> = {
            super_admin: 4,
            admin: 3,
            teacher: 2,
            student: 1,
          };
          const aPriority = rolePriority[a.role?.name || ''] || 0;
          const bPriority = rolePriority[b.role?.name || ''] || 0;
          if (aPriority !== bPriority) return bPriority - aPriority;

          // Priority 2: Has profile image (within the same role, users with images come first)
          const aHasImage = Boolean(a.profileImageUrl?.trim());
          const bHasImage = Boolean(b.profileImageUrl?.trim());
          if (aHasImage !== bHasImage) return bHasImage ? 1 : -1;

          // Priority 3: Followers count (highest to lowest)
          if (b.followersCount !== a.followersCount)
            return b.followersCount - a.followersCount;

          // Priority 4: Likes count (highest to lowest)
          if (b.likesReceivedCount !== a.likesReceivedCount)
            return b.likesReceivedCount - a.likesReceivedCount;

          // Priority 5: Name for stability
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`,
          );
        })
        .slice(0, limit);

      trendingStudents = ranked.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
        role: u.role?.name ?? null,
        techCenter: u.techCenter,
        previousTechCenter:
          u.role?.name === 'super_admin'
            ? (u.previousTechCenterId
                ? previousTechCentersById.get(u.previousTechCenterId) ?? null
                : null)
            : null,
        followersCount: u.followersCount,
        followingCount: u.followingCount,
        likesReceivedCount: u.likesReceivedCount,
        profileViewsCount: u.profileViewsCount,
        isFollowing: u.isFollowing,
        isLiked: u.isLiked,
      }));
    }

    // ===== 3. Fetch recent likes activity (was /api/social/likes/${userId}) =====
    const MAX_ACTIVITY = 10;
    const [receivedLikes, sentLikes] = await Promise.all([
      prisma.like.findMany({
        where: { likedUserId: currentUser.id },
        select: {
          createdAt: true,
          liker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              techCenter: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_ACTIVITY,
      }),
      prisma.like.findMany({
        where: { likerId: currentUser.id },
        select: {
          createdAt: true,
          likedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              techCenter: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_ACTIVITY,
      }),
    ]);

    const likersBase = receivedLikes.map((like) => ({
      id: like.liker.id,
      firstName: like.liker.firstName,
      lastName: like.liker.lastName,
      profileImageUrl: like.liker.profileImageUrl,
      techCenter: like.liker.techCenter,
      likedAt: like.createdAt.toISOString(),
    }));

    const likedUsersBase = sentLikes.map((like) => ({
      id: like.likedUser.id,
      firstName: like.likedUser.firstName,
      lastName: like.likedUser.lastName,
      profileImageUrl: like.likedUser.profileImageUrl,
      techCenter: like.likedUser.techCenter,
      likedAt: like.createdAt.toISOString(),
    }));

    // ===== 4. Fetch recent followers activity (was /api/social/connections/${userId}?type=followers) =====
    const followers = await prisma.follow.findMany({
      where: { followingId: currentUser.id },
      select: {
        createdAt: true,
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            techCenter: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: MAX_ACTIVITY,
    });

    const followersBase = followers.map((f) => ({
      id: f.follower.id,
      firstName: f.follower.firstName,
      lastName: f.follower.lastName,
      profileImageUrl: f.follower.profileImageUrl,
      techCenter: f.follower.techCenter,
      connectedAt: f.createdAt.toISOString(),
    }));

    // ===== 5. Get stats for all activity users in a single call =====
    const allActivityUserIds = [
      ...likersBase.map((u) => u.id),
      ...likedUsersBase.map((u) => u.id),
      ...followersBase.map((u) => u.id),
    ];

    const activityStatsMap = allActivityUserIds.length > 0
      ? await getStatsForUsers(viewerId, allActivityUserIds)
      : new Map();

    const withStats = <T extends { id: string }>(u: T) => ({
      ...u,
      ...(activityStatsMap.get(u.id) ?? EMPTY_STATS),
    });

    const likers = likersBase.map(withStats);
    const likedUsers = likedUsersBase.map((u) => ({
      ...withStats(u),
      isLiked: true,
    }));
    const followersWithStats = followersBase.map(withStats);

    // ===== 6. Build combined response =====
    return NextResponse.json(
      {
        me: meStats,
        trending: {
          students: trendingStudents,
          generatedAt: new Date().toISOString(),
        },
        activity: {
          likers,
          likedUsers,
          followers: followersWithStats,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[dashboard/social-summary] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch social summary' },
      { status: 500 },
    );
  }
}
