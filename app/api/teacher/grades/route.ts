import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateGradePoints, calculateGPA } from '@/lib/gpa-calculator';

// POST /api/teacher/grades - Assign/update a grade
export async function POST(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for teacher or admin role
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Teacher or admin access required' }, { status: 403 });
    }

    const { studentId, courseId, week, gradeLetter } = await request.json();

    if (!studentId || !courseId || !week || !gradeLetter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gradePoints = calculateGradePoints(gradeLetter);

    // Check if grade already exists
    const existingGrade = await prisma.grade.findUnique({
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
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: {
          gradeLetter,
          gradePoints,
          assignedBy: userId,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new grade
      grade = await prisma.grade.create({
        data: {
          studentId,
          courseId,
          week,
          gradeLetter,
          gradePoints,
          assignedBy: userId
        }
      });
    }

    // Recalculate student's GPA
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        enrolledCourses: true,
        grades: true
      }
    });

    if (student) {
      const newGPA = calculateGPA(student.enrolledCourses, student.grades);
      
      await prisma.studentProfile.update({
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
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for teacher or admin role
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Teacher or admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');

    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
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