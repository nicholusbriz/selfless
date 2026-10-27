import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { startOfDayEAT, startOfDayUTC } from '@/lib/english-hub/datetime';
import { getRegistrationStatus, OverrideSnapshot } from '@/lib/english-hub/registration-status';

const STAFF_ROLES = ['teacher', 'admin', 'super_admin'];

export async function DELETE(
  _request: NextRequest,
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
    const { id: registrationId } = await params;
    const registration = await prisma.englishHubRegistration.findUnique({
      where: { id: registrationId },
      select: { userId: true, techCenterId: true, sessionDate: true },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    const isStaff = STAFF_ROLES.includes(user?.role?.name ?? '');
    if (registration.userId !== session.user.id && !isStaff) {
      return NextResponse.json(
        { success: false, error: 'You can only cancel your own registration' },
        { status: 403 }
      );
    }

    if (isStaff && registration.techCenterId !== user?.techCenterId) {
      return NextResponse.json(
        { success: false, error: 'You can only cancel registrations for your tech center' },
        { status: 403 }
      );
    }

    const sessionDate = startOfDayUTC(registration.sessionDate);
    const now = new Date();
    if (sessionDate.getTime() < startOfDayEAT(now).getTime()) {
      return NextResponse.json(
        { success: false, error: 'Past registrations cannot be cancelled' },
        { status: 409 }
      );
    }

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

    if (!getRegistrationStatus(override, now).canRegister) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel — registration window is closed' },
        { status: 409 }
      );
    }

    await prisma.englishHubRegistration.delete({ where: { id: registrationId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling English Hub registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}
