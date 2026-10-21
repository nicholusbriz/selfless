import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// DELETE — a user can delete their own comment; admins/super_admins/dev can
// delete any comment within an accessible announcement.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ announcementId: string; commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { announcementId, commentId } = await params;

  // Load the comment and the caller's role in one round-trip.
  const [comment, caller] = await Promise.all([
    prisma.announcementComment.findUnique({
      where: { id: commentId },
      select: { id: true, announcementId: true, authorId: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: { select: { name: true } },
        techCenterId: true,
      },
    }),
  ]);

  if (!comment || comment.announcementId !== announcementId) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const isOwner = comment.authorId === session.user.id;
  const callerRole = caller?.role?.name ?? '';
  const isPrivileged = ['admin', 'super_admin', 'dev'].includes(callerRole);

  if (!isOwner && !isPrivileged) {
    return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
  }

  // Deleting a parent comment also removes its replies because the schema uses
  // onDelete: NoAction on the self-relation, so we delete all replies first.
  await prisma.$transaction([
    prisma.announcementComment.deleteMany({ where: { parentId: commentId } }),
    prisma.announcementComment.delete({ where: { id: commentId } }),
  ]);

  return NextResponse.json({ success: true });
}
