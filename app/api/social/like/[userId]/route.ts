// app/api/social/like/[userId]/route.ts
/**
 * LIKE/UNLIKE API ROUTE
 *
 * Allows a user to like or unlike another user's profile.
 * Requires authentication.
 *
 * POST /api/social/like/[userId] - Like a user
 * DELETE /api/social/like/[userId] - Unlike a user
 *
 * Also updates cached counter (likesReceivedCount) on the target user
 * to keep it in sync with the actual relationship data.
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

    // Prevent self-like
    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot like yourself' },
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

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId
        }
      }
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked this user' },
        { status: 400 }
      );
    }

    // Create like relationship
    await prisma.like.create({
      data: {
        likerId: currentUser.id,
        likedUserId: targetUserId
      }
    });

    // Update counter using updateMany to avoid write conflicts
    // Fire-and-forget - don't wait for this to complete
    void prisma.user.updateMany({
      where: { id: targetUserId },
      data: { likesReceivedCount: { increment: 1 } }
    }).catch((err) => {
      console.warn('[like] counter update failed:', err);
    });

    const actorName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    const actorCenter = currentUser.techCenter?.name;
    try {
      await createNotificationForUser({
        userId: targetUserId,
        title: 'New like',
        message: `${actorName}${actorCenter ? ` from ${actorCenter}` : ''} liked your account.`,
        type: 'social_like',
        link: `/dashboard/students/${currentUser.id}`,
        generatedBy: currentUser.id,
        entityType: 'like',
        entityId: currentUser.id,
      });
    } catch (notificationError) {
      console.error('Failed to notify user about like:', notificationError);
    }

    await publishSocialInvalidation([currentUser.id, targetUserId]);

    return NextResponse.json({
      success: true,
      message: 'Successfully liked user'
    });
  } catch (error: unknown) {
    console.error('Like API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to like user' },
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

    // Find the like record first to know if we need to decrement
    const existingLike = await prisma.like.findUnique({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId
        }
      }
    });

    // DELETE is idempotent: the relationship may already be gone.
    await prisma.like.deleteMany({
      where: {
        likerId: currentUser.id,
        likedUserId: targetUserId
      }
    });

    // Only decrement counter if a record was actually deleted
    // Use updateMany to avoid write conflicts
    if (existingLike) {
      void prisma.user.updateMany({
        where: { id: targetUserId },
        data: { likesReceivedCount: { decrement: 1 } }
      }).catch((err) => {
        console.warn('[unlike] counter update failed:', err);
      });
    }

    await publishSocialInvalidation([currentUser.id, targetUserId]);

    return NextResponse.json({
      success: true,
      message: 'Successfully unliked user'
    });
  } catch (error: unknown) {
    console.error('Unlike API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to unlike user' },
      { status: 500 }
    );
  }
}
