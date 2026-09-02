import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { ReassignmentError } from '@/lib/cleaning/reassignment-errors';
import {
  assertReassignmentAllowed,
  getReassignmentAllowance,
} from '@/lib/cleaning/reassignment-policy';

function errorResponse(error: ReassignmentError) {
  return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication is required.', code: 'UNAUTHORIZED' }, { status: 401 });

    const body = (await request.json()) as { newDayId?: unknown; userId?: unknown };
    if (body.userId !== undefined) return NextResponse.json({ error: 'Ownership is derived from the authenticated session.', code: 'CALLER_OWNERSHIP_REJECTED' }, { status: 400 });
    if (typeof body.newDayId !== 'string' || !body.newDayId.trim()) return NextResponse.json({ error: 'A replacement cleaning day is required.', code: 'NEW_DAY_REQUIRED' }, { status: 400 });
    const newDayId = body.newDayId.trim();

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, techCenterId: true } });
    if (!user) return NextResponse.json({ error: 'The authenticated user was not found.', code: 'USER_NOT_FOUND' }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.cleaningRegistration.findUnique({
        where: { userId: user.id },
        include: { cleaningDay: { include: { week: true } } },
      });
      if (!registration) throw new ReassignmentError('REGISTRATION_NOT_FOUND', 'No current cleaning assignment exists.', 404);

      const replacementDay = await tx.cleaningDay.findUnique({ where: { id: newDayId }, include: { week: true } });
      if (!replacementDay) throw new ReassignmentError('DAY_NOT_OPEN', 'The selected cleaning day was not found.', 404);

      const [replacementRegistrations, currentDayRegistrations] = await Promise.all([
        tx.cleaningRegistration.count({ where: { cleaningDayId: newDayId } }),
        tx.cleaningRegistration.count({ where: { cleaningDayId: registration.cleaningDayId } }),
      ]);

      assertReassignmentAllowed({
        changesUsed: registration.reassignmentCount,
        currentDayId: registration.cleaningDayId,
        replacementDayId: newDayId,
        userTechCenterId: user.techCenterId,
        replacementTechCenterId: replacementDay.techCenterId,
        weekIsActive: replacementDay.week.isActive,
        registrationDeadline: replacementDay.week.registrationDeadline,
        replacementStatus: replacementDay.status,
        replacementDate: replacementDay.cleaningDate,
        replacementRegistrations,
        replacementCapacity: replacementDay.capacityLimit,
        currentDayRegistrations,
      });

      const sequence = registration.reassignmentCount + 1;
      const updateResult = await tx.cleaningRegistration.updateMany({
        where: {
          id: registration.id,
          userId: user.id,
          cleaningDayId: registration.cleaningDayId,
          reassignmentCount: registration.reassignmentCount,
        },
        data: { cleaningDayId: newDayId, reassignmentCount: { increment: 1 } },
      });
      if (updateResult.count !== 1) throw new ReassignmentError('REASSIGNMENT_CONFLICT', 'The assignment changed during this request. Refresh and try again.', 409);

      const [oldDayCount, newDayCount] = await Promise.all([
        tx.cleaningRegistration.count({ where: { cleaningDayId: registration.cleaningDayId } }),
        tx.cleaningRegistration.count({ where: { cleaningDayId: newDayId } }),
      ]);
      if (newDayCount > replacementDay.capacityLimit) throw new ReassignmentError('REASSIGNMENT_CONFLICT', 'The selected cleaning day reached capacity during this request.', 409);

      await Promise.all([
        tx.cleaningDay.update({
          where: { id: registration.cleaningDayId },
          data: { currentRegistrations: oldDayCount, status: oldDayCount >= registration.cleaningDay.capacityLimit ? 'FULL' : 'OPEN' },
        }),
        tx.cleaningDay.update({
          where: { id: newDayId },
          data: { currentRegistrations: newDayCount, status: newDayCount >= replacementDay.capacityLimit ? 'FULL' : 'OPEN' },
        }),
        tx.cleaningReassignmentHistory.create({
          data: {
            cleaningRegistrationId: registration.id,
            userId: user.id,
            previousCleaningDayId: registration.cleaningDayId,
            replacementCleaningDayId: newDayId,
            initiatedById: user.id,
            techCenterId: user.techCenterId!,
            sequence,
            source: 'student',
          },
        }),
        tx.activityLog.create({
          data: {
            userId: user.id,
            action: 'cleaning_day_change',
            entityType: 'cleaning_registration',
            entityId: registration.id,
            techCenterId: user.techCenterId,
            details: { previousCleaningDayId: registration.cleaningDayId, replacementCleaningDayId: newDayId, sequence },
          },
        }),
      ]);

      const updatedRegistration = await tx.cleaningRegistration.findUniqueOrThrow({
        where: { id: registration.id },
        include: { cleaningDay: { include: { week: true } } },
      });
      return { registration: updatedRegistration, reassignment: getReassignmentAllowance(sequence) };
    }, { timeout: 20000, maxWait: 20000 });

    return NextResponse.json({
      success: true,
      message: `Cleaning assignment changed successfully. You have ${result.reassignment.changesRemaining} changes remaining.`,
      ...result,
    });
  } catch (error: unknown) {
    if (error instanceof ReassignmentError) return errorResponse(error);
    console.error('Error changing cleaning day:', error);
    return NextResponse.json({ error: 'The cleaning assignment could not be changed.', code: 'REASSIGNMENT_FAILED' }, { status: 500 });
  }
}
