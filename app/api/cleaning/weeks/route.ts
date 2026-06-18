import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all weeks
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const weeks = await prisma.week.findMany({
      where: { isActive: true },
      include: {
        days: {
          include: {
            registrations: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
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
                  },
                },
              },
            },
          },
          orderBy: { cleaningDate: 'asc' },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(weeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weeks' },
      { status: 500 }
    );
  }
}

// POST - Create new week (Admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }
    const body = await request.json();
    const { startDate, weekLabel, capacityLimit, registrationDeadline } = body;

    // Validate start date is Monday
    const start = new Date(startDate);
    if (start.getDay() !== 1) {
      return NextResponse.json(
        { error: 'Start date must be a Monday' },
        { status: 400 }
      );
    }

    // Calculate end date (Friday of same week)
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 4);

    // Create week with Monday-Friday days
    const week = await prisma.week.create({
      data: {
        startDate: start,
        endDate,
        weekLabel,
        registrationEnabled: true,
        registrationDeadline: new Date(registrationDeadline),
        days: {
          create: [
            {
              dayOfWeek: 'Monday',
              cleaningDate: new Date(start),
              capacityLimit: capacityLimit || 0,
            },
            {
              dayOfWeek: 'Tuesday',
              cleaningDate: new Date(start.getTime() + 1 * 24 * 60 * 60 * 1000),
              capacityLimit: capacityLimit || 0,
            },
            {
              dayOfWeek: 'Wednesday',
              cleaningDate: new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000),
              capacityLimit: capacityLimit || 0,
            },
            {
              dayOfWeek: 'Thursday',
              cleaningDate: new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000),
              capacityLimit: capacityLimit || 0,
            },
            {
              dayOfWeek: 'Friday',
              cleaningDate: new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000),
              capacityLimit: capacityLimit || 0,
            },
          ],
        },
      },
      include: {
        days: true,
      },
    });

    return NextResponse.json(week, { status: 201 });
  } catch (error) {
    console.error('Error creating week:', error);
    return NextResponse.json(
      { error: 'Failed to create week' },
      { status: 500 }
    );
  }
}
