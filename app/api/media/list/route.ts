// app/api/media/list/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // Still require a logged-in user — just don't filter by userId
  try {
    await requireAuth();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const items = await prisma.media.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      // Include uploader info so the UI can show who uploaded what
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('List media failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not list media' },
      { status: 500 },
    );
  }
}