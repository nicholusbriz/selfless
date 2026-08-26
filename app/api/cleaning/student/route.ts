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

    // Get user's registration
    const userRegistration = await prisma.cleaningRegistration.findUnique({
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

    // Get available weeks with days for the user's tech center
    // Remove deadline filter so users can see all weeks/days even after deadline
    const weeks = await prisma.week.findMany({
      where: {
        techCenterId: user.techCenter?.id || undefined,
        isActive: true
      },
      include: {
        days: {
          where: {
            cleaningDate: {
              gte: new Date()
            }
          },
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
            cleaningRegistration: {
              select: { id: true },
            },
          },
          orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        })
      : [];

    const unregisteredStudents = studentsInCenter
      .filter((student) => !student.cleaningRegistration)
      .map(({ id, firstName, lastName }) => ({
        id,
        firstName,
        lastName,
      }));

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
      registration: userRegistration,
      userAttendance,
      weeks,
      unregisteredStudents,
    });
  } catch (error) {
    console.error('Error fetching student cleaning data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cleaning data' },
      { status: 500 }
    );
  }
}
