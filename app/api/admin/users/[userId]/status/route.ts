// app/api/admin/users/[userId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PATCH - Update user status
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, INACTIVE, or SUSPENDED' },
        { status: 400 }
      );
    }

    // Cannot change own status
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own status' },
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

    // Cannot change status of super admin
    if (user.role?.name === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot change a Super Admin\'s status' },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        role: true,
        techCenter: true,
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'change_user_status',
        entityType: 'user',
        entityId: userId,
        details: {
          targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`,
          oldStatus: user.status,
          newStatus: status
        },
        techCenterId: updatedUser.techCenterId,
      }
    });

    return NextResponse.json({
      message: `User status changed from ${user.status} to ${status}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error changing user status:', error);
    return NextResponse.json(
      { error: 'Failed to change user status' },
      { status: 500 }
    );
  }
}