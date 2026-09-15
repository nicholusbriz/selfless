import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view students (admin or teacher)
    const hasPermission = user.role?.name === 'admin' || user.role?.name === 'teacher' || user.role?.name === 'super_admin';
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Only teachers and admins can access the grading interface' }, { status: 403 });
    }

    // Get tech center ID from query or use user's tech center
    const searchParams = request.nextUrl.searchParams;
    const techCenterId = searchParams.get('techCenterId') || user.techCenterId;

    if (!techCenterId) {
      return NextResponse.json({ error: 'Tech center ID required' }, { status: 400 });
    }

    // If teacher, only show their assigned students
    let studentIds: string[] = [];
    if (user.role?.name === 'teacher') {
      const assignedStudents = await prisma.user.findMany({
        where: { teacherId: user.id },
        select: { id: true }
      });
      studentIds = assignedStudents.map(s => s.id);
    }

    // Fetch all users with courses (not just students) - teachers and admins can also be students
    const usersWithCourses = await prisma.user.findMany({
      where: {
        techCenterId,
        submittedCourses: {
          some: { status: 'ACTIVE' }
        },
        ...(user.role?.name === 'teacher' && studentIds.length > 0 ? { id: { in: studentIds } } : {})
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        role: {
          select: {
            name: true
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true
          }
        },
        submittedCourses: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            code: true,
            courseUnit: true,
            credits: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    // For each user, get their grade counts per week
    const usersWithGradeCounts = await Promise.all(
      usersWithCourses.map(async (user) => {
        const gradeCounts = await prisma.grade.groupBy({
          by: ['week'],
          where: { studentId: user.id },
          _count: { id: true }
        });

        return {
          ...user,
          gradeCounts: gradeCounts.reduce((acc, { week, _count }) => {
            acc[week] = _count.id;
            return acc;
          }, {} as Record<number, number>)
        };
      })
    );

    // Fetch users without courses
    const usersWithoutCourses = await prisma.user.findMany({
      where: {
        techCenterId,
        submittedCourses: {
          none: { status: 'ACTIVE' }
        },
        ...(user.role?.name === 'teacher' && studentIds.length > 0 ? { id: { in: studentIds } } : {})
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        role: {
          select: {
            name: true
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    return NextResponse.json({ 
      studentsWithCourses: usersWithGradeCounts,
      studentsWithoutCourses: usersWithoutCourses
    });
  } catch (error) {
    console.error('Error fetching students for grading:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
