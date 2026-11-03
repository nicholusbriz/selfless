import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { startOfDayUTC, startOfDayEAT } from '@/lib/english-hub/datetime';

const ADMIN_ROLES = ['super_admin', 'dev'];

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
      select: { role: true },
    });

    if (!user || !ADMIN_ROLES.includes(user.role?.name ?? '')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const techCenterId = searchParams.get('techCenterId');
    const dateParam = searchParams.get('date');

    if (!techCenterId) {
      return NextResponse.json({ success: false, error: 'Tech center ID is required' }, { status: 400 });
    }

    // If no date is provided, return available dates for the tech center
    if (!dateParam) {
      const now = new Date();
      const today = startOfDayEAT(now);

      // Get dates from actual registrations (excluding override rows)
      const registrationDateRows = await prisma.englishHubRegistration.findMany({
        where: {
          techCenterId,
          attendanceStatus: { not: 'OVERRIDE_ROW' },
          sessionDate: { lte: today },
        },
        select: { sessionDate: true },
        distinct: ['sessionDate'],
        orderBy: { sessionDate: 'desc' },
      });

      // Get dates from override rows (manually opened/closed by teachers/admins)
      const overrideDateRows = await prisma.englishHubRegistration.findMany({
        where: {
          techCenterId,
          attendanceStatus: 'OVERRIDE_ROW',
          sessionDate: { lte: today },
        },
        select: { sessionDate: true },
        distinct: ['sessionDate'],
        orderBy: { sessionDate: 'desc' },
      });

      const availableDates = [...new Set([
        today.toISOString().slice(0, 10),
        ...registrationDateRows.map((row) => startOfDayUTC(row.sessionDate).toISOString().slice(0, 10)),
        ...overrideDateRows.map((row) => startOfDayUTC(row.sessionDate).toISOString().slice(0, 10)),
      ])];

      return NextResponse.json({
        success: true,
        availableDates,
      });
    }

    const requestedDate = parseDateParam(dateParam);
    if (!requestedDate) {
      return NextResponse.json({ success: false, error: 'Invalid date parameter' }, { status: 400 });
    }

    const startDate = startOfDayUTC(requestedDate);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    const registrations = await prisma.englishHubRegistration.findMany({
      where: {
        techCenterId,
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
            role: { select: { name: true, displayName: true } },
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

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error('Error fetching English Hub registrations (dev):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
