import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { getApprovedMedia } from '../../_lib/interactions';

interface RouteContext {
  params: Promise<{ mediaId: string }>;
}

async function setLike(context: RouteContext, liked: boolean) {
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
    if (liked) {
      await prisma.mediaLike.upsert({
        where: {
          mediaId_userId: { mediaId, userId: session.user.id },
        },
        create: { mediaId, userId: session.user.id },
        update: {},
      });
    } else {
      await prisma.mediaLike.deleteMany({
        where: { mediaId, userId: session.user.id },
      });
    }

    const likeCount = await prisma.mediaLike.count({ where: { mediaId } });
    return NextResponse.json({ success: true, likeCount, isLiked: liked });
  } catch (error) {
    console.error('Update media like failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not update post like' },
      { status: 500 },
    );
  }
}

export async function PUT(_request: Request, context: RouteContext) {
  return setLike(context, true);
}

export async function DELETE(_request: Request, context: RouteContext) {
  return setLike(context, false);
}
