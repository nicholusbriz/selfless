import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [techCenters, roles] = await Promise.all([
      prisma.techCenter.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: 'asc' },
      }),
      prisma.role.findMany({
        where: session.user.role === 'dev' ? {} : { name: { not: 'dev' } },
        select: { id: true, name: true, displayName: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      filters: {
        techCenters,
        roles,
        statuses: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      },
    });
  } catch (error) {
    console.error('Error fetching user filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user filters' },
      { status: 500 },
    );
  }
}
