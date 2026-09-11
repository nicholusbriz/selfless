import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { calculateGPA } from '@/lib/gpa-calculator';

/**
 * GET /api/grades/me
 * Current student's courses, grades, and GPA.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await prisma.studentCourse.findMany({
      where: {
        studentId: session.user.id,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        courseUnit: true,
        credits: true,
        status: true,
        grades: {
          orderBy: { assignedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            gradeLetter: true,
            gradePoints: true,
            score: true,
            notes: true,
            assignedAt: true,
          },
        },
      },
    });

    const mapped = courses.map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
      courseUnit: course.courseUnit,
      credits: course.credits,
      status: course.status,
      grade: course.grades[0] ?? null,
    }));

    const graded = mapped
      .filter((c) => c.grade)
      .map((c) => ({
        credits: c.credits,
        gradePoints: c.grade!.gradePoints,
      }));

    const totalCredits = mapped.reduce((sum, c) => sum + c.credits, 0);
    const gradedCredits = graded.reduce((sum, c) => sum + c.credits, 0);
    const totalPoints = graded.reduce(
      (sum, c) => sum + c.gradePoints * c.credits,
      0
    );

    return NextResponse.json({
      courses: mapped,
      gpa: calculateGPA(graded),
      totalPoints: Math.round(totalPoints * 100) / 100,
      totalCredits,
      gradedCredits,
      gradedCourses: graded.length,
    });
  } catch (error) {
    console.error('GET /api/grades/me error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch your grades' },
      { status: 500 }
    );
  }
}
