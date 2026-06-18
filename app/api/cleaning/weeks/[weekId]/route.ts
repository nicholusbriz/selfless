import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Update week (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  try {
    const { weekId } = await params;
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { weekLabel, registrationEnabled, registrationDeadline } = body;

    const week = await prisma.week.update({
      where: { id: weekId },
      data: {
        ...(weekLabel !== undefined && { weekLabel }),
        ...(registrationEnabled !== undefined && { registrationEnabled }),
        ...(registrationDeadline !== undefined && { registrationDeadline: new Date(registrationDeadline) }),
      },
    });

    return NextResponse.json(week);
  } catch (error) {
    console.error('Error updating week:', error);
    return NextResponse.json(
      { error: 'Failed to update week' },
      { status: 500 }
    );
  }
}

// DELETE - Delete week with cascade (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  try {
    const { weekId } = await params;
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    // Delete week (cascade will delete days, registrations, and attendance records)
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
