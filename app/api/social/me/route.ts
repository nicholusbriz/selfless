// app/api/social/me/route.ts
/**
 * LOGGED-IN USER'S SOCIAL STATS
 *
 * Returns the current user's:
 *   - followersCount
 *   - followingCount
 *   - likesReceivedCount
 *   - profileViewsCount
 *
 * Used by the Connections page header.
 *
 * GET /api/social/me
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const currentUser = await requireAuth();

    const [followersCount, followingCount, likesReceivedCount, profileViewsCount] =
      await Promise.all([
        prisma.follow.count({ where: { followingId: currentUser.id } }),
        prisma.follow.count({ where: { followerId: currentUser.id } }),
        prisma.like.count({ where: { likedUserId: currentUser.id } }),
        prisma.profileView.count({ where: { profileUserId: currentUser.id } }),
      ]);

    return NextResponse.json({
      id: currentUser.id,
      followersCount,
      followingCount,
      likesReceivedCount,
      profileViewsCount,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[social/me] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch current user stats' },
      { status: 500 },
    );
  }
}