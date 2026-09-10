import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Get the current user's assigned tutor (for students) or assigned students (for teachers)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user with their role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user is a student, return their assigned tutor
    if (user.role?.name === 'student') {
      const userWithTutor = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImageUrl: true,
              techCenter: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json({
        isTeacher: false,
        hasTutor: !!userWithTutor?.teacherId,
        tutor: userWithTutor?.teacher || null
      });
    }

    // If user is a teacher, return their assigned students
    if (user.role?.name === 'teacher') {
      const assignedStudents = await prisma.user.findMany({
        where: {
          teacherId: session.user.id
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImageUrl: true,
          status: true,
          isActive: true
        }
      });

      return NextResponse.json({
        isTeacher: true,
        studentCount: assignedStudents.length,
        students: assignedStudents
      });
    }

    // For other roles, return empty response
    return NextResponse.json({
      isTeacher: false,
      hasTutor: false,
      tutor: null
    });
  } catch (error) {
    console.error('Error fetching tutor/assignment info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment information' },
      { status: 500 }
    );
  }
}
