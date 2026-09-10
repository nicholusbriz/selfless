import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

async function getAccessibleAnnouncement(announcementId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { techCenterId: true },
  });

  if (!user) return null;

  return prisma.announcement.findFirst({
    where: {
      id: announcementId,
      isActive: true,
      OR: [{ isGlobal: true }, { techCenterId: user.techCenterId }],
    },
    select: { id: true },
  });
}

const commentInclude = {
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      role: { select: { displayName: true } },
    },
  },
} as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { announcementId } = await params;
  const announcement = await getAccessibleAnnouncement(announcementId, session.user.id);
  if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

  const comments = await prisma.announcementComment.findMany({
    where: { announcementId },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { announcementId } = await params;
  const announcement = await getAccessibleAnnouncement(announcementId, session.user.id);
  if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const parentId = typeof body.parentId === 'string' ? body.parentId : null;

  if (!content) return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
  if (content.length > 1000) return NextResponse.json({ error: 'Comment is too long' }, { status: 400 });

  if (parentId) {
    const parent = await prisma.announcementComment.findFirst({
      where: { id: parentId, announcementId },
      select: { id: true },
    });
    if (!parent) return NextResponse.json({ error: 'Reply target not found' }, { status: 404 });
  }

  const comment = await prisma.announcementComment.create({
    data: { announcementId, authorId: session.user.id, parentId, content },
    include: commentInclude,
  });

  return NextResponse.json({ comment }, { status: 201 });
}
