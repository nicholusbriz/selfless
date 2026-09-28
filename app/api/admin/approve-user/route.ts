// app/api/admin/approve-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const adminUser = await requireAuth();
    
    if (!adminUser || (adminUser.role?.name !== 'admin' && adminUser.role?.name !== 'super_admin' && adminUser.role?.name !== 'dev')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. userId and action (approve/reject) are required.' },
        { status: 400 }
      );
    }

    // Find the user to approve/reject
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        techCenter: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if admin has permission to approve this user
    // Regular admins can only approve users from their own tech center
    // Super admins and devs can approve any user
    if (adminUser.role?.name === 'admin' && adminUser.techCenterId) {
      if (targetUser.techCenterId !== adminUser.techCenterId) {
        return NextResponse.json(
          { error: 'You can only approve users from your own tech center' },
          { status: 403 }
        );
      }
    }

    if (action === 'approve') {
      // Approve the user
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          verifiedById: adminUser.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User approved successfully',
        user: {
          id: targetUser.id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          email: targetUser.email,
        },
      });
    } else if (action === 'reject') {
      // Reject the user - delete them from the database
      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        success: true,
        message: 'User rejected and account deleted successfully',
        user: {
          id: targetUser.id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          email: targetUser.email,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}