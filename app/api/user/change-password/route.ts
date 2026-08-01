// app/api/user/change-password/route.ts
/**
 * CHANGE PASSWORD API ROUTE
 * 
 * Changes user password after validating current password.
 * Requires authentication via JWT cookie.
 * 
 * Endpoint: POST /api/user/change-password
 * Request Body: { currentPassword: string, newPassword: string }
 * Response: { success: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Parse request body
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!userWithPassword?.password) {
      return NextResponse.json(
        { error: 'User has no password set' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, userWithPassword.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'change_password',
        entityType: 'user',
        entityId: user.id,
        details: { timestamp: new Date().toISOString() },
        techCenterId: user.techCenterId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Change password API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
