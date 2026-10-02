// app/api/analytics/page-visit-stats/route.ts
/**
 * Page Visit Stats — 24-hour rolling window
 *
 * Reads from `PageVisitEvent` filtered to the last 24 hours.
 * Rows older than that are auto-deleted by MongoDB's TTL index,
 * so this endpoint never needs to clean up.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

const WINDOW_HOURS = 24;

export async function GET(_req: NextRequest) {
  try {
    const user = await getServerAuthUser();

    if (!user || user.role?.name !== 'dev') {
      return NextResponse.json(
        { error: 'Unauthorized. Dev access required.' },
        { status: 403 },
      );
    }

    const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);
    const where = { visitedAt: { gte: since } };

    // -------- 1. Per-page totals --------
    const pageGroups = await prisma.pageVisitEvent.groupBy({
      by: ['pagePath'],
      where,
      _count: { _all: true },
      _max: { visitedAt: true },
    });

    const pageVisits = pageGroups
      .map((g) => ({
        pagePath: g.pagePath,
        count: g._count._all,
        lastVisitAt: (g._max.visitedAt ?? new Date()).toISOString(),
      }))
      .sort((a, b) => b.count - a.count);

    const totalVisits = pageVisits.reduce((sum, p) => sum + p.count, 0);

    // -------- 2. Per-user totals --------
    const userGroups = await prisma.pageVisitEvent.groupBy({
      by: ['userId'],
      where,
      _count: { _all: true },
      _max: { visitedAt: true },
    });

    if (userGroups.length === 0) {
      return NextResponse.json(
        {
          totalVisits: 0,
          users: [],
          pageVisits,
          window: '24h',
          generatedAt: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
          },
        },
      );
    }

    // -------- 3. Per-user page details --------
    const userPageGroups = await prisma.pageVisitEvent.groupBy({
      by: ['userId', 'pagePath'],
      where,
      _count: { _all: true },
      _max: { visitedAt: true },
    });

    const pagesByUser = new Map<
      string,
      Array<{ pagePath: string; visits: number; lastVisitAt: string }>
    >();
    for (const group of userPageGroups) {
      const pages = pagesByUser.get(group.userId) ?? [];
      pages.push({
        pagePath: group.pagePath,
        visits: group._count._all,
        lastVisitAt: (group._max.visitedAt ?? new Date()).toISOString(),
      });
      pagesByUser.set(group.userId, pages);
    }

    // -------- 4. Enrich with user profiles --------
    const userIds = userGroups.map((g) => g.userId);
    const profiles = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        techCenter: { select: { name: true } },
      },
    });
    const profileById = new Map(profiles.map((p) => [p.id, p]));

    // -------- 5. Build response --------
    const users = userGroups
      .map((g) => {
        const profile = profileById.get(g.userId);
        if (!profile) return null;

        return {
          userId: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          techCenterName: profile.techCenter?.name ?? null,
          totalVisits: g._count._all,
          pages: (pagesByUser.get(g.userId) ?? []).sort((a, b) =>
            b.visits - a.visits || a.pagePath.localeCompare(b.pagePath),
          ),
          pagesVisited: pagesByUser.get(g.userId)?.length ?? 0,
          lastVisitAt: (g._max.visitedAt ?? new Date()).toISOString(),
        };
      })
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .sort((a, b) => b.totalVisits - a.totalVisits);

    return NextResponse.json(
      {
        totalVisits,
        users,
        pageVisits,
        window: '24h',
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      },
    );
  } catch (error) {
    console.error('Fetch page visit stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page visit statistics' },
      { status: 500 },
    );
  }
}