import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SupportRequestStatus } from '@prisma/client';

import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

const MANAGER_ROLES = new Set(['super_admin', 'dev']);
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function isSupportRequestStatus(
  value: string,
): value is SupportRequestStatus {
  return Object.values(SupportRequestStatus).includes(
    value as SupportRequestStatus,
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: { select: { name: true } } },
    });

    if (!MANAGER_ROLES.has(user?.role?.name ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reportId } = await context.params;
    if (!OBJECT_ID_PATTERN.test(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    const body = await parseJsonBody(request, { status: isString });
    if (!body) return invalidJsonBodyResponse();
    if (!isSupportRequestStatus(body.status)) {
      return NextResponse.json({ error: 'Invalid report status' }, { status: 400 });
    }

    const supportRequest = await prisma.supportRequest.update({
      where: { id: reportId },
      data: { status: body.status },
    });

    return NextResponse.json({ request: supportRequest });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    console.error('Error updating IT support report:', error);
    return NextResponse.json(
      { error: 'Failed to update support report' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: { select: { name: true } } },
    });

    if (!MANAGER_ROLES.has(user?.role?.name ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reportId } = await context.params;
    if (!OBJECT_ID_PATTERN.test(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    await prisma.supportRequest.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    console.error('Error deleting IT support report:', error);
    return NextResponse.json(
      { error: 'Failed to delete support report' },
      { status: 500 },
    );
  }
}
