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

    // Calculate total visits
    const totalVisits = pageVisits.reduce((sum, page) => sum + page.count, 0);

    return NextResponse.json({
      totalVisits,
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
