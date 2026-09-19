import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    await requireAuth();

    const students = await prisma.user.findMany({
      where: {
        profileImageUrl: { not: null },
        techCenterId: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        generalCourse: true,
        techCenter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return NextResponse.json(students, {
      headers: {
        // No caching — always serve fresh data so updated profile images
        // are picked up immediately instead of being held for 60–300 s.
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Discover students API error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch discover students' },
      { status: 500 },
    );
  }
}
