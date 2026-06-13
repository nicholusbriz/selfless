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
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users with teacher role
    const teachers = await prisma.user.findMany({
      where: {
        role: {
          name: 'teacher'
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        teacherProfile: true
      }
    });

    // Get assignment counts
    const teachersWithCounts = await Promise.all(teachers.map(async (teacher) => {
      const assignments = await prisma.teacherStudentAssignment.findMany({
        where: { teacherId: teacher.id }
      });
      
      return {
        id: teacher.id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email,
        teacherId: teacher.teacherProfile?.teacherId || null,
        profileId: teacher.teacherProfile?.id || null,
        totalStudents: assignments.length,
        verifiedCount: assignments.filter(a => a.status === 'verified').length,
        notVerifiedCount: assignments.filter(a => a.status === 'not_verified').length
      };
    }));

    return NextResponse.json({ teachers: teachersWithCounts });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}