import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch single user details (only if in same tech center)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { userId } = await params;

    // Get admin's tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!adminUser?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned' },
        { status: 404 }
      );
    }

    // Get user and verify they belong to same tech center
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            permissions: true,
          }
        },
        techCenter: {
          include: {
            country: true,
          }
        },
        _count: {
          select: {
            submittedCourses: true,
            grades: true,
            gradesGiven: true,
            notifications: true,
            activityLogs: true,
          }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user belongs to admin's tech center
    if (user.techCenterId !== adminUser.techCenterId) {
      return NextResponse.json(
        { error: 'Access denied. User not in your tech center.' },
        { status: 403 }
      );
    }

    // Check if user is super admin (should not be in this list anyway)
    if (user.role?.name === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot view super admin users' },
        { status: 403 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user details (only if in same tech center)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { userId } = await params;

    // Cannot update self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot update your own profile here' },
        { status: 400 }
      );
    }

    // Get admin's tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!adminUser?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned' },
        { status: 404 }
      );
    }

    // Get user and verify they belong to same tech center
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (existingUser.techCenterId !== adminUser.techCenterId) {
      return NextResponse.json(
        { error: 'Access denied. User not in your tech center.' },
        { status: 403 }
      );
    }

    if (existingUser.role?.name === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot modify super admin users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, country, city } = body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: true,
        techCenter: true,
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'update_user',
        entityType: 'user',
        entityId: userId,
        details: {
          updatedFields: Object.keys(updateData),
          targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`
        },
        techCenterId: updatedUser.techCenterId,
      }
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}