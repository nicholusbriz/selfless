import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

/**
 * GET /api/admin/all-tech-centers
 *
 * Returns all active tech centers so admin / super-admin / dev users can
 * populate a reassignment dropdown in user-management pages.
 * Accessible to any authenticated admin-level role.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['super_admin', 'admin', 'dev'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const techCenters = await prisma.techCenter.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(techCenters, {
      headers: { 'Cache-Control': 'private, max-age=120, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error fetching tech centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech centers' },
      { status: 500 },
    );
  }
}
