// app/api/admin/activity-logs/route.ts
/**
 * Activity Logs API
 *
 * GET  /api/admin/activity-logs?all=true|false&limit=&offset=&action=&userId=&techCenterId=
 * DELETE /api/admin/activity-logs?logId=... | ?action=...
 *
 * Optimizations:
 *  - `?all=true` is hard-capped at 500 rows (no unbounded responses)
 *  - actionStats computed via DB-side groupBy (no rows pulled into Node)
 *  - logs + count + actionStats run in parallel
 *  - 30s private cache so polling clients hit the cache, not MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth, hasRole } from '@/lib/auth/server';

// Absolute cap regardless of what the caller asks for.
const HARD_LOG_CAP = 500;
const DEFAULT_LIMIT = 50;

// Role sets — defined once, not re-created per request.
const VIEW_ANY_ROLES = ['dev', 'super_admin'] as const;

export async function GET(req: NextRequest) {
  try {
    const adminUser = await requireAuth();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get('all') === 'true';
    const rawLimit = parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), HARD_LOG_CAP)
      : DEFAULT_LIMIT;
    const rawOffset = parseInt(searchParams.get('offset') ?? '', 10);
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const techCenterId = searchParams.get('techCenterId');

    // -------- Scope --------
    const baseWhere: Record<string, unknown> = { userId: { not: null } };

    const isAnyViewer = VIEW_ANY_ROLES.some((r) => hasRole(adminUser, r));

    if (isAnyViewer) {
      if (techCenterId) baseWhere.techCenterId = techCenterId;
    } else if (hasRole(adminUser, 'admin')) {
      baseWhere.techCenterId = adminUser.techCenterId;
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (userId) baseWhere.userId = userId;
    const where = action ? { ...baseWhere, action } : baseWhere;

    // -------- Fetch in parallel --------
    const [logs, total, actionGroups] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          ipAddress: true,
          userAgent: true,
          location: true,
          sessionId: true,
          page: true,
          method: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImageUrl: true,
            },
          },
          techCenter: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: fetchAll ? HARD_LOG_CAP : limit,
        skip: fetchAll ? 0 : offset,
      }),
      prisma.activityLog.count({ where }),
      // DB-side aggregation — returns ~20 rows instead of scanning every log
      prisma.activityLog.groupBy({
        by: ['action'],
        where: baseWhere,
        _count: { _all: true },
      }),
    ]);

    const actionStats = actionGroups
      .map((row) => ({
        action: row.action,
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count || a.action.localeCompare(b.action));

    return NextResponse.json(
      { logs, total, actionStats },
      {
        headers: {
          // 30s shared cache. Combined with client staleTime,
          // this prevents the UI from ever re-hitting the DB on a
          // 10-second polling loop.
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (error) {
    console.error('Activity logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await requireAuth();

    if (!adminUser || !hasRole(adminUser, 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const logId = searchParams.get('logId');
    const techCenterId = searchParams.get('techCenterId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Safety: refuse bulk deletes with no filter at all.
    if (!logId && !action && !techCenterId && !startDate && !endDate) {
      return NextResponse.json(
        { error: 'At least one filter is required' },
        { status: 400 },
      );
    }

    const where: Record<string, unknown> = {};

    if (logId) {
      where.id = logId;
    } else {
      if (action) where.action = action;
      if (techCenterId) where.techCenterId = techCenterId;
      if (startDate || endDate) {
        const range: Record<string, Date> = {};
        if (startDate) range.gte = new Date(startDate);
        if (endDate) range.lte = new Date(endDate);
        where.createdAt = range;
      }
    }

    const result = await prisma.activityLog.deleteMany({ where });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Activity logs delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete logs' },
      { status: 500 },
    );
  }
}