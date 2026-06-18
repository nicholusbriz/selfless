import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    // Get all weeks with days, registrations, and attendance
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
                    studentProfile: {
                      select: {
                        studentId: true,
                      },
                    },
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

    // Get all students for manual assignment
    const students = await prisma.user.findMany({
      where: {
        studentProfile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        studentProfile: {
          select: {
            studentId: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    // Calculate stats
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
          else totalPending++;
        });
      });
    });

    return NextResponse.json({
      weeks,
      students,
      stats: {
        totalRegistrations,
        totalAttended,
        totalNoShow,
        totalPending,
      },
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
