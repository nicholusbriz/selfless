// app/api/social/followers/route.ts
// Returns the list of users who follow the current authenticated user.
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit') ?? '100');
    const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 100, 1), 100);

    const rows = await prisma.follow.findMany({
      where: { followingId: currentUser.id },
      select: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            hasVerifiedBadge: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const followers = rows.map((r) => ({
      id: r.follower.id,
      name: `${r.follower.firstName} ${r.follower.lastName}`.trim(),
      profileImage: r.follower.profileImageUrl,
      hasVerifiedBadge: r.follower.hasVerifiedBadge,
    }));

    return NextResponse.json({ success: true, followers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[social/followers] error', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch followers' }, { status: 500 });
  }
}
