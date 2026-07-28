import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

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
    
    const body = await request.json();
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required', received: body },
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
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.techCenterId !== adminUser.techCenterId) {
      return NextResponse.json(
        { error: 'Access denied. User not in your tech center.' },
        { status: 403 }
      );
    }

    if (user.role?.name === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot change a Super Admin role' },
        { status: 400 }
      );
    }

    // Check if role exists and is not super_admin
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (role.name === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot assign Super Admin role' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: true,
        techCenter: true,
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'change_user_role',
        entityType: 'user',
        entityId: userId,
        details: {
          targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`,
          oldRole: user.role?.name,
          newRole: role.name
        },
        techCenterId: updatedUser.techCenterId,
      }
    });

    return NextResponse.json({
      message: `User role changed from ${user.role?.name} to ${role.name}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    return NextResponse.json(
      { error: 'Failed to change user role', details: String(error) },
      { status: 500 }
    );
  }
}