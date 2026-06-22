import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/assignments - Get assignments for the current teacher
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
    const status = searchParams.get('status');
    const teacherUserId = searchParams.get('teacherId');
    const fetchAll = searchParams.get('all');

    const where: any = {};
    
    // Use User ID directly (not teacherProfile.id)
    if (fetchAll === 'true') {
      // Fetch all assignments for all teachers
      // Don't filter by teacherId
    } else if (teacherUserId) {
      where.teacherId = teacherUserId;
    } else {
      where.teacherId = userId;  // Use User ID directly
    }
    
    if (status) where.status = status;

    // Fetch assignments - student is directly a User model
    const assignments = await prisma.teacherStudentAssignment.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
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
      },
      orderBy: { assignedAt: 'desc' }
    });

    // Calculate GPA for each student
    const assignmentsWithGPA = assignments.map((assignment) => {
      const studentProfile = assignment.student.studentProfile;
      const courses = studentProfile?.enrolledCourses || [];
      const grades = studentProfile?.grades || [];
      
      let totalPoints = 0;
      let totalCredits = 0;
      
      const gradePointsMap: Record<string, number> = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.4, 'B': 3.0, 'B-': 2.7,
        'C+': 2.4, 'C': 2.0, 'C-': 1.7, 'D+': 1.4, 'D': 1.0,
        'D-': 0.7, 'E': 0.0, 'F': 0.0
      };
      
      for (const course of courses) {
        const courseGrades = grades.filter((g: any) => g.courseId === course.id);
        if (courseGrades.length === 0) continue;
        
        const latestGrade = courseGrades.reduce((latest: any, current: any) => 
          current.week > latest.week ? current : latest
        );
        
        const gradePoints = gradePointsMap[latestGrade.gradeLetter as string] || 0;
        totalPoints += gradePoints * course.credits;
        totalCredits += course.credits;
      }
      
      const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      
      return {
        id: assignment.id,
        teacherId: assignment.teacherId,
        studentId: assignment.studentId,
        status: assignment.status,
        notes: assignment.notes,
        assignedAt: assignment.assignedAt,
        updatedAt: assignment.updatedAt,
        teacher: assignment.teacher,
        student: {
          id: assignment.student.id,
          firstName: assignment.student.firstName,
          lastName: assignment.student.lastName,
          email: assignment.student.email,
          studentId: studentProfile?.studentId,
          studentProfile: studentProfile,
          gpa,
          enrolledCourses: courses,
          grades: grades
        }
      };
    });

    return NextResponse.json({ assignments: assignmentsWithGPA });
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}