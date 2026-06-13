import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/reports/weekly-progress - Grading progress
export async function GET(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const students = await prisma.studentProfile.findMany({
      include: {
        enrolledCourses: true,
        grades: true
      }
    });

    const weeklyProgress = [1, 2, 3, 4, 5, 6, 7].map(week => {
      let totalCourses = 0;
      let gradedCourses = 0;

      students.forEach((student: any) => {
        student.enrolledCourses.forEach((course: any) => {
          totalCourses++;
          const hasGrade = student.grades.some((g: any) => g.courseId === course.id && g.week === week);
          if (hasGrade) gradedCourses++;
        });
      });

      return {
        week,
        total: totalCourses,
        graded: gradedCourses,
        percentage: totalCourses > 0 ? (gradedCourses / totalCourses) * 100 : 0
      };
    });

    return NextResponse.json({ weeklyProgress });
  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly progress' }, { status: 500 });
  }
}