// app/api/analytics/page-visit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { pagePath } = body;

    if (!pagePath || typeof pagePath !== 'string') {
      return NextResponse.json(
        { error: 'Invalid page path' },
        { status: 400 }
      );
    }

    const [pageVisit, userPageVisit] = await Promise.all([
      prisma.pageVisitCount.upsert({
        where: { pagePath },
        create: { pagePath, count: 1 },
        update: {
          count: { increment: 1 },
          lastVisitAt: new Date(),
        },
      }),
      prisma.userPageVisitCount.upsert({
        where: {
          userId_pagePath: {
            userId: user.id,
            pagePath,
          },
        },
        create: {
          userId: user.id,
          pagePath,
          count: 1,
        },
        update: {
          count: { increment: 1 },
          lastVisitAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      pagePath: pageVisit.pagePath,
      count: pageVisit.count,
      userCount: userPageVisit.count,
    });
  } catch (error) {
    console.error('Page visit tracking error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to track page visit' },
      { status: 500 }
    );
  }
}
