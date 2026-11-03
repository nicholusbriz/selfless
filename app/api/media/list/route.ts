// app/api/media/list/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // Still require a logged-in user — just don't filter by userId
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const requestedStatus = searchParams.get('status')?.toUpperCase();
    const includeAll = searchParams.get('includeAll') === 'true';
    const mine = searchParams.get('mine') === 'true';
    const saved = searchParams.get('saved') === 'true';
    const countOnly = searchParams.get('countOnly') === 'true';
    const paginationRequested = mine && (
      searchParams.has('limit') || searchParams.has('offset')
    );
    const requestedLimit = Number(searchParams.get('limit') ?? '10');
    const requestedOffset = Number(searchParams.get('offset') ?? '0');
    const canReview =
      user.role?.name === 'dev' || user.role?.name === 'super_admin';

    if (
      countOnly &&
      (category !== 'gallery' ||
        mine ||
        saved ||
        requestedStatus ||
        includeAll)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid media count request' },
        { status: 400 },
      );
    }

    if (
      paginationRequested &&
      (!Number.isInteger(requestedLimit) ||
        requestedLimit < 1 ||
        requestedLimit > 50 ||
        !Number.isInteger(requestedOffset) ||
        requestedOffset < 0)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 },
      );
    }

    if (
      requestedStatus &&
      !['PENDING', 'APPROVED', 'REJECTED'].includes(requestedStatus)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid media status' },
        { status: 400 },
      );
    }

    if (requestedStatus && requestedStatus !== 'APPROVED' && !canReview && !mine) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 },
      );
    }

    // Dev and super_admin can see all posts when includeAll is true
    const canSeeAll =
      canReview && (includeAll || category === 'dashboard' || category === 'dashbord');
    const categoryFilter =
      category === 'dashboard'
        ? { in: ['dashboard', 'dashbord'] }
        : category;
    const savedMediaIds = saved
      ? await prisma.mediaSave.findMany({
          where: { userId: user.id },
          select: { mediaId: true },
        }).then((saves) => saves.map((save) => save.mediaId))
      : undefined;

    if (saved && savedMediaIds?.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    const where = {
        isActive: true,
        isDeleted: false,
        ...(mine ? { userId: user.id } : {}),
        ...(saved ? { id: { in: savedMediaIds } } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(requestedStatus
          ? { approvalStatus: requestedStatus }
          : mine
            ? {}
          : saved
            ? { approvalStatus: 'APPROVED' }
          : canSeeAll
            ? {}
            : { approvalStatus: 'APPROVED' }),
      };

    if (countOnly) {
      const totalCount = await prisma.media.count({ where });
      return NextResponse.json({ success: true, totalCount });
    }

    const itemsQuery = prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(paginationRequested
        ? { skip: requestedOffset, take: requestedLimit + 1 }
        : {}),
      // Include uploader info so the UI can show who uploaded what
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            techCenter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (paginationRequested) {
      const [pagedItems, totalCount] = await Promise.all([
        itemsQuery,
        prisma.media.count({ where }),
      ]);
      const hasMore = pagedItems.length > requestedLimit;
      const statusCounts =
        requestedOffset === 0
          ? await Promise.all([
              prisma.media.count({
                where: { ...where, approvalStatus: 'APPROVED' },
              }),
              prisma.media.count({
                where: { ...where, approvalStatus: 'PENDING' },
              }),
              prisma.media.count({
                where: { ...where, approvalStatus: 'REJECTED' },
              }),
            ])
          : undefined;
      return NextResponse.json({
        success: true,
        items: hasMore ? pagedItems.slice(0, requestedLimit) : pagedItems,
        hasMore,
        totalCount,
        ...(statusCounts
          ? {
              statusCounts: {
                APPROVED: statusCounts[0],
                PENDING: statusCounts[1],
                REJECTED: statusCounts[2],
              },
            }
          : {}),
      });
    }

    const items = await itemsQuery;
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('List media failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not list media' },
      { status: 500 },
    );
  }
}