// app/api/social/likes/[userId]/route.ts
/**
 * LIKES LIST API ROUTE
 * 
 * Fetches users who liked a specific profile and users that profile liked.
 * Requires authentication.
 * 
 * GET /api/social/likes/[userId] - Get received and sent likes
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;

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
        }
      },
      followersCount: true,
      followingCount: true,
      likesReceivedCount: true,
    } as const;

    const [receivedLikes, sentLikes] = await Promise.all([
      prisma.like.findMany({
        where: { likedUserId: targetUserId },
        include: { liker: { select: userSelect } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.like.findMany({
        where: { likerId: targetUserId },
        include: { likedUser: { select: userSelect } },
        orderBy: { createdAt: 'desc' }
      }),
    ]);

    const relatedUsers = [
      ...receivedLikes.map((like) => like.liker),
      ...sentLikes.map((like) => like.likedUser),
    ];
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
      previousTechCenters.map((techCenter) => [techCenter.id, techCenter]),
    );
    const getTechCenter = (user: (typeof relatedUsers)[number]) =>
      user.techCenter ??
      (user.role?.name === 'super_admin' && user.previousTechCenterId
        ? previousTechCentersById.get(user.previousTechCenterId) ?? null
        : null);

    const likers = receivedLikes.map(like => ({
      id: like.liker.id,
      firstName: like.liker.firstName,
      lastName: like.liker.lastName,
      profileImageUrl: like.liker.profileImageUrl,
      techCenter: getTechCenter(like.liker),
      followersCount: like.liker.followersCount,
      followingCount: like.liker.followingCount,
      likesReceivedCount: like.liker.likesReceivedCount,
      likedAt: like.createdAt,
    }));

    const likedUsers = sentLikes.map(like => ({
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
    }));

    return NextResponse.json({
      likers,
      totalLikes: likers.length,
      likedUsers,
      totalLikedUsers: likedUsers.length,
    });
  } catch (error: unknown) {
    console.error('Likes list API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}