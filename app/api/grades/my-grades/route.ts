import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow all users to view their own grades
    // Teachers and admins might also be students and want to see their own grades

    // Fetch student's grades with course information
    const grades = await prisma.grade.findMany({
      where: { studentId: user.id },
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
        studentId: user.id,
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
