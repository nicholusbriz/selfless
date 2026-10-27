import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { startOfDayEAT, startOfDayUTC } from '@/lib/english-hub/datetime';
import { getRegistrationStatus, OverrideSnapshot } from '@/lib/english-hub/registration-status';

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
      select: { techCenterId: true, role: true },
    });

    if (!user?.techCenterId) {
      return NextResponse.json(
        { success: false, error: 'User not associated with a tech center' },
        { status: 400 }
      );
    }

    const isStaff = STAFF_ROLES.includes(user.role?.name ?? '');
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const today = startOfDayEAT(now);
    const dateParam = isStaff ? searchParams.get('date') ?? 'today' : 'today';
    const requestedDate = dateParam === 'today' ? today : parseDateParam(dateParam);
    if (!requestedDate) {
      return NextResponse.json({ success: false, error: 'Invalid date parameter' }, { status: 400 });
    }
    if (requestedDate.getTime() > today.getTime()) {
      return NextResponse.json({ success: false, error: 'Future dates are not available' }, { status: 400 });
    }
    const startDate = startOfDayUTC(requestedDate);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    const registrations = await prisma.englishHubRegistration.findMany({
      where: {
        techCenterId: user.techCenterId,
        attendanceStatus: { not: 'OVERRIDE_ROW' },
        sessionDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: { select: { name: true } },
          },
        },
        markedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });

    const overrideRows = isStaff ? await prisma.englishHubRegistration.findMany({
      where: {
        techCenterId: user.techCenterId,
        sessionDate: { gte: startDate, lt: endDate },
        manualOverrideAt: { not: null },
      },
      orderBy: { manualOverrideAt: 'desc' },
      select: {
        sessionDate: true,
        manuallyOpened: true,
        manuallyClosed: true,
        manualOverrideAt: true,
        manualOverrideBy: true,
      },
    }) : [];
    const actorIds = [...new Set(
      overrideRows
        .map((row) => row.manualOverrideBy)
        .filter((id): id is string => id !== null)
    )];
    const actors = actorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
    const seenOverrideDays = new Set<string>();
    const dayOverrides = overrideRows.flatMap((row) => {
      const day = startOfDayUTC(row.sessionDate).toISOString().slice(0, 10);
      if (seenOverrideDays.has(day)) {
        return [];
      }
      seenOverrideDays.add(day);

      const actor = row.manualOverrideBy ? actorsById.get(row.manualOverrideBy) : undefined;
      return [{
        sessionDate: day,
        manuallyOpened: row.manuallyOpened,
        manuallyClosed: row.manuallyClosed,
        manualOverrideAt: row.manualOverrideAt,
        actor: actor ? { firstName: actor.firstName, lastName: actor.lastName } : null,
      }];
    });

    const dateRows = isStaff ? await prisma.englishHubRegistration.findMany({
      where: {
        techCenterId: user.techCenterId,
        attendanceStatus: { not: 'OVERRIDE_ROW' },
        sessionDate: { lte: today },
      },
      select: { sessionDate: true },
      distinct: ['sessionDate'],
      orderBy: { sessionDate: 'desc' },
    }) : [];
    const availableDates = [...new Set([
      today.toISOString().slice(0, 10),
      ...dateRows.map((row) => startOfDayUTC(row.sessionDate).toISOString().slice(0, 10)),
    ])];

    return NextResponse.json({
      success: true,
      data: registrations,
      dayOverrides,
      availableDates: isStaff ? availableDates : [today.toISOString().slice(0, 10)],
    });
  } catch (error) {
    console.error('Error fetching English Hub registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
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

    const now = new Date();
    const sessionDate = startOfDayEAT(now);
    const baseStatus = getRegistrationStatus(null, now);
    const overrideRow = await prisma.englishHubRegistration.findFirst({
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
      },
    });
    const override: OverrideSnapshot = overrideRow ?? {
      manuallyOpened: false,
      manuallyClosed: false,
      manualOverrideAt: null,
      sessionDate,
    };
    const overrideStatus = getRegistrationStatus(override, now);

    if (!baseStatus.canRegister && !overrideStatus.canRegister) {
      return NextResponse.json(
        { success: false, error: 'Registration is closed' },
        { status: 409 }
      );
    }

    const existing = await prisma.englishHubRegistration.findUnique({
      where: {
        userId_sessionDate: {
          userId: session.user.id,
          sessionDate,
        },
      },
    });

    if (existing?.attendanceStatus === 'OVERRIDE_ROW') {
      const registration = await prisma.englishHubRegistration.update({
        where: { id: existing.id },
        data: { attendanceStatus: 'REGISTERED' },
      });
      return NextResponse.json({ success: true, registration });
    } else if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already registered today' },
        { status: 409 }
      );
    }

    const registration = await prisma.englishHubRegistration.create({
      data: {
        userId: session.user.id,
        techCenterId: user.techCenterId,
        sessionDate,
        attendanceStatus: 'REGISTERED',
      },
    });

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Already registered today' },
        { status: 409 }
      );
    }

    console.error('Error creating English Hub registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}
