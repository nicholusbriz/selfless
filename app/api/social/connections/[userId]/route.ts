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
                  role: { select: { name: true } },
                  previousTechCenterId: true,
                  generalCourse: true,
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
                  role: { select: { name: true } },
                  previousTechCenterId: true,
                  generalCourse: true,
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
        role: u.role,
        previousTechCenterId: u.previousTechCenterId,
        generalCourse: u.generalCourse,
        techCenter: u.techCenter,
        connectedAt: r.createdAt.toISOString(),
      };
    });

    const statsMap = await getStatsForUsers(
      currentUser.id,
      base.map((c) => c.id),
    );

    // Fetch previous tech centers for directors
    const previousTechCenterIds = Array.from(
      new Set(
        base
          .filter((user) => user.role?.name === 'super_admin')
          .map((user) => user.previousTechCenterId)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      ),
    );

    const previousTechCenters =
      previousTechCenterIds.length > 0
        ? await prisma.techCenter.findMany({
            where: { id: { in: previousTechCenterIds } },
            select: { id: true, name: true },
          })
        : [];

    const previousTechCentersById = new Map(
      previousTechCenters.map((techCenter) => [techCenter.id, techCenter]),
    );

    const connections = base.map((c) => ({
      ...c,
      previousTechCenter:
        c.role?.name === 'super_admin' && c.previousTechCenterId
          ? previousTechCentersById.get(c.previousTechCenterId) ?? null
          : null,
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