import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { endOfDayEAT, startOfDayEAT, startOfDayUTC } from '@/lib/english-hub/datetime';

const STAFF_ROLES = ['teacher', 'admin', 'super_admin'];

function parseDateParam(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : startOfDayUTC(date);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true },
    });

    if (!user?.techCenterId) {
      return NextResponse.json(
        { success: false, error: 'User not associated with a tech center' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') ?? startOfDayEAT(new Date()).toISOString().slice(0, 10);
    const sessionDate = parseDateParam(dateParam);
    if (!sessionDate) {
      return NextResponse.json({ success: false, error: 'Invalid date parameter' }, { status: 400 });
    }

    const row = await prisma.englishHubRegistration.findFirst({
      where: {
        techCenterId: user.techCenterId,
        sessionDate,
        manualOverrideAt: { not: null },
      },
      orderBy: { manualOverrideAt: 'desc' },
      select: {
        manuallyOpened: true,
        manuallyClosed: true,
        manualOverrideAt: true,
        sessionDate: true,
        manualOverrideBy: true,
      },
    });
    const actor = row?.manualOverrideBy
      ? await prisma.user.findUnique({
          where: { id: row.manualOverrideBy },
          select: { firstName: true, lastName: true },
        })
      : null;

    return NextResponse.json({
      success: true,
      data: {
        manuallyOpened: row?.manuallyOpened ?? false,
        manuallyClosed: row?.manuallyClosed ?? false,
        manualOverrideAt: row?.manualOverrideAt ?? null,
        sessionDate: row?.sessionDate ?? sessionDate,
        actorName: actor ? `${actor.firstName} ${actor.lastName}`.trim() : null,
      },
    });
  } catch (error) {
    console.error('Error checking English Hub override:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check override' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, techCenterId: true },
    });

    if (!user || !STAFF_ROLES.includes(user.role?.name ?? '')) {
      return NextResponse.json(
        { success: false, error: 'Only teachers and admins can override registration' },
        { status: 403 }
      );
    }

    if (!user.techCenterId) {
      return NextResponse.json(
        { success: false, error: 'User not associated with a tech center' },
        { status: 400 }
      );
    }

    const body = await request.json() as { action?: unknown; sessionDate?: unknown };
    if (body.action !== 'open' && body.action !== 'close') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "open" or "close"' },
        { status: 400 }
      );
    }

    const now = new Date();
    const sessionDate = startOfDayEAT(now);
    const graceEnd = new Date(endOfDayEAT(sessionDate).getTime() + 6 * 60 * 60 * 1000);
    if (now.getTime() > graceEnd.getTime()) {
      return NextResponse.json(
        { success: false, error: 'The registration date is outside the override grace window' },
        { status: 410 }
      );
    }

    const action = body.action;
    const row = await prisma.englishHubRegistration.upsert({
      where: {
        userId_sessionDate: {
          userId: session.user.id,
          sessionDate,
        },
      },
      create: {
        userId: session.user.id,
        techCenterId: user.techCenterId,
        sessionDate,
        attendanceStatus: 'OVERRIDE_ROW',
        manuallyOpened: action === 'open',
        manuallyClosed: action === 'close',
        manualOverrideBy: session.user.id,
        manualOverrideAt: now,
      },
      update: {
        manuallyOpened: action === 'open',
        manuallyClosed: action === 'close',
        manualOverrideBy: session.user.id,
        manualOverrideAt: now,
      },
    });

    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('Error overriding English Hub registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to override registration' },
      { status: 500 }
    );
  }
}
