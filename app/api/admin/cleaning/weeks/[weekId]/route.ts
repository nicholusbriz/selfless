import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PUT - Update week
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

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get admin's tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!adminUser?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned to this admin' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { weekLabel, isActive, registrationDeadline } = body;

    // Verify week belongs to admin's tech center
    const week = await prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    if (week.techCenterId !== adminUser.techCenterId) {
      return NextResponse.json({ error: 'Access denied. You can only manage your own weeks.' }, { status: 403 });
    }

    // Update week
    const updatedWeek = await prisma.week.update({
      where: { id: weekId },
      data: {
        ...(weekLabel !== undefined && { weekLabel }),
        ...(isActive !== undefined && { isActive }),
        ...(registrationDeadline !== undefined && { registrationDeadline: new Date(registrationDeadline) }),
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedWeek);
  } catch (error) {
    console.error('Error updating week:', error);
    return NextResponse.json(
      { error: 'Failed to update week' },
      { status: 500 }
    );
  }
}

// DELETE - Delete week
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

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get admin's tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!adminUser?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned to this admin' },
        { status: 404 }
      );
    }

    // Verify week belongs to admin's tech center
    const week = await prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    if (week.techCenterId !== adminUser.techCenterId) {
      return NextResponse.json({ error: 'Access denied. You can only manage your own weeks.' }, { status: 403 });
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
