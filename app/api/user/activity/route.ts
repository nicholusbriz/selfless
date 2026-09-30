// app/api/user/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
const TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const user = await getServerAuthUser();

    if (!user) {
      return NextResponse.json({ success: true, counted: false });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const rawPath =
      typeof body.pagePath === 'string'
        ? body.pagePath
        : typeof body.pathname === 'string'
          ? body.pathname
          : typeof body.page === 'string'
            ? body.page
            : null;

    const pagePath = rawPath?.trim() || null;

    if (!pagePath) {
      // A heartbeat without a page → just update lastActiveAt, don't count a visit.
      void prisma.user
        .update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        })
        .catch(() => {});
      return NextResponse.json({ success: true, counted: false });
    }

    if (
      pagePath.startsWith('/api/') ||
      pagePath.startsWith('/_next/') ||
      pagePath.startsWith('/static/') ||
      pagePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$/i)
    ) {
      return NextResponse.json({ success: true, counted: false });
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - DEDUPE_WINDOW_MS);
    const expiresAt = new Date(now.getTime() + TTL_MS);

    const existing = await prisma.pageVisitEvent.findFirst({
      where: {
        userId: user.id,
        pagePath,
        visitedAt: { gte: windowStart },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ success: true, counted: false });
    }

    await prisma.pageVisitEvent.create({
      data: {
        userId: user.id,
        pagePath,
        visitedAt: now,
        expiresAt,
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      },
    });

    // Fire-and-forget: response returns without waiting for these.
    void Promise.all([
      prisma.pageVisitCount.upsert({
        where: { pagePath },
        create: { pagePath, count: 1 },
        update: { count: { increment: 1 }, lastVisitAt: now },
      }),
      prisma.userPageVisitCount.upsert({
        where: {
          userId_pagePath: { userId: user.id, pagePath },
        },
        create: { userId: user.id, pagePath, count: 1, lastVisitAt: now },
        update: { count: { increment: 1 }, lastVisitAt: now },
      }),
    ]).catch((err) => {
      console.warn('[activity] cumulative upsert failed:', err);
    });

    return NextResponse.json({ success: true, counted: true });
  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json({ success: true, counted: false });
  }
}