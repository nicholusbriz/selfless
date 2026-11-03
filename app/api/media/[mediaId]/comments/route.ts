import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  invalidJsonBodyResponse,
  isString,
  nullable,
  optional,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';
import { authOptions } from '@/lib/auth/nextauth';
import { MAX_MEDIA_COMMENT_LENGTH } from '@/lib/media-comments';
import { prisma } from '@/lib/prisma/client';
import {
  getApprovedMedia,
  isObjectId,
  mediaCommentInclude,
} from '../../_lib/interactions';
import { createNotificationForUser } from '@/lib/notifications';

interface RouteContext {
  params: Promise<{ mediaId: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
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
    const comments = await prisma.mediaComment.findMany({
      where: { mediaId },
      include: mediaCommentInclude,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Load media comments failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load post comments' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
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

  const body = await parseJsonBody(request, {
    content: isString,
    parentId: optional(nullable(isString)),
  });
  if (!body) return invalidJsonBodyResponse();

  const content = body.content.trim();
  const parentId = body.parentId ?? null;
  if (!content) {
    return NextResponse.json(
      { success: false, error: 'Comment cannot be empty' },
      { status: 400 },
    );
  }
  if (content.length > MAX_MEDIA_COMMENT_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Comment must be ${MAX_MEDIA_COMMENT_LENGTH} characters or fewer`,
      },
      { status: 400 },
    );
  }
  if (parentId && !isObjectId(parentId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid reply target' },
      { status: 400 },
    );
  }

  try {
    if (parentId) {
      const parent = await prisma.mediaComment.findFirst({
        where: { id: parentId, mediaId },
        select: { id: true },
      });
      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Reply target not found on this post' },
          { status: 404 },
        );
      }
    }

    const comment = await prisma.mediaComment.create({
      data: { mediaId, authorId: session.user.id, parentId, content },
      include: mediaCommentInclude,
    });

    // Create notification for the post creator (if not commenting on own post)
    if (media.userId && media.userId !== session.user.id) {
      const actorName = `${session.user.firstName} ${session.user.lastName}`.trim();
      try {
        await createNotificationForUser({
          userId: media.userId,
          title: 'New comment on your post',
          message: `${actorName} commented: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          type: 'media_comment',
          link: `/dashboard/gallery#${mediaId}`,
          generatedBy: session.user.id,
          entityType: 'media',
          entityId: mediaId,
        });
      } catch (notificationError) {
        console.error('Failed to notify user about comment:', notificationError);
      }
    }

    // If this is a reply, also notify the parent comment author
    if (parentId) {
      const parentComment = await prisma.mediaComment.findUnique({
        where: { id: parentId },
        select: { authorId: true }
      });
      if (parentComment && parentComment.authorId !== session.user.id && (!media.userId || parentComment.authorId !== media.userId)) {
        const actorName = `${session.user.firstName} ${session.user.lastName}`.trim();
        try {
          await createNotificationForUser({
            userId: parentComment.authorId,
            title: 'New reply to your comment',
            message: `${actorName} replied to your comment.`,
            type: 'media_comment_reply',
            link: `/dashboard/gallery#${mediaId}`,
            generatedBy: session.user.id,
            entityType: 'media',
            entityId: mediaId,
          });
        } catch (notificationError) {
          console.error('Failed to notify user about reply:', notificationError);
        }
      }
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error('Create media comment failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not create post comment' },
      { status: 500 },
    );
  }
}
