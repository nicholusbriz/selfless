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
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
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