// app/api/social/likes/[userId]/route.ts
/**
 * LIKES LIST API ROUTE
 * 
 * Fetches all users who liked a specific user's profile.
 * Requires authentication.
 * 
 * GET /api/social/likes/[userId] - Get users who liked this user
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

    // Fetch all likes for the target user
    const likes = await prisma.like.findMany({
      where: { likedUserId: targetUserId },
      include: {
        liker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            techCenter: {
              select: {
                id: true,
                name: true,
              }
            },
            followersCount: true,
            followingCount: true,
            likesReceivedCount: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match the expected format
    const likers = likes.map(like => ({
      id: like.liker.id,
      firstName: like.liker.firstName,
      lastName: like.liker.lastName,
      profileImageUrl: like.liker.profileImageUrl,
      techCenter: like.liker.techCenter,
      followersCount: like.liker.followersCount,
      followingCount: like.liker.followingCount,
      likesReceivedCount: like.liker.likesReceivedCount,
      likedAt: like.createdAt,
    }));

    return NextResponse.json({
      likers,
      totalLikes: likers.length,
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