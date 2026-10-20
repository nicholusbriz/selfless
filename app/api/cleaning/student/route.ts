import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Get student's cleaning data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        role: true,
        techCenter: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's registrations (can be up to 2)
    const userRegistrations = await prisma.cleaningRegistration.findMany({
      where: { userId: user.id },
      include: {
        cleaningDay: {
          include: {
            week: true
          }
        }
      }
    });

    // Get user's attendance records
    const userAttendance = await prisma.attendanceRecord.findMany({
      where: { userId: user.id },
      include: {
        cleaningDay: {
          include: {
            week: true
          }
        }
      },
      orderBy: {
        markedAt: 'desc'
      }
    });

    // Get all weeks with days so users can see closed weeks and their locked days.
    // Registration and switching remain controlled by the week/day status checks.
    const weeks = await prisma.week.findMany({
      where: {
        techCenterId: user.techCenter?.id || undefined,
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
          orderBy: {
            cleaningDate: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    const studentsInCenter = user.techCenter?.id
      ? await prisma.user.findMany({
          where: {
            techCenterId: user.techCenter.id,
            status: 'ACTIVE',
            role: { name: 'student' },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
          orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        })
      : [];

    // Get all registrations for these students
    const studentIds = studentsInCenter.map(s => s.id);
    const registrations = await prisma.cleaningRegistration.findMany({
      where: {
        userId: { in: studentIds }
      },
      select: { userId: true }
    });

    // Count registrations per student
    const registrationCountMap = new Map<string, number>();
    registrations.forEach(r => {
      const count = registrationCountMap.get(r.userId) || 0;
      registrationCountMap.set(r.userId, count + 1);
    });

    // Group students by registration count (0, 1, 2)
    const studentsByRegistrationCount = {
      zero: [] as Array<{ id: string; firstName: string; lastName: string }>,
      one: [] as Array<{ id: string; firstName: string; lastName: string }>,
      two: [] as Array<{ id: string; firstName: string; lastName: string }>,
    };

    studentsInCenter.forEach(student => {
      const count = registrationCountMap.get(student.id) || 0;
      if (count === 0) {
        studentsByRegistrationCount.zero.push({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
        });
      } else if (count === 1) {
        studentsByRegistrationCount.one.push({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
        });
      } else if (count >= 2) {
        studentsByRegistrationCount.two.push({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
        });
      }
    });

    // Legacy: unregisteredStudents for backward compatibility
    const unregisteredStudents = studentsByRegistrationCount.zero;

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role?.name || 'student',
        techCenterId: user.techCenter?.id
      },
      registrations: userRegistrations,
      userAttendance,
      weeks,
      unregisteredStudents,
      studentsByRegistrationCount,
    });
  } catch (error) {
    console.error('Error fetching student cleaning data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cleaning data' },
      { status: 500 }
    );
  }
}
