import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

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
      include: { role: true, teacherProfile: true }
    });

    if (!user || (user.role?.name !== 'teacher' && user.role?.name !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all assignments for this teacher (using User ID directly)
    const assignments = await prisma.teacherStudentAssignment.findMany({
      where: {
        teacherId: user.id
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: {
              include: {
                enrolledCourses: true,
                grades: true
              }
            }
          }
        }
      }
    });

    // Format students
    const students = assignments.map(assignment => {
      const student = assignment.student;
      const profile = student.studentProfile;
      
      return {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        studentId: profile?.studentId || 'N/A',
        email: student.email,
        currentGPA: profile?.currentGPA || 0,
        totalCredits: profile?.totalCredits || 0,
        coursesCount: profile?.enrolledCourses?.length || 0,
        tuition: profile?.tuition || null,
        tuitionPaid: profile?.tuitionPaid || false,
        enrolledCourses: profile?.enrolledCourses || [],
        existingGrades: profile?.grades || []
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}