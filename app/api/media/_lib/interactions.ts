import { prisma } from '@/lib/prisma/client';

export function isObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

export async function getApprovedMedia(mediaId: string) {
  if (!isObjectId(mediaId)) return null;

  return prisma.media.findFirst({
    where: {
      id: mediaId,
      isActive: true,
      isDeleted: false,
      approvalStatus: 'APPROVED',
    },
    select: { id: true },
  });
}

export async function deleteMediaCommentsSafely(
  mediaId: string,
  rootCommentId?: string,
): Promise<string[]> {
  const comments = await prisma.mediaComment.findMany({
    where: { mediaId },
    select: { id: true, parentId: true },
  });
  const commentsById = new Map(comments.map((comment) => [comment.id, comment]));
  const commentsToDelete = new Set<string>();

  if (rootCommentId) {
    const childIds = new Map<string, string[]>();
    for (const comment of comments) {
      if (!comment.parentId) continue;
      const children = childIds.get(comment.parentId) ?? [];
      children.push(comment.id);
      childIds.set(comment.parentId, children);
    }

    const pendingIds = [rootCommentId];
    while (pendingIds.length > 0) {
      const commentId = pendingIds.pop();
      if (!commentId || commentsToDelete.has(commentId) || !commentsById.has(commentId)) {
        continue;
      }

      commentsToDelete.add(commentId);
      pendingIds.push(...(childIds.get(commentId) ?? []));
    }
  } else {
    for (const comment of comments) {
      commentsToDelete.add(comment.id);
    }
  }

  const remaining = new Map(
    comments.filter((comment) => commentsToDelete.has(comment.id))
      .map((comment) => [comment.id, comment]),
  );
  const deletedIds: string[] = [];

  while (remaining.size > 0) {
    const parentsWithRemainingChildren = new Set<string>();
    for (const comment of remaining.values()) {
      if (comment.parentId && remaining.has(comment.parentId)) {
        parentsWithRemainingChildren.add(comment.parentId);
      }
    }

    const leafIds = [...remaining.keys()].filter(
      (commentId) => !parentsWithRemainingChildren.has(commentId),
    );
    if (leafIds.length === 0) {
      throw new Error(`Could not safely delete cyclic comments for media ${mediaId}`);
    }

    await prisma.mediaComment.deleteMany({
      where: { mediaId, id: { in: leafIds } },
    });

    for (const commentId of leafIds) {
      remaining.delete(commentId);
      deletedIds.push(commentId);
    }
  }

  return deletedIds;
}

export const mediaCommentInclude = {
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
    },
  },
} as const;
