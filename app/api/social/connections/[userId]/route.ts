// app/api/social/connections/[userId]/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getStatsForUsers, EMPTY_STATS } from '@/lib/social/attachStats';

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') ?? 'followers';

    if (type !== 'followers' && type !== 'following') {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 },
      );
    }

    if (!OBJECT_ID_REGEX.test(targetUserId)) {
      return NextResponse.json({ connections: [], type, count: 0 });
    }

    const rows =
      type === 'followers'
        ? await prisma.follow.findMany({
            where: { followingId: targetUserId },
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
          })
        : await prisma.follow.findMany({
            where: { followerId: targetUserId },
            select: {
              createdAt: true,
              following: {
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
          });

    const base = rows.map((r) => {
      const u = 'follower' in r ? r.follower : r.following;
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
        techCenter: u.techCenter,
        connectedAt: r.createdAt.toISOString(),
      };
    });

    const statsMap = await getStatsForUsers(
      currentUser.id,
      base.map((c) => c.id),
    );

    const connections = base.map((c) => ({
      ...c,
      ...(statsMap.get(c.id) ?? EMPTY_STATS),
    }));

    return NextResponse.json({
      connections,
      type,
      count: connections.length,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[connections] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 },
    );
  }
}