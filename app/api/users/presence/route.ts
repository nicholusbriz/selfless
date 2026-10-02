import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  console.info('[presence] Profile lookup request received.');
  try {
    await requireAuth();

    const ids = Array.from(
      new Set(
        (request.nextUrl.searchParams.get('ids') || '')
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ).slice(0, 250);

    const users = ids.length
      ? await prisma.user.findMany({
          where: { id: { in: ids }, status: 'ACTIVE' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            techCenter: { select: { id: true, name: true } },
          },
        })
      : [];

    console.info('[presence] Profile lookup completed.', {
      requestedCount: ids.length,
      returnedCount: users.length,
    });
    return NextResponse.json(
      { users },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      console.warn('[presence] Profile lookup rejected: unauthorized.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Failed to fetch presence profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presence profiles' },
      { status: 500 },
    );
  }
}