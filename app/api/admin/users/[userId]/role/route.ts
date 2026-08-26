// app/api/admin/users/[userId]/role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logUserAction } from '@/lib/logger';

// PATCH - Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Cannot change own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent demoting super admin
    if (user.role?.name === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot change a Super Admin\'s role' },
        { status: 400 }
      );
    }

    // Update user role and set roleUpdatedAt to trigger token refresh
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        roleId,
        roleUpdatedAt: new Date() // This will trigger JWT token refresh on next request
      },
      include: {
        role: true,
        techCenter: true,
      }
    });

    // Log the user role change activity
    await logUserAction(
      session.user.id,
      'update',
      'user',
      userId,
      {
        targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`,
        oldRole: user.role?.name,
        newRole: role.name,
        action: 'change_role'
      },
      updatedUser.techCenterId || undefined
    );

    return NextResponse.json({
      message: `User role changed from ${user.role?.name} to ${role.name}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    return NextResponse.json(
      { error: 'Failed to change user role' },
      { status: 500 }
    );
  }
}