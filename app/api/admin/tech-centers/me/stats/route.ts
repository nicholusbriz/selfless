import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch statistics for admin's tech center
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super_admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get the user with their tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { techCenter: { select: { id: true } } }
    });

    if (!user || !user.techCenter) {
      return NextResponse.json(
        { error: 'No tech center assigned to this admin' },
        { status: 404 }
      );
    }

    const techCenterId = user.techCenter.id;

    // Get all statistics in parallel
    const [
      totalStudents,
      totalCourses,
      totalWeeks,
      totalCleaningDays,
      totalAnnouncements,
      activeStudents,
      completedCourses,
      openCleaningDays,
      recentActivity
    ] = await Promise.all([
      // Total students
      prisma.user.count({
        where: { 
          techCenterId,
          role: { name: 'student' }
        }
      }),
      
      // Total courses
      prisma.studentCourse.count({
        where: { techCenterId }
      }),
      
      // Total weeks
      prisma.week.count({
        where: { techCenterId }
      }),
      
      // Total cleaning days
      prisma.cleaningDay.count({
        where: { techCenterId }
      }),
      
      // Total announcements
      prisma.announcement.count({
        where: { techCenterId }
      }),
      
      // Active students
      prisma.user.count({
        where: { 
          techCenterId,
          role: { name: 'student' },
          status: 'ACTIVE'
        }
      }),
      
      // Completed courses
      prisma.studentCourse.count({
        where: { 
          techCenterId,
          status: 'COMPLETED'
        }
      }),
      
      // Open cleaning days
      prisma.cleaningDay.count({
        where: { 
          techCenterId,
          status: 'OPEN'
        }
      }),
      
      // Recent activity (last 5 logs)
      prisma.activityLog.findMany({
        where: { techCenterId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    ]);

    const stats = {
      totalStudents,
      totalCourses,
      totalWeeks,
      totalCleaningDays,
      totalAnnouncements,
      activeStudents,
      completedCourses,
      openCleaningDays,
      recentActivity
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching tech center stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}