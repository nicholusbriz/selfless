import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { startOfDayEAT, startOfDayUTC } from '@/lib/english-hub/datetime';
import { getRegistrationStatus, OverrideSnapshot } from '@/lib/english-hub/registration-status';

const STAFF_ROLES = ['teacher', 'admin', 'super_admin'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: 'Only teachers and admins can mark attendance' },
        { status: 403 }
      );
    }

    const { id: registrationId } = await params;
    const body = await request.json() as { attendanceStatus?: unknown };
    if (body.attendanceStatus !== 'ATTENDED' && body.attendanceStatus !== 'NO_SHOW') {
      return NextResponse.json(
        { success: false, error: 'Invalid attendance status' },
        { status: 400 }
      );
    }

    const registration = await prisma.englishHubRegistration.findUnique({
      where: { id: registrationId },
      select: { techCenterId: true, sessionDate: true },
    });
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    if (registration.techCenterId !== user.techCenterId) {
      return NextResponse.json(
        { success: false, error: 'You can only mark attendance for your tech center' },
        { status: 403 }
      );
    }

    const sessionDate = startOfDayUTC(registration.sessionDate);
    const now = new Date();
    const isPastSession = sessionDate.getTime() < startOfDayEAT(now).getTime();
    const overrideRow = await prisma.englishHubRegistration.findFirst({
      where: {
        techCenterId: registration.techCenterId,
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
    const status = getRegistrationStatus(override, now);

    if (!isPastSession && (
      status.status === 'OPEN' ||
      !['CLOSED', 'PAST_DEADLINE', 'NOT_AVAILABLE'].includes(status.status)
    )) {
      return NextResponse.json(
        { success: false, error: 'Attendance can only be marked when registration is closed' },
        { status: 409 }
      );
    }

    const updatedRegistration = await prisma.englishHubRegistration.update({
      where: { id: registrationId },
      data: {
        attendanceStatus: body.attendanceStatus,
        markedByUserId: session.user.id,
        markedAt: new Date(),
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
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedRegistration });
  } catch (error) {
    console.error('Error marking English Hub attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
