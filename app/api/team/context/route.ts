import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const user = await requireAuth();
    const techCenterId = user.role?.name === 'super_admin'
      ? user.previousTechCenterId
      : user.techCenterId;

    if (!techCenterId) {
      return NextResponse.json({ techCenterId: null, techCenter: null });
    }

    const techCenter = user.role?.name === 'super_admin'
      ? await prisma.techCenter.findUnique({
          where: { id: techCenterId },
          select: {
            id: true,
            name: true,
            country: { select: { name: true } },
          },
        })
      : user.techCenter;

    if (!techCenter) {
      return NextResponse.json({ techCenterId: null, techCenter: null });
    }

    return NextResponse.json({
      techCenterId: techCenter.id,
      techCenter,
    });
  } catch (error) {
    console.error('Team context API error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to resolve team context' }, { status: 500 });
  }
}