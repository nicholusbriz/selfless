// app/api/social/check/[userId]/route.ts
/**
 * SOCIAL STATUS CHECK API ROUTE
 * 
 * Checks if the current user is following or has liked a specific user.
 * Requires authentication.
 * 
 * GET /api/social/check/[userId] - Check follow and like status
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

    // Check if following
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      }
    });

    // Check if liked
    const like = await prisma.like.findUnique({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId
        }
      }
    });

    return NextResponse.json({
      isFollowing: !!follow,
      isLiked: !!like
    });
  } catch (error: unknown) {
    console.error('Social check API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check social status' },
      { status: 500 }
    );
  }
}
