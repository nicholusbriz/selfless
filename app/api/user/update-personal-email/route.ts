import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import type { Prisma } from '@prisma/client';
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Parse request body
    const body = await parseJsonBody(req, { personalEmail: isString });
    if (!body) return invalidJsonBodyResponse();
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

    // Check if current email is a .edu email
    const isEduEmail = user.email.toLowerCase().endsWith('.edu');

    // Update user: replace main email with Gmail, save old .edu email if applicable
    const updateData: Prisma.UserUpdateInput = { email: personalEmail };
    if (isEduEmail) {
      updateData.eduEmail = user.email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
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
        action: 'update_email',
        entityType: 'user',
        entityId: user.id,
        details: { 
          oldEmail: user.email, 
          newEmail: personalEmail,
          eduEmail: isEduEmail ? user.email : undefined
        },
        techCenterId: user.techCenterId,
      },
    });

    // Return updated user data
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        eduEmail: updatedUser.eduEmail,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role?.name || 'student',
        techCenterId: updatedUser.techCenterId,
        profileImageUrl: updatedUser.profileImageUrl,
        status: updatedUser.status,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error('Email update API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
}
