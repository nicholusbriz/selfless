import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Student view data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student's registration
    const registration = await prisma.cleaningRegistration.findUnique({
      where: { userId },
      include: {
        cleaningDay: {
          include: {
            week: true,
            registrations: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profileImageUrl: true,
                  },
                },
              },
            },
            attendanceRecords: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profileImageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get all available days
    const weeks = await prisma.week.findMany({
      where: { 
        isActive: true,
        registrationEnabled: true,
      },
      include: {
        days: {
          include: {
            week: true,
          },
          orderBy: { cleaningDate: 'asc' },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Filter out days that have passed their registration deadline
    const availableWeeks = weeks.filter(week => {
      const deadline = new Date(week.registrationDeadline);
      return deadline > new Date();
    });

    return NextResponse.json({
      registration: registration || null,
      availableWeeks,
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}
