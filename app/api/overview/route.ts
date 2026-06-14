import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/overview - Get overview data (requires authentication only)
export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Middleware already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all students with their courses and religion status
    const users = await prisma.user.findMany({
      where: {
        studentProfile: {
          isNot: null
        }
      },
      include: {
        role: true,
        studentProfile: {
          include: {
            enrolledCourses: {
              include: {
                grades: true
              }
            },
            grades: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    // Transform to expected format including religion status
    const students = users.map((user: any) => {
      const profile = user.studentProfile;
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        studentId: profile?.studentId || '',
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        currentGPA: profile?.currentGPA || 0,
        totalCredits: profile?.totalCredits || 0,
        coursesCount: profile?.enrolledCourses?.length || 0,
        tuition: profile?.tuition || null,
        tuitionPaid: profile?.tuitionPaid || false,
        takesReligion: profile?.takesReligion || false,  // ✅ Add this line
        enrolledCourses: profile?.enrolledCourses || [],
        grades: profile?.grades || []
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 });
  }
}