import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import {
  calculateGPA,
  resolveGradeFromScore,
} from '@/lib/gpa-calculator';

const MANAGE_ROLES = new Set(['teacher', 'admin', 'super_admin']);

function canManageGrades(role?: string | null) {
  return !!role && MANAGE_ROLES.has(role);
}

async function getActor(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      techCenterId: true,
      role: { select: { name: true } },
    },
  });
}

/**
 * GET /api/grades
 * List students (with courses + grades + GPA) that the tutor/admin can manage.
 * Optional ?studentId= to fetch a single student detail.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageGrades(session.user.role)) {
      return NextResponse.json(
        { error: 'Only tutors and admins can manage grades' },
        { status: 403 }
      );
    }

    const actor = await getActor(session.user.id);
    if (!actor?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned' },
        { status: 404 }
      );
    }

    const studentId = request.nextUrl.searchParams.get('studentId');
    const search = request.nextUrl.searchParams.get('search') || '';

    const where: Record<string, unknown> = {
      techCenterId: actor.techCenterId,
      role: { name: 'student' },
      isActive: true,
    };

    if (studentId) {
      where.id = studentId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        generalCourse: true,
        submittedCourses: {
          where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
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
                updatedAt: true,
                assignedBy: true,
              },
            },
          },
        },
      },
    });

    const payload = students.map((student) => {
      const courses = student.submittedCourses.map((course) => {
        const grade = course.grades[0] ?? null;
        return {
          id: course.id,
          name: course.name,
          code: course.code,
          courseUnit: course.courseUnit,
          credits: course.credits,
          status: course.status,
          grade,
        };
      });

      const graded = courses
        .filter((c) => c.grade)
        .map((c) => ({
          credits: c.credits,
          gradePoints: c.grade!.gradePoints,
        }));

      const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
      const gradedCredits = graded.reduce((sum, c) => sum + c.credits, 0);
      const totalPoints = graded.reduce(
        (sum, c) => sum + c.gradePoints * c.credits,
        0
      );
      const gpa = calculateGPA(graded);

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        profileImageUrl: student.profileImageUrl,
        generalCourse: student.generalCourse,
        courses,
        gpa,
        totalPoints: Math.round(totalPoints * 100) / 100,
        totalCredits,
        gradedCredits,
        gradedCourses: graded.length,
      };
    });

    return NextResponse.json({ students: payload });
  } catch (error) {
    console.error('GET /api/grades error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades
 * Upsert a grade for a student course by numeric mark (score).
 * Body: { studentCourseId, score, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageGrades(session.user.role)) {
      return NextResponse.json(
        { error: 'Only tutors and admins can assign grades' },
        { status: 403 }
      );
    }

    const actor = await getActor(session.user.id);
    if (!actor?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const studentCourseId = body.studentCourseId as string | undefined;
    const score = typeof body.score === 'number' ? body.score : Number(body.score);
    const notes =
      typeof body.notes === 'string' && body.notes.trim()
        ? body.notes.trim()
        : null;

    if (!studentCourseId) {
      return NextResponse.json(
        { error: 'studentCourseId is required' },
        { status: 400 }
      );
    }

    if (Number.isNaN(score) || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score (mark) must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    const studentCourse = await prisma.studentCourse.findUnique({
      where: { id: studentCourseId },
      include: {
        student: {
          select: {
            id: true,
            techCenterId: true,
            teacherId: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    if (!studentCourse) {
      return NextResponse.json(
        { error: 'Student course not found' },
        { status: 404 }
      );
    }

    if (studentCourse.techCenterId !== actor.techCenterId) {
      return NextResponse.json(
        { error: 'Course is outside your tech center' },
        { status: 403 }
      );
    }

    if (studentCourse.student.role?.name !== 'student') {
      return NextResponse.json(
        { error: 'Target user is not a student' },
        { status: 400 }
      );
    }

    const scales = await prisma.gradeScale.findMany({
      where: { isActive: true },
    });

    if (!scales.length) {
      return NextResponse.json(
        { error: 'Grade scale is not configured' },
        { status: 500 }
      );
    }

    const resolved = resolveGradeFromScore(score, scales);
    if (!resolved) {
      return NextResponse.json(
        { error: 'Score does not match any grade scale band' },
        { status: 400 }
      );
    }

    const existing = await prisma.grade.findFirst({
      where: { studentCourseId },
      orderBy: { assignedAt: 'desc' },
    });

    const grade = existing
      ? await prisma.grade.update({
          where: { id: existing.id },
          data: {
            gradeLetter: resolved.gradeLetter,
            gradePoints: resolved.gradePoints,
            score,
            notes,
            assignedBy: session.user.id,
          },
        })
      : await prisma.grade.create({
          data: {
            studentCourseId,
            studentId: studentCourse.studentId,
            assignedBy: session.user.id,
            gradeLetter: resolved.gradeLetter,
            gradePoints: resolved.gradePoints,
            score,
            notes,
          },
        });

    // Recompute student GPA for response
    const allCourses = await prisma.studentCourse.findMany({
      where: {
        studentId: studentCourse.studentId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      select: {
        credits: true,
        grades: {
          orderBy: { assignedAt: 'desc' },
          take: 1,
          select: { gradePoints: true },
        },
      },
    });

    const graded = allCourses
      .filter((c) => c.grades[0])
      .map((c) => ({
        credits: c.credits,
        gradePoints: c.grades[0].gradePoints,
      }));

    const totalPoints = graded.reduce(
      (sum, c) => sum + c.gradePoints * c.credits,
      0
    );
    const gradedCredits = graded.reduce((sum, c) => sum + c.credits, 0);

    return NextResponse.json({
      grade,
      letter: resolved.gradeLetter,
      gradePoints: resolved.gradePoints,
      gpa: calculateGPA(graded),
      totalPoints: Math.round(totalPoints * 100) / 100,
      gradedCredits,
    });
  } catch (error) {
    console.error('POST /api/grades error:', error);
    return NextResponse.json(
      { error: 'Failed to save grade' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/grades?id=
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageGrades(session.user.role)) {
      return NextResponse.json(
        { error: 'Only tutors and admins can delete grades' },
        { status: 403 }
      );
    }

    const gradeId = request.nextUrl.searchParams.get('id');
    if (!gradeId) {
      return NextResponse.json(
        { error: 'Grade id is required' },
        { status: 400 }
      );
    }

    const actor = await getActor(session.user.id);
    if (!actor?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned' },
        { status: 404 }
      );
    }

    const existing = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        student: {
          select: { techCenterId: true, teacherId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    if (existing.student.techCenterId !== actor.techCenterId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.grade.delete({ where: { id: gradeId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/grades error:', error);
    return NextResponse.json(
      { error: 'Failed to delete grade' },
      { status: 500 }
    );
  }
}
