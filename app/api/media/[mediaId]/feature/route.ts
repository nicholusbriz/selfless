import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  try {
    const user = await requireAuth();
    const canReview =
      user.role?.name === 'dev' || user.role?.name === 'super_admin';
    if (!canReview) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { mediaId } = await params;
    const body = (await request.json().catch(() => null)) as { featured?: unknown } | null;
    const featured = body?.featured === true;

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.isDeleted) {
      return NextResponse.json({ success: false, error: 'Media not found' }, { status: 404 });
    }

    const updated = await prisma.media.update({
      where: { id: mediaId },
      data: { isFeatured: featured },
      select: { id: true, isFeatured: true, category: true, contentType: true },
    });

    return NextResponse.json({ success: true, media: updated });
  } catch (error) {
    console.error('Feature media failed:', error);
    return NextResponse.json({ success: false, error: 'Could not update featured status' }, { status: 500 });
  }
}
