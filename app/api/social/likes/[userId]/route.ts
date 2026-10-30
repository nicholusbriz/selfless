// app/api/social/likes/[userId]/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getStatsForUsers, EMPTY_STATS } from '@/lib/social/attachStats';

const MAX_RESULTS = 500;
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    if (view !== null && view !== 'received' && view !== 'sent') {
      return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }
    const limitParam = Number(searchParams.get('limit') ?? '20');
    const offsetParam = Number(searchParams.get('offset') ?? '0');
    const pageLimit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 20, 1), 100);
    const pageOffset = Math.max(Number.isFinite(offsetParam) ? Math.floor(offsetParam) : 0, 0);
    const isPaginated = view !== null;

    if (!OBJECT_ID_REGEX.test(targetUserId)) {
      return NextResponse.json({
        likers: [],
        totalLikes: 0,
        likedUsers: [],
        totalLikedUsers: 0,
        hasMore: false,
        nextOffset: pageOffset,
      });
    }

    const receivedLikesPromise = view === 'sent'
      ? Promise.resolve([])
      : prisma.like.findMany({
          where: { likedUserId: targetUserId },
          select: {
            createdAt: true,
            liker: {
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
          skip: isPaginated ? pageOffset : 0,
          take: isPaginated ? pageLimit + 1 : MAX_RESULTS,
        });

    const sentLikesPromise = view === 'received'
      ? Promise.resolve([])
      : prisma.like.findMany({
          where: { likerId: targetUserId },
          select: {
            createdAt: true,
            likedUser: {
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
          skip: isPaginated ? pageOffset : 0,
          take: isPaginated ? pageLimit + 1 : MAX_RESULTS,
        });

    const [receivedLikes, sentLikes] = await Promise.all([receivedLikesPromise, sentLikesPromise]);

    const receivedHasMore = isPaginated && receivedLikes.length > pageLimit;
    const sentHasMore = isPaginated && sentLikes.length > pageLimit;
    const likersBase = (receivedHasMore
      ? receivedLikes.slice(0, pageLimit)
      : receivedLikes
    ).map((like) => ({
      id: like.liker.id,
      firstName: like.liker.firstName,
      lastName: like.liker.lastName,
      profileImageUrl: like.liker.profileImageUrl,
      role: like.liker.role,
      previousTechCenterId: like.liker.previousTechCenterId,
      generalCourse: like.liker.generalCourse,
      techCenter: like.liker.techCenter,
      likedAt: like.createdAt.toISOString(),
    }));

    const likedUsersBase = (sentHasMore
      ? sentLikes.slice(0, pageLimit)
      : sentLikes
    ).map((like) => ({
      id: like.likedUser.id,
      firstName: like.likedUser.firstName,
      lastName: like.likedUser.lastName,
      profileImageUrl: like.likedUser.profileImageUrl,
      role: like.likedUser.role,
      previousTechCenterId: like.likedUser.previousTechCenterId,
      generalCourse: like.likedUser.generalCourse,
      techCenter: like.likedUser.techCenter,
      likedAt: like.createdAt.toISOString(),
    }));

    const allIds = [
      ...likersBase.map((u) => u.id),
      ...likedUsersBase.map((u) => u.id),
    ];
    const statsMap = await getStatsForUsers(currentUser.id, allIds);

    // Fetch previous tech centers for directors
    const previousTechCenterIds = Array.from(
      new Set(
        [...likersBase, ...likedUsersBase]
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

    const withStats = <T extends { id: string; role?: { name: string } | null; previousTechCenterId?: string | null }>(u: T) => ({
      ...u,
      previousTechCenter:
        u.role?.name === 'super_admin' && u.previousTechCenterId
          ? previousTechCentersById.get(u.previousTechCenterId) ?? null
          : null,
      ...(statsMap.get(u.id) ?? EMPTY_STATS),
    });

    const likers = likersBase.map(withStats);
    const likedUsers = likedUsersBase.map((u) => ({
      ...withStats(u),
      isLiked: true, // the viewer liked this user (by definition of this list)
    }));

    const [totalLikes, totalLikedUsers] = await Promise.all([
      prisma.like.count({ where: { likedUserId: targetUserId } }),
      prisma.like.count({ where: { likerId: targetUserId } }),
    ]);

    return NextResponse.json(
      {
        likers,
        totalLikes,
        likedUsers,
        totalLikedUsers,
        hasMore: view === 'sent' ? sentHasMore : view === 'received' ? receivedHasMore : false,
        nextOffset:
          pageOffset +
          (view === 'sent' ? likedUsers.length : view === 'received' ? likers.length : 0),
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[likes] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 },
    );
  }
}