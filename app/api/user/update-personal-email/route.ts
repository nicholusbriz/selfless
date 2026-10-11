import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthUser, requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { publishUserProfileInvalidation } from '@/lib/partykit-server';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Parse request body
    const body = await req.json();
    const { personalEmail } = body;

    if (!personalEmail) {
      return NextResponse.json(
        { error: 'Personal email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate that it's a Gmail address
    const domain = personalEmail.split('@')[1]?.toLowerCase();
    if (domain !== 'gmail.com') {
      return NextResponse.json(
        { error: 'Personal email must be a Gmail address (@gmail.com)' },
        { status: 400 }
      );
    }

    // Check if personal email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: personalEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { error: 'This email is already in use by another account' },
        { status: 400 }
      );
    }

    // Update user's personal email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { personalEmail },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
        techCenter: true,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'update_personal_email',
        entityType: 'user',
        entityId: user.id,
        details: { personalEmail },
        techCenterId: user.techCenterId,
      },
    });

    await publishUserProfileInvalidation(user.id);

    // Return updated user data
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        personalEmail: updatedUser.personalEmail,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role?.name || 'student',
        techCenterId: updatedUser.techCenterId,
        profileImageUrl: updatedUser.profileImageUrl,
        status: updatedUser.status,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error: any) {
    console.error('Personal email update API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update personal email' },
      { status: 500 }
    );
  }
}
