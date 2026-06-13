import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// GET /api/admin/reports/weekly-progress - Grading progress
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await (prisma as any).studentProfile.findMany({
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
