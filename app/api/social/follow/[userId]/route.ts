// app/api/social/follow/[userId]/route.ts
/**
 * FOLLOW/UNFOLLOW API ROUTE
 *
 * Allows a user to follow or unfollow another user.
 * Requires authentication.
 *
 * POST /api/social/follow/[userId] - Follow a user
 * DELETE /api/social/follow/[userId] - Unfollow a user
 *
 * Also updates cached counters (followersCount, followingCount) on both users
 * to keep them in sync with the actual relationship data.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { createNotificationForUser } from '@/lib/notifications';
import { publishSocialInvalidation } from '@/lib/partykit-server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;

    // Prevent self-follow
    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUserId
      }
    });

    // Update counters using updateMany to avoid write conflicts
    // Fire-and-forget - don't wait for these to complete
    void Promise.all([
      prisma.user.updateMany({
        where: { id: currentUser.id },
        data: { followingCount: { increment: 1 } }
      }),
      prisma.user.updateMany({
        where: { id: targetUserId },
        data: { followersCount: { increment: 1 } }
      })
    ]).catch((err) => {
      console.warn('[follow] counter update failed:', err);
    });

    const actorName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    const actorCenter = currentUser.techCenter?.name;
    try {
      await createNotificationForUser({
        userId: targetUserId,
        title: 'New follower',
        message: `${actorName}${actorCenter ? ` from ${actorCenter}` : ''} followed your account.`,
        type: 'social_follow',
        link: `/dashboard/students/${currentUser.id}`,
        generatedBy: currentUser.id,
        entityType: 'follow',
        entityId: currentUser.id,
      });
    } catch (notificationError) {
      console.error('Failed to notify user about follow:', notificationError);
    }

    await publishSocialInvalidation([currentUser.id, targetUserId]);

    return NextResponse.json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error: unknown) {
    console.error('Follow API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;

    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      }
    });

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 400 }
      );
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      }
    });

    // Update counters using updateMany to avoid write conflicts
    // Fire-and-forget - don't wait for these to complete
    void Promise.all([
      prisma.user.updateMany({
        where: { id: currentUser.id },
        data: { followingCount: { decrement: 1 } }
      }),
      prisma.user.updateMany({
        where: { id: targetUserId },
        data: { followersCount: { decrement: 1 } }
      })
    ]).catch((err) => {
      console.warn('[unfollow] counter update failed:', err);
    });

    await publishSocialInvalidation([currentUser.id, targetUserId]);

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error: unknown) {
    console.error('Unfollow API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
