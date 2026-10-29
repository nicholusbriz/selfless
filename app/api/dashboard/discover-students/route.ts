import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// DB is hit at most once per 5 minutes (or until revalidateTag is called).
// The ordered list is cached; the shuffle happens per-request below.
const getDiscoverStudents = unstable_cache(
  async () =>
    prisma.user.findMany({
      where: {
        profileImageUrl: { not: null },
        role: { is: { name: { not: 'dev' } } },
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
        role: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
  ['discover-students'],
  { revalidate: 300, tags: ['discover-students'] },
);

export async function GET() {
  try {
    await requireAuth();

    const students = await getDiscoverStudents();

    // Fresh shuffle on every request — response is never cached.
    return NextResponse.json(shuffle(students), {
      headers: {
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