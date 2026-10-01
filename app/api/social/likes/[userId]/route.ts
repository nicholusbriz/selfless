// app/api/social/likes/[userId]/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getStatsForUsers, EMPTY_STATS } from '@/lib/social/attachStats';

const MAX_RESULTS = 500;
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;

    if (!OBJECT_ID_REGEX.test(targetUserId)) {
      return NextResponse.json({
        likers: [],
        totalLikes: 0,
        likedUsers: [],
        totalLikedUsers: 0,
      });
    }

    const [receivedLikes, sentLikes] = await Promise.all([
      prisma.like.findMany({
        where: { likedUserId: targetUserId },
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
        take: MAX_RESULTS,
      }),
      prisma.like.findMany({
        where: { likerId: targetUserId },
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
        take: MAX_RESULTS,
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

    const allIds = [
      ...likersBase.map((u) => u.id),
      ...likedUsersBase.map((u) => u.id),
    ];
    const statsMap = await getStatsForUsers(currentUser.id, allIds);

    const withStats = <T extends { id: string }>(u: T) => ({
      ...u,
      ...(statsMap.get(u.id) ?? EMPTY_STATS),
    });

    const likers = likersBase.map(withStats);
    const likedUsers = likedUsersBase.map((u) => ({
      ...withStats(u),
      isLiked: true, // the viewer liked this user (by definition of this list)
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
    console.error('[likes] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 },
    );
  }
}