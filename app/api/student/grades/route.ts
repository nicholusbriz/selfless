import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/student/grades - Get all grades for student
export async function GET(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        studentProfile: {
          include: {
            grades: true
          }
        }
      }
    });

    const isAdmin = userRole === 'admin';
    const hasStudentProfile = !!userWithProfile?.studentProfile;

    if (!isAdmin && !hasStudentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // If admin but no student profile, return empty array
    if (isAdmin && !hasStudentProfile) {
      return NextResponse.json({ grades: [] });
    }

    return NextResponse.json({ grades: userWithProfile?.studentProfile?.grades || [] });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}