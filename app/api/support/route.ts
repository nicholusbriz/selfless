import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

const MANAGER_ROLES = new Set(['admin', 'super_admin', 'dev']);

async function getSessionUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: { select: { name: true } },
    },
  });
}

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resources = await prisma.supportResource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      resources,
      canManage: MANAGER_ROLES.has(user.role?.name ?? ''),
    });
  } catch (error) {
    console.error('Error fetching support resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support resources' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!MANAGER_ROLES.has(user.role?.name ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const link = typeof body.link === 'string' ? body.link.trim() : '';
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';

    if (!title || !link || !description) {
      return NextResponse.json(
        { error: 'Title, link, and description are required' },
        { status: 400 },
      );
    }

    let parsedLink: URL;
    try {
      parsedLink = new URL(link);
    } catch {
      return NextResponse.json(
        { error: 'Link must be a valid URL' },
        { status: 400 },
      );
    }

    if (!['http:', 'https:'].includes(parsedLink.protocol)) {
      return NextResponse.json(
        { error: 'Link must use http or https' },
        { status: 400 },
      );
    }

    const resource = await prisma.supportResource.create({
      data: {
        title,
        link: parsedLink.toString(),
        description,
        createdById: user.id,
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error('Error creating support resource:', error);
    return NextResponse.json(
      { error: 'Failed to create support resource' },
      { status: 500 },
    );
  }
}