import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { calculateGradePoints, calculateGPA } from '@/lib/gpa-calculator';

// POST /api/teacher/grades - Assign/update a grade
export async function POST(request: NextRequest) {
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only teachers and admins can assign grades
    if (user.role?.name !== 'teacher' && user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - only teachers and admins can assign grades' }, { status: 403 });
    }

    const { studentId, courseId, week, gradeLetter } = await request.json();

    if (!studentId || !courseId || !week || !gradeLetter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gradePoints = calculateGradePoints(gradeLetter);

    // Check if grade already exists
    const existingGrade = await (prisma as any).grade.findUnique({
      where: {
        studentId_courseId_week: {
          studentId,
          courseId,
          week
        }
      }
    });

    let grade;
    if (existingGrade) {
      // Update existing grade
      grade = await (prisma as any).grade.update({
        where: { id: existingGrade.id },
        data: {
          gradeLetter,
          gradePoints,
          assignedBy: user.id,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new grade
      grade = await (prisma as any).grade.create({
        data: {
          studentId,
          courseId,
          week,
          gradeLetter,
          gradePoints,
          assignedBy: user.id
        }
      });
    }

    // Recalculate student's GPA
    const student = await (prisma as any).studentProfile.findUnique({
      where: { id: studentId },
      include: {
        enrolledCourses: true,
        grades: true
      }
    });

    if (student) {
      const newGPA = calculateGPA(student.enrolledCourses, student.grades);
      
      await (prisma as any).studentProfile.update({
        where: { id: studentId },
        data: { currentGPA: newGPA }
      });

      return NextResponse.json({ 
        grade, 
        newGPA,
        message: 'Grade saved successfully' 
      });
    }

    return NextResponse.json({ grade, message: 'Grade saved successfully' });
  } catch (error) {
    console.error('Error saving grade:', error);
    return NextResponse.json({ error: 'Failed to save grade' }, { status: 500 });
  }
}

// GET /api/teacher/grades/progress - Get grading progress by week
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

    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');

    // Verify user is teacher or admin for GET request as well
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || (user.role?.name !== 'teacher' && user.role?.name !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await (prisma as any).studentProfile.findMany({
      include: {
        enrolledCourses: true,
        grades: true
      }
    });

    const progress = students.map((student: any) => {
      const courses = student.enrolledCourses;
      const grades = student.grades;
      
      let graded = 0;
      let total = courses.length;

      if (week) {
        const weekNum = parseInt(week);
        courses.forEach((course: any) => {
          const hasGrade = grades.some((g: any) => g.courseId === course.id && g.week === weekNum);
          if (hasGrade) graded++;
        });
      } else {
        courses.forEach((course: any) => {
          const hasGrade = grades.some((g: any) => g.courseId === course.id);
          if (hasGrade) graded++;
        });
      }

      return {
        studentId: student.studentId,
        name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
        graded,
        total,
        percentage: total > 0 ? (graded / total) * 100 : 0
      };
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching grading progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
