import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Get all assignments for this teacher (using User ID directly)
    const assignments = await prisma.teacherStudentAssignment.findMany({
      where: {
        teacherId: userId
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImageUrl: true,
            studentProfile: {
              select: {
                id: true,
                studentId: true,
                currentGPA: true,
                totalCredits: true,
                tuition: true,
                tuitionPaid: true,
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
        firstName: student.firstName,
        lastName: student.lastName,
        name: `${student.firstName} ${student.lastName}`,
        studentId: profile?.studentId || 'N/A',
        studentProfileId: profile?.id || '',
        email: student.email,
        phoneNumber: student.phoneNumber,
        profileImageUrl: student.profileImageUrl,
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