// app/api/admin/cleaning/route.ts
// API route for cleaning management - GET all data, POST create week

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch all cleaning data for admin's tech center
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

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

    const weeks = await prisma.week.findMany({
      where: { 
        techCenterId: adminUser.techCenterId,
      },
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
                    profileImageUrl: true,
                  }
                }
              }
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
                  }
                }
              }
            }
          },
          orderBy: { cleaningDate: 'asc' }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    const students = await prisma.user.findMany({
      where: {
        techCenterId: adminUser.techCenterId,
        role: {
          name: 'student'
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
      },
      orderBy: { firstName: 'asc' }
    });

    let totalRegistrations = 0;
    let totalAttended = 0;
    let totalNoShow = 0;
    let totalPending = 0;

    weeks.forEach(week => {
      week.days.forEach(day => {
        totalRegistrations += day.registrations.length;
        day.attendanceRecords.forEach(record => {
          if (record.status === 'ATTENDED') totalAttended++;
          else if (record.status === 'NO_SHOW') totalNoShow++;
          else if (record.status === 'PENDING') totalPending++;
        });
      });
    });

    const stats = {
      totalRegistrations,
      totalAttended,
      totalNoShow,
      totalPending,
    };

    return NextResponse.json({ weeks, students, stats });
  } catch (error) {
    console.error('Error fetching cleaning data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cleaning data' },
      { status: 500 }
    );
  }
}

// POST - Create a new week (Monday to Friday only - 5 days)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!adminUser?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned' },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log('📝 Received body:', body);
    
    const { startDate, weekLabel, capacityLimit, registrationDeadline } = body;

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      );
    }

    if (!registrationDeadline) {
      return NextResponse.json(
        { error: 'Registration deadline is required' },
        { status: 400 }
      );
    }

    // Parse dates correctly
    let start: Date;
    if (startDate.includes('T')) {
      start = new Date(startDate);
    } else {
      const [year, month, day] = startDate.split('-').map(Number);
      start = new Date(year, month - 1, day);
    }
    
    let deadline: Date;
    if (typeof registrationDeadline === 'string') {
      deadline = new Date(registrationDeadline);
    } else {
      deadline = new Date(registrationDeadline);
    }

    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: `Invalid start date format: "${startDate}". Please use YYYY-MM-DD` },
        { status: 400 }
      );
    }

    if (isNaN(deadline.getTime())) {
      return NextResponse.json(
        { error: `Invalid registration deadline format: "${registrationDeadline}"` },
        { status: 400 }
      );
    }

    console.log('📅 Parsed start date:', start);
    console.log('📅 Parsed deadline:', deadline);

    // Validate start date is Monday (1 = Monday in getDay())
    if (start.getDay() !== 1) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return NextResponse.json(
        { error: `Start date must be a Monday. Selected date is ${dayNames[start.getDay()]}` },
        { status: 400 }
      );
    }

    // Calculate end date (Friday - 4 days later)
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + 4); // Friday

    const techCenterId = adminUser.techCenterId;

    // Use transaction with increased timeout
    const result = await prisma.$transaction(async (tx) => {
      const week = await tx.week.create({
        data: {
          weekLabel: weekLabel || `Week of ${start.toLocaleDateString()}`,
          startDate: start,
          endDate: endDate,
          registrationDeadline: deadline,
          isActive: true,
          techCenterId: techCenterId,
          createdById: session.user.id,
          updatedById: session.user.id,
        }
      });

      // Only create Monday to Friday (5 days)
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const days = [];
      const capacity = capacityLimit || 5;
      
      // Create days in parallel using Promise.all for better performance
      const dayPromises = dayNames.map((dayName, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        
        return tx.cleaningDay.create({
          data: {
            weekId: week.id,
            dayOfWeek: dayName,
            cleaningDate: date,
            capacityLimit: capacity,
            currentRegistrations: 0,
            status: 'OPEN',
            techCenterId: techCenterId,
          }
        });
      });

      const createdDays = await Promise.all(dayPromises);
      days.push(...createdDays);

      return { week, days };
    }, {
      timeout: 15000 // 15 seconds timeout
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'create_week',
        entityType: 'week',
        entityId: result.week.id,
        details: {
          weekLabel: result.week.weekLabel,
          startDate: result.week.startDate,
          days: 5 // Monday to Friday
        },
        techCenterId: techCenterId,
      }
    });

    return NextResponse.json({
      message: 'Week created successfully with 5 days (Monday to Friday)',
      week: result.week,
      days: result.days
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating week:', error);
    return NextResponse.json(
      { error: 'Failed to create week: ' + (error as Error).message },
      { status: 500 }
    );
  }
}