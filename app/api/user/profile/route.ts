import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phoneNumber, country, city, town, street, generalCourse, techCenter, linkedinUrl, githubUrl, projectUrls, profileImageUrl } = await request.json();

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        country: country || undefined,
        city: city || undefined,
        town: town || undefined,
        street: street || undefined,
        generalCourse: generalCourse || undefined,
        techCenter: techCenter || undefined,
        linkedinUrl: linkedinUrl || undefined,
        githubUrl: githubUrl || undefined,
        projectUrls: projectUrls || undefined,
        profileImageUrl: profileImageUrl || undefined
      },
      include: {
        role: true,
        studentProfile: true,
        teacherProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
