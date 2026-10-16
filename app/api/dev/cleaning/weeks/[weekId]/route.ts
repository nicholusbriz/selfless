import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PUT - Update week (Dev can update any week)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  try {
    const { weekId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'dev' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Dev or Super Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { weekLabel, isActive, registrationDeadline } = body;

    // Verify week exists
    const week = await prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    const updatedWeek = await prisma.$transaction(
      async (tx) => {
        const nextWeek = await tx.week.update({
          where: { id: weekId },
          data: {
            ...(weekLabel !== undefined && { weekLabel }),
            ...(isActive !== undefined && { isActive }),
            ...(registrationDeadline !== undefined && { registrationDeadline: new Date(registrationDeadline) }),
            updatedById: session.user.id,
          },
        });

        if (isActive === false) {
          await tx.cleaningDay.updateMany({
            where: { weekId },
            data: { status: 'CLOSED' },
          });
        } else if (isActive === true) {
          const days = await tx.cleaningDay.findMany({ where: { weekId } });
          await Promise.all(
            days.map((day) =>
              tx.cleaningDay.update({
                where: { id: day.id },
                data: {
                  status:
                    day.currentRegistrations >= day.capacityLimit
                      ? 'FULL'
                      : 'OPEN',
                },
              }),
            ),
          );
        }

        return nextWeek;
      },
      { maxWait: 10000, timeout: 15000 },
    );

    return NextResponse.json(updatedWeek);
  } catch (error) {
    console.error('Error updating week:', error);
    return NextResponse.json(
      { error: 'Failed to update week' },
      { status: 500 }
    );
  }
}

// DELETE - Delete week (Dev can delete any week)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  try {
    const { weekId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'dev' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Dev or Super Admin privileges required.' }, { status: 403 });
    }

    // Verify week exists
    const week = await prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    // Delete week (cascade will delete days, registrations, and attendance)
    await prisma.week.delete({
      where: { id: weekId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting week:', error);
    return NextResponse.json(
      { error: 'Failed to delete week' },
      { status: 500 }
    );
  }
}
