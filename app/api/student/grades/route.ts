import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// GET /api/student/grades - Get all grades for student
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
      include: {
        role: true,
        studentProfile: {
          include: {
            grades: {
              include: {
                course: true
              }
            }
          }
        }
      }
    } as any);

    const isAdmin = (user as any)?.role?.name === 'admin';
    const hasStudentProfile = !!(user as any)?.studentProfile;

    if (!isAdmin && !hasStudentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // If admin but no student profile, return empty array
    if (isAdmin && !hasStudentProfile) {
      return NextResponse.json({ grades: [] });
    }

    return NextResponse.json({ grades: (user as any).studentProfile.grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}