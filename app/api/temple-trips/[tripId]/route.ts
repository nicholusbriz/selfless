import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// DELETE - Delete a temple trip (super_admin, dev, or admin who created it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = await params;

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the trip to check ownership
    const trip = await prisma.templeTrip.findUnique({
      where: { id: tripId },
      select: {
        createdById: true
      }
    });

    if (!trip) {
      return NextResponse.json({ error: 'Temple trip not found' }, { status: 404 });
    }

    // Check permissions
    const canDeleteAny = user.role?.name === 'super_admin' || user.role?.name === 'dev';
    const isOwner = trip.createdById === session.user.id;

    if (!canDeleteAny && !isOwner) {
      return NextResponse.json({ error: 'You can only delete trips you created' }, { status: 403 });
    }

    // Delete the trip
    await prisma.templeTrip.delete({
      where: { id: tripId }
    });

    return NextResponse.json({
      message: 'Temple trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting temple trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete temple trip' },
      { status: 500 }
    );
  }
}
