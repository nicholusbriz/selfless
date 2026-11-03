import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { getApprovedMedia } from '../../_lib/interactions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { mediaId } = await params;
  const media = await getApprovedMedia(mediaId);
  if (!media) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    const [likeCount, commentCount, userLike, userSave] = await Promise.all([
      prisma.mediaLike.count({ where: { mediaId } }),
      prisma.mediaComment.count({ where: { mediaId } }),
      prisma.mediaLike.findUnique({
        where: { mediaId_userId: { mediaId, userId: session.user.id } },
        select: { id: true },
      }),
      prisma.mediaSave.findUnique({
        where: { mediaId_userId: { mediaId, userId: session.user.id } },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      likeCount,
      commentCount,
      isLiked: Boolean(userLike),
      isSaved: Boolean(userSave),
    });
  } catch (error) {
    console.error('Load media interactions failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load post interactions' },
      { status: 500 },
    );
  }
}
