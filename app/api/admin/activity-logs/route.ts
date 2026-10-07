import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

// ============================================================
// GET /api/admin/activity-logs
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim() ?? '';
    const action = searchParams.get('action') ?? '';
    const limitParam = searchParams.get('limit') ?? '50';
    const offset = Number(searchParams.get('offset') ?? '0');
    const all = limitParam === 'all';

    const limit = all ? 10000 : Number(limitParam);

    console.log('Activity logs API - params:', { search, action, limit, offset, all });

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { page: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { method: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          techCenter: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [logs, total, actionStatsRaw] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: all ? 10000 : Number(limit),
        skip: all ? 0 : Number(offset),
        include: {
          user: true,
          techCenter: true,
        },
      }),

      prisma.activityLog.count({ where }),

      prisma.activityLog.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
      }),
    ]);

    const actionStats = actionStatsRaw.map((s) => ({
      action: s.action,
      count: s._count.action,
    }));

    console.log('Activity logs API - Returning:', { logsCount: logs.length, total });

    return NextResponse.json({
      logs,
      total,
      actionStats,
    });
  } catch (error) {
    console.error('Activity logs GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/admin/activity-logs
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const logId = searchParams.get('logId');
    const action = searchParams.get('action');

    if (!logId && !action) {
      return NextResponse.json(
        { error: 'Provide logId or action' },
        { status: 400 },
      );
    }

    const result = logId
      ? await prisma.activityLog.deleteMany({ where: { id: logId } })
      : await prisma.activityLog.deleteMany({ where: { action: action! } });

    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    console.error('Activity logs DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity logs' },
      { status: 500 },
    );
  }
}