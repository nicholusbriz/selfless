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
      include: { 
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
        techCenterId: user.techCenterId || undefined,
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

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name || 'student'
      },
      registration: userRegistration,
      userAttendance,
      weeks
    });
  } catch (error) {
    console.error('Error fetching student cleaning data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cleaning data' },
      { status: 500 }
    );
  }
}
