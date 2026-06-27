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
    
    // Allow all authenticated users to view teachers (not just admins)
    // This is needed for the overview page which is accessible to all roles

    // Get all users with teacher OR admin role (admins can also be tutors)
    const tutors = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['teacher', 'admin']
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        role: {
          select: {
            name: true
          }
        },
        teacherProfile: true
      }
    });

    // Get assignment counts
    const tutorsWithCounts = await Promise.all(tutors.map(async (tutor) => {
      const assignments = await prisma.teacherStudentAssignment.findMany({
        where: { teacherId: tutor.id }
      });
      
      return {
        id: tutor.id,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        name: `${tutor.firstName} ${tutor.lastName}`,
        email: tutor.email,
        profileImageUrl: tutor.profileImageUrl,
        role: tutor.role?.name || 'unknown',
        teacherId: tutor.teacherProfile?.teacherId || null,
        profileId: tutor.teacherProfile?.id || null,
        totalStudents: assignments.length,
        verifiedCount: assignments.filter(a => a.status === 'verified').length,
        notVerifiedCount: assignments.filter(a => a.status === 'not_verified').length
      };
    }));

    return NextResponse.json({ teachers: tutorsWithCounts });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}