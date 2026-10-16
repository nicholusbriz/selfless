import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch all tech centers (for dev dropdown)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'dev' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Dev or Super Admin privileges required.' }, { status: 403 });
    }

    const techCenters = await prisma.techCenter.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(techCenters);
  } catch (error) {
    console.error('Error fetching tech centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech centers' },
      { status: 500 }
    );
  }
}
