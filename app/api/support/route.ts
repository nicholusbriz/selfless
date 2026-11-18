import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SupportRequestCategory } from '@prisma/client';

import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

const MANAGER_ROLES = new Set(['super_admin', 'dev']);

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

    const canManage = MANAGER_ROLES.has(user.role?.name ?? '');
    const requests = await prisma.supportRequest.findMany({
      where: canManage ? undefined : { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ requests, canManage });
  } catch (error) {
    console.error('Error fetching IT support reports:', error);
    return NextResponse.json(
      { error: 'Failed to load support reports' },
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

    const body = await parseJsonBody(request, {
      category: isString,
      subject: isString,
      message: isString,
    });
    if (!body) return invalidJsonBodyResponse();

    const category =
      body.category === 'ISSUE'
        ? SupportRequestCategory.ISSUE
        : body.category === 'FEATURE_REQUEST'
          ? SupportRequestCategory.FEATURE_REQUEST
          : null;
    const subject = body.subject.trim();
    const message = body.message.trim();

    if (!category || !subject || subject.length > 120) {
      return NextResponse.json(
        { error: 'Choose a valid report type and enter a subject of 1–120 characters' },
        { status: 400 },
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Report details must be between 10 and 5000 characters' },
        { status: 400 },
      );
    }

    const supportRequest = await prisma.supportRequest.create({
      data: {
        userId: user.id,
        category,
        subject,
        message,
      },
    });

    return NextResponse.json({ request: supportRequest }, { status: 201 });
  } catch (error) {
    console.error('Error submitting IT support report:', error);
    return NextResponse.json(
      { error: 'Failed to submit your report' },
      { status: 500 },
    );
  }
}
