import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await requireAuth();

    if (
      !adminUser ||
      (adminUser.role?.name !== 'dev' && adminUser.role?.name !== 'super_admin')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Users active in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activeUsers = await prisma.user.findMany({
      where: {
        lastActiveAt: {
          gte: twentyFourHoursAgo,
        },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        lastActiveAt: true,
        currentSessionId: true,
        techCenter: {
          select: {
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return NextResponse.json({
      activeUsers,
      count: activeUsers.length,
    });
  } catch (error) {
    console.error('Active sessions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active sessions' },
      { status: 500 }
    );
  }
}
