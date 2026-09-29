import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { createActivityLog } from '@/lib/logger';

// POST - Register user for a temple trip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = await params;

    // Check if trip exists
    const trip = await prisma.templeTrip.findUnique({
      where: { id: tripId },
      include: {
        techCenter: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json({ error: 'Temple trip not found' }, { status: 404 });
    }

    if (!trip.isActive) {
      return NextResponse.json({ error: 'This temple trip is no longer active' }, { status: 400 });
    }

    // Get user with tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        techCenterId: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.templeTripRegistration.findUnique({
      where: {
        userId_tripId: {
          userId: session.user.id,
          tripId: tripId
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'You are already registered for this trip' }, { status: 400 });
    }

    // Register user for the trip (global - no tech center restriction)
    const registration = await prisma.templeTripRegistration.create({
      data: {
        userId: session.user.id,
        tripId: tripId,
        techCenterId: user.techCenterId || undefined // Allow users without tech centers
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            techCenter: {
              select: {
                name: true
              }
            }
          }
        },
        trip: {
          select: {
            id: true,
            title: true,
            dateRange: true,
            location: true
          }
        }
      }
    });

    await createActivityLog({
      userId: session.user.id,
      action: 'temple_trip_registered',
      entityType: 'temple_trip_registration',
      entityId: registration.id,
      techCenterId: user.techCenterId || undefined,
      details: {
        tripId: tripId,
        tripTitle: trip.title,
        tripDateRange: trip.dateRange,
        tripLocation: trip.location
      },
    });

    return NextResponse.json({
      message: 'Successfully registered for temple trip',
      registration
    });
  } catch (error) {
    console.error('Error registering for temple trip:', error);
    return NextResponse.json(
      { error: 'Failed to register for temple trip' },
      { status: 500 }
    );
  }
}

// DELETE - Unregister user from a temple trip
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

    // Check if registration exists
    const registration = await prisma.templeTripRegistration.findUnique({
      where: {
        userId_tripId: {
          userId: session.user.id,
          tripId: tripId
        }
      }
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Delete registration
    await prisma.templeTripRegistration.delete({
      where: {
        userId_tripId: {
          userId: session.user.id,
          tripId: tripId
        }
      }
    });

    return NextResponse.json({
      message: 'Successfully unregistered from temple trip'
    });
  } catch (error) {
    console.error('Error unregistering from temple trip:', error);
    return NextResponse.json(
      { error: 'Failed to unregister from temple trip' },
      { status: 500 }
    );
  }
}
