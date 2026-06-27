import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/students/:id - Get student profile by ID (accessible to all authenticated users)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Try to find by User ID first
    let student = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            enrolledCourses: {
              include: {
                grades: true
              }
            },
            grades: true
          }
        },
        role: true
      }
    });

    // If not found by User ID, try by StudentProfile ID
    if (!student?.studentProfile) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              role: true
            }
          },
          enrolledCourses: {
            include: {
              grades: true
            }
          },
          grades: true
        }
      });

      if (studentProfile) {
        student = { ...studentProfile.user, studentProfile } as any;
      }
    }

    if (!student?.studentProfile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        role: student.role,
        studentProfile: student.studentProfile
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}
