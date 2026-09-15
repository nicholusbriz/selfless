import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Check if user has permission to view grades (admin, teacher, or the student themselves)
    const isStudent = user.id === studentId;
    const hasPermission = user.role?.name === 'admin' || user.role?.name === 'teacher' || user.role?.name === 'super_admin' || isStudent;
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch student's grades with course information
    const grades = await prisma.grade.findMany({
      where: { studentId },
      include: {
        studentCourse: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { week: 'asc' },
        { assignedAt: 'desc' }
      ]
    });

    // Fetch student's courses
    const courses = await prisma.studentCourse.findMany({
      where: { 
        studentId,
        status: 'ACTIVE'
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ grades, courses });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json({ error: 'Failed to fetch student grades' }, { status: 500 });
  }
}
