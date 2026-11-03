import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { getApprovedMedia } from '../../_lib/interactions';

interface RouteContext {
  params: Promise<{ mediaId: string }>;
}

async function setSaved(context: RouteContext, saved: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { mediaId } = await context.params;
  const media = await getApprovedMedia(mediaId);
  if (!media) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    if (saved) {
      await prisma.mediaSave.upsert({
        where: { mediaId_userId: { mediaId, userId: session.user.id } },
        create: { mediaId, userId: session.user.id },
        update: {},
      });
    } else {
      await prisma.mediaSave.deleteMany({
        where: { mediaId, userId: session.user.id },
      });
    }

    return NextResponse.json({ success: true, isSaved: saved });
  } catch (error) {
    console.error('Update saved media failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not update saved post' },
      { status: 500 },
    );
  }
}

export async function PUT(_request: Request, context: RouteContext) {
  return setSaved(context, true);
}

export async function DELETE(_request: Request, context: RouteContext) {
  return setSaved(context, false);
}
