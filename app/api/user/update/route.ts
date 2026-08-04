// app/api/user/update/route.ts
/**
 * USER UPDATE API ROUTE
 * 
 * Updates user profile information (name, email, profile image, location, social links, etc.).
 * Requires authentication via NextAuth session.
 * 
 * Endpoint: POST /api/user/update
 * Request Body: { firstName?: string, lastName?: string, email?: string, profileImageUrl?: string, 
 *                phoneNumber?: string, country?: string, city?: string, town?: string, street?: string,
 *                generalCourse?: string, linkedinUrl?: string, githubUrl?: string, projectUrls?: string[] }
 * Response: { user: AuthUser }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthUser, requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Parse request body
    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      email, 
      profileImageUrl,
      phoneNumber,
      country,
      city,
      town,
      street,
      generalCourse,
      linkedinUrl,
      githubUrl,
      projectUrls,
      gender
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (town !== undefined) updateData.town = town;
    if (street !== undefined) updateData.street = street;
    if (generalCourse !== undefined) updateData.generalCourse = generalCourse;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (projectUrls !== undefined) updateData.projectUrls = projectUrls;
    if (gender !== undefined) updateData.gender = gender;

    // Handle email update (requires validation)
    if (email !== undefined && email !== user.email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Email already in use by another account' },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Update user in database
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
        action: 'update_profile',
        entityType: 'user',
        entityId: user.id,
        details: updateData,
        techCenterId: user.techCenterId,
      },
    });

    // Return updated user data
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role?.name || 'student',
        techCenterId: updatedUser.techCenterId,
        profileImageUrl: updatedUser.profileImageUrl,
        status: updatedUser.status,
        isActive: updatedUser.isActive,
        phoneNumber: updatedUser.phoneNumber,
        country: updatedUser.country,
        city: updatedUser.city,
        town: updatedUser.town,
        street: updatedUser.street,
        generalCourse: updatedUser.generalCourse,
        linkedinUrl: updatedUser.linkedinUrl,
        githubUrl: updatedUser.githubUrl,
        projectUrls: updatedUser.projectUrls,
        gender: updatedUser.gender,
      },
    });
  } catch (error: any) {
    console.error('User update API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
