import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import {
  deleteMediaCommentsSafely,
  getApprovedMedia,
  isObjectId,
} from '../../../_lib/interactions';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ mediaId: string; commentId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { mediaId, commentId } = await params;
  if (!isObjectId(commentId)) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const media = await getApprovedMedia(mediaId);
  if (!media) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    const comment = await prisma.mediaComment.findFirst({
      where: { id: commentId, mediaId },
      select: { id: true, authorId: true },
    });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 },
      );
    }

    const deletedIds = await deleteMediaCommentsSafely(mediaId, commentId);

    return NextResponse.json({ success: true, deletedIds });
  } catch (error) {
    console.error('Delete media comment failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not delete post comment' },
      { status: 500 },
    );
  }
}
