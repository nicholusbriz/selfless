// app/api/social/like/[userId]/route.ts
/**
 * LIKE/UNLIKE API ROUTE
 * 
 * Allows a user to like or unlike another user's profile.
 * Requires authentication.
 * 
 * POST /api/social/like/[userId] - Like a user
 * DELETE /api/social/like/[userId] - Unlike a user
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

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

    // Check if like relationship exists
    const existingLike = await prisma.like.findUnique({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId
        }
      }
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: 'Not liked this user' },
        { status: 400 }
      );
    }

    // Delete like relationship
    await prisma.like.delete({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId
        }
      }
    });

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
