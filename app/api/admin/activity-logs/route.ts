import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth, hasRole } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await requireAuth();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get('all') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const techCenterId = searchParams.get('techCenterId');

    const baseWhere: any = { userId: { not: null } };

    // Dev and super_admin can see all logs by default, with optional filtering
    // Admin can only see logs for their own tech center
    if (hasRole(adminUser, 'dev') || hasRole(adminUser, 'super_admin')) {
      // Can filter by tech center if provided, otherwise see all
      if (techCenterId) baseWhere.techCenterId = techCenterId;
    } else if (hasRole(adminUser, 'admin')) {
      // Admin can only see logs for their own tech center
      baseWhere.techCenterId = adminUser.techCenterId;
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (userId) baseWhere.userId = userId;
    const where = action ? { ...baseWhere, action } : baseWhere;

    const [logs, total, actionRows] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
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
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...(fetchAll ? {} : { take: limit, skip: offset }),
      }),
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where: baseWhere,
        select: { action: true },
      }),
    ]);

    const actionCounts = new Map<string, number>();
    actionRows.forEach(({ action: actionName }) => {
      actionCounts.set(actionName, (actionCounts.get(actionName) ?? 0) + 1);
    });
    const actionStats = Array.from(actionCounts, ([actionName, count]) => ({
      action: actionName,
      count,
    })).sort((a, b) => b.count - a.count || a.action.localeCompare(b.action));

    return NextResponse.json({
      logs,
      total,
      actionStats,
    });
  } catch (error) {
    console.error('Activity logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
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

    const where: any = {};

    if (logId) {
      where.id = logId;
    } else {
      if (action) where.action = action;
      if (techCenterId) where.techCenterId = techCenterId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
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
      { status: 500 }
    );
  }
}
