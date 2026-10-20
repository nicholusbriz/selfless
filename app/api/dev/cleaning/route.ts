// app/api/dev/cleaning/route.ts
// API route for dev cleaning management - GET all tech centers data, POST create week for any center

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logCleaningWeekCreation, logCleaningDayCreation } from '@/lib/logger';

// GET - Fetch all cleaning data for a specific tech center
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'dev' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Dev or Super Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const techCenterId = searchParams.get('techCenterId');

    if (!techCenterId) {
      return NextResponse.json(
        { error: 'Tech Center ID is required' },
        { status: 400 }
      );
    }

    // Get weeks for the specified tech center
    const weeks = await prisma.week.findMany({
      where: { techCenterId },
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
          orderBy: { cleaningDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get all users from the specified tech center
    const students = await prisma.user.findMany({
      where: {
        techCenterId,
        status: 'ACTIVE' as const,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        techCenterId: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Get all registrations for these users
    const userIds = students.map(s => s.id);
    const registrations = await prisma.cleaningRegistration.findMany({
      where: {
        userId: { in: userIds }
      },
      select: { userId: true }
    });

    // Count registrations per user
    const userRegistrationCounts = new Map<string, number>();
    registrations.forEach(r => {
      const currentCount = userRegistrationCounts.get(r.userId) || 0;
      userRegistrationCounts.set(r.userId, currentCount + 1);
    });

    // Filter users with less than 2 registrations (for assignment modal)
    const assignableUsers = students
      .filter((user) => (userRegistrationCounts.get(user.id) || 0) < 2)
      .map(({ id, firstName, lastName }) => ({
        id,
        firstName,
        lastName,
      }));

    // Group students by registration count (0, 1, 2+)
    const studentsByRegistrationCount = {
      zero: students
        .filter((user) => (userRegistrationCounts.get(user.id) || 0) === 0)
        .map(({ id, firstName, lastName }) => ({ id, firstName, lastName }))
        .sort((a, b) => a.firstName.localeCompare(b.firstName)),
      one: students
        .filter((user) => (userRegistrationCounts.get(user.id) || 0) === 1)
        .map(({ id, firstName, lastName }) => ({ id, firstName, lastName }))
        .sort((a, b) => a.firstName.localeCompare(b.firstName)),
      two: students
        .filter((user) => (userRegistrationCounts.get(user.id) || 0) >= 2)
        .map(({ id, firstName, lastName }) => ({ id, firstName, lastName }))
        .sort((a, b) => a.firstName.localeCompare(b.firstName)),
    };

    // Filter users with 0 registrations (for stats - legacy)
    const unregisteredUsers = studentsByRegistrationCount.zero;

    // Calculate stats
    let totalRegistrations = 0;
    let totalAttended = 0;
    let totalNoShow = 0;
    let totalPending = 0;
    let totalDays = 0;

    weeks.forEach((week) => {
      totalDays += week.days.length;
      week.days.forEach((day) => {
        totalRegistrations += day.registrations.length;
        day.attendanceRecords.forEach((record) => {
          if (record.status === 'ATTENDED') totalAttended++;
          else if (record.status === 'NO_SHOW') totalNoShow++;
          else if (record.status === 'PENDING') totalPending++;
        });
      });
    });

    const stats = {
      totalWeeks: weeks.length,
      totalDays,
      totalRegistrations,
      totalUnregistered: unregisteredUsers.length,
      totalAttended,
      totalNoShow,
      totalPending,
    };

    return NextResponse.json({
      weeks,
      students: assignableUsers,
      allStudents: students,
      unregisteredStudents: unregisteredUsers,
      studentsByRegistrationCount,
      stats,
    });
  } catch (error) {
    console.error('Error fetching dev cleaning data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cleaning data' },
      { status: 500 }
    );
  }
}

// POST - Create a new week for any tech center (Monday to Friday only - 5 days)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'dev' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Dev or Super Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, weekLabel, capacityLimit, registrationDeadline, techCenterId } = body;

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

    if (!techCenterId) {
      return NextResponse.json(
        { error: 'Tech Center ID is required' },
        { status: 400 }
      );
    }

    // Verify tech center exists
    const techCenter = await prisma.techCenter.findUnique({
      where: { id: techCenterId },
    });

    if (!techCenter) {
      return NextResponse.json(
        { error: 'Tech center not found' },
        { status: 404 }
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
    endDate.setDate(start.getDate() + 4);

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
        },
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
          },
        });
      });

      const createdDays = await Promise.all(dayPromises);
      days.push(...createdDays);

      return { week, days };
    }, {
      timeout: 15000,
    });

    // Log the week creation activity
    await logCleaningWeekCreation(
      session.user.id,
      techCenterId,
      {
        weekLabel: result.week.weekLabel,
        startDate: result.week.startDate,
        dayCount: 5,
      }
    );

    // Log each day creation activity
    for (const day of result.days) {
      await logCleaningDayCreation(
        session.user.id,
        techCenterId,
        {
          dayName: day.dayOfWeek,
          weekLabel: result.week.weekLabel,
          cleaningDate: day.cleaningDate,
        }
      );
    }

    return NextResponse.json({
      message: 'Week created successfully with 5 days (Monday to Friday)',
      week: result.week,
      days: result.days,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating week:', error);
    return NextResponse.json(
      { error: 'Failed to create week: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
