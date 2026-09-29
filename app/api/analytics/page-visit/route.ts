// app/api/analytics/page-visit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pagePath } = body;

    if (!pagePath || typeof pagePath !== 'string') {
      return NextResponse.json(
        { error: 'Invalid page path' },
        { status: 400 }
      );
    }

    // Use upsert to either create a new page visit count or increment existing one
    const pageVisit = await prisma.pageVisitCount.upsert({
      where: { pagePath },
      create: {
        pagePath,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
        lastVisitAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      pagePath: pageVisit.pagePath,
      count: pageVisit.count,
    });
  } catch (error) {
    console.error('Page visit tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track page visit' },
      { status: 500 }
    );
  }
}
