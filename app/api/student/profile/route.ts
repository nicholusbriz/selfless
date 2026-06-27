import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/student/profile - Get student profile for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            enrolledCourses: true,
            grades: true
          }
        },
        studentAssignments: {
          include: {
            teacher: {
              include: {
                teacherProfile: true
              }
            }
          }
        }
      }
    });

    if (!userWithProfile?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get the first tutor assignment (regardless of verification status)
    const tutorAssignment = userWithProfile.studentAssignments[0] || null;
    const tutor = tutorAssignment?.teacher || null;

    return NextResponse.json({ 
      success: true, 
      user: {
        id: userWithProfile.id,
        firstName: userWithProfile.firstName,
        lastName: userWithProfile.lastName,
        email: userWithProfile.email,
        profileImageUrl: userWithProfile.profileImageUrl
      },
      profile: {
        ...userWithProfile.studentProfile,
        tutor: tutor ? {
          id: tutor.id,
          firstName: tutor.firstName,
          lastName: tutor.lastName,
          email: tutor.email,
          profileImageUrl: tutor.profileImageUrl,
          teacherId: tutor.teacherProfile?.teacherId,
          department: tutor.teacherProfile?.department
        } : null,
        hasTutor: !!tutor
      }
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/student/profile - Update student profile
export async function PUT(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { takesReligion, tuition } = await request.json();

    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!userWithProfile?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof takesReligion === 'boolean') {
      updateData.takesReligion = takesReligion;
    }
    if (typeof tuition === 'number') {
      updateData.tuition = tuition;
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { id: userWithProfile.studentProfile.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}