import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { mediaCommentInclude } from '../_lib/interactions';

export const runtime = 'nodejs';

const MAX_IDS = 50;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idsParam = request.nextUrl.searchParams.get('ids') ?? '';
  const mediaIds = Array.from(
    new Set(idsParam.split(',').map((id) => id.trim()).filter(Boolean)),
  ).slice(0, MAX_IDS);

  if (mediaIds.length === 0) {
    return NextResponse.json({ success: true, items: {} });
  }

  try {
    const [likeCounts, commentCounts, userLikes, userSaves, recentComments] = await Promise.all([
      prisma.mediaLike.groupBy({
        by: ['mediaId'],
        where: { mediaId: { in: mediaIds } },
        _count: { _all: true },
      }),
      prisma.mediaComment.groupBy({
        by: ['mediaId'],
        where: { mediaId: { in: mediaIds } },
        _count: { _all: true },
      }),
      prisma.mediaLike.findMany({
        where: { mediaId: { in: mediaIds }, userId: session.user.id },
        select: { mediaId: true },
      }),
      prisma.mediaSave.findMany({
        where: { mediaId: { in: mediaIds }, userId: session.user.id },
        select: { mediaId: true },
      }),
      prisma.mediaComment.findMany({
        where: { mediaId: { in: mediaIds } },
        include: mediaCommentInclude,
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    const likeMap = new Map(likeCounts.map((r) => [r.mediaId, r._count._all]));
    const commentMap = new Map(commentCounts.map((r) => [r.mediaId, r._count._all]));
    const likedSet = new Set(userLikes.map((r) => r.mediaId));
    const savedSet = new Set(userSaves.map((r) => r.mediaId));

    // Group latest comments per post (max 10, chronological)
    const commentsByMedia = new Map<string, unknown[]>();
    for (const comment of recentComments) {
      const list = commentsByMedia.get(comment.mediaId) ?? [];
      if (list.length < 10) {
        list.push({
          id: comment.id,
          parentId: comment.parentId,
          content: comment.content,
          createdAt: comment.createdAt,
          author: comment.author,
        });
        commentsByMedia.set(comment.mediaId, list);
      }
    }
    for (const list of commentsByMedia.values()) list.reverse();

    const items: Record<
      string,
      {
        likeCount: number;
        commentCount: number;
        isLiked: boolean;
        isSaved: boolean;
        comments: unknown[];
      }
    > = {};
    for (const id of mediaIds) {
      items[id] = {
        likeCount: likeMap.get(id) ?? 0,
        commentCount: commentMap.get(id) ?? 0,
        isLiked: likedSet.has(id),
        isSaved: savedSet.has(id),
        comments: commentsByMedia.get(id) ?? [],
      };
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Batch media interactions failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load interactions' },
      { status: 500 },
    );
  }
}
