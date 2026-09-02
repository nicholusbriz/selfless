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
    
    // Allow both dev and super_admin to change roles
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
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

    // Check if role exists and is not the dev role
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent assigning dev role through UI
    if (role.name === 'dev') {
      return NextResponse.json(
        { error: 'Cannot assign dev role through UI.' },
        { status: 403 }
      );
    }

    // Prevent demoting super admin (only allowed for dev users)
    if (user.role?.name === 'super_admin' && session.user.role !== 'dev') {
      return NextResponse.json(
        { error: 'Cannot change a Super Admin\'s role' },
        { status: 400 }
      );
    }

    // Update user role and set roleUpdatedAt to trigger token refresh
    // Handle tech center changes based on role transitions
    const updateData: { 
      roleId: string; 
      roleUpdatedAt: Date; 
      techCenterId?: string | null;
      previousTechCenterId?: string | null;
    } = {
      roleId,
      roleUpdatedAt: new Date() // This will trigger JWT token refresh on next request
    };
    
    // Handle super_admin promotion - store previous tech center and clear current
    if (role.name === 'super_admin') {
      if (user.techCenterId) {
        updateData.previousTechCenterId = user.techCenterId;
      }
      updateData.techCenterId = null;
    }
    // Handle demotion from super_admin - restore previous tech center if available
    else if (user.role?.name === 'super_admin' && user.previousTechCenterId) {
      updateData.techCenterId = user.previousTechCenterId;
      updateData.previousTechCenterId = null;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        action: 'change_role',
        techCenterCleared: role.name === 'super_admin' ? true : undefined,
        techCenterRestored: user.role?.name === 'super_admin' && user.previousTechCenterId ? true : undefined
      },
      updatedUser.techCenterId || undefined
    );

    // Build appropriate message based on tech center changes
    let message = `User role changed from ${user.role?.name} to ${role.name}`;
    if (role.name === 'super_admin') {
      message += ' and tech center cleared (previous tech center stored for restoration)';
    } else if (user.role?.name === 'super_admin' && user.previousTechCenterId) {
      message += ' and previous tech center restored';
    }
    
    return NextResponse.json({
      message,
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