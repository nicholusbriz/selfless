import { NextRequest, NextResponse } from 'next/server';
import {
  invalidJsonBodyResponse,
  isString,
  nullable,
  optional,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';
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
      role: { select: { name: true, displayName: true } },
      techCenter: { select: { id: true, name: true } },
      previousTechCenterId: true,
    },
  },
} as const;

async function addPreviousTechCenters<T extends {
  author: {
    role: { name: string; displayName: string } | null;
    techCenter: { id: string; name: string } | null;
    previousTechCenterId: string | null;
  };
}>(comments: T[]) {
  const previousCenterIds = Array.from(
    new Set(
      comments
        .filter(
          ({ author }) =>
            author.role?.name === 'super_admin' &&
            !author.techCenter &&
            author.previousTechCenterId,
        )
        .map(({ author }) => author.previousTechCenterId!),
    ),
  );
  const previousCenters = previousCenterIds.length
    ? await prisma.techCenter.findMany({
        where: { id: { in: previousCenterIds } },
        select: { id: true, name: true },
      })
    : [];
  const previousCentersById = new Map(
    previousCenters.map((techCenter) => [techCenter.id, techCenter]),
  );

  return comments.map((comment) => ({
    ...comment,
    author: {
      ...comment.author,
      techCenter:
        comment.author.techCenter ??
        (comment.author.role?.name === 'super_admin' &&
        comment.author.previousTechCenterId
          ? previousCentersById.get(comment.author.previousTechCenterId) ?? null
          : null),
    },
  }));
}

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

  return NextResponse.json({ comments: await addPreviousTechCenters(comments) });
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

  const body = await parseJsonBody(request, {
    content: isString,
    parentId: optional(nullable(isString)),
  });
  if (!body) return invalidJsonBodyResponse();
  const content = body.content.trim();
  const parentId = body.parentId ?? null;

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

  const [commentWithPreviousTechCenter] = await addPreviousTechCenters([comment]);

  return NextResponse.json({ comment: commentWithPreviousTechCenter }, { status: 201 });
}
