// app/api/analytics/page-visit-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and has dev role
    const user = await requireAuth();
    
    if (!user || user.role?.name !== 'dev') {
      return NextResponse.json(
        { error: 'Unauthorized. Dev access required.' },
        { status: 403 }
      );
    }

    // Fetch all page visit counts, sorted by count (descending)
    const pageVisits = await prisma.pageVisitCount.findMany({
      orderBy: {
        count: 'desc',
      },
    });

    const userPageVisits = await prisma.userPageVisitCount.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            techCenter: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { count: 'desc' },
    });

    // Calculate total visits
    const totalVisits = pageVisits.reduce((sum, page) => sum + page.count, 0);
    const userVisitTotals = new Map<
      string,
      {
        user: (typeof userPageVisits)[number]['user'];
        totalVisits: number;
        pagePaths: Set<string>;
        lastVisitAt: Date;
      }
    >();

    userPageVisits.forEach((visit) => {
      const current = userVisitTotals.get(visit.userId) ?? {
        user: visit.user,
        totalVisits: 0,
        pagePaths: new Set<string>(),
        lastVisitAt: visit.lastVisitAt,
      };
      current.totalVisits += visit.count;
      current.pagePaths.add(visit.pagePath);
      if (visit.lastVisitAt > current.lastVisitAt) {
        current.lastVisitAt = visit.lastVisitAt;
      }
      userVisitTotals.set(visit.userId, current);
    });

    const users = Array.from(userVisitTotals.values())
      .map(({ user, totalVisits: visitCount, pagePaths, lastVisitAt }) => ({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        techCenterName: user.techCenter?.name ?? null,
        totalVisits: visitCount,
        pagesVisited: pagePaths.size,
        lastVisitAt: lastVisitAt.toISOString(),
      }))
      .sort((a, b) => b.totalVisits - a.totalVisits);

    return NextResponse.json({
      totalVisits,
      users,
      pageVisits: pageVisits.map((page) => ({
        pagePath: page.pagePath,
        count: page.count,
        lastVisitAt: page.lastVisitAt.toISOString(),
        createdAt: page.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Fetch page visit stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page visit statistics' },
      { status: 500 }
    );
  }
}
