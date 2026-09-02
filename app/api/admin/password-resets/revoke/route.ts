// app/api/admin/password-resets/revoke/route.ts
/**
 * REVOKE PASSWORD RESET TOKEN API ROUTE
 * 
 * Revokes a password reset token for a specific user.
 * Only accessible by dev role.
 * 
 * Endpoint: POST /api/admin/password-resets/revoke
 * Request Body: { userId: string }
 * Response: { success: boolean, message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, hasRole } from '@/lib/auth/server';
import { revokeResetToken } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    // Require authentication and dev role
    const user = await requireAuth();
    
    if (!hasRole(user, 'dev')) {
      return NextResponse.json(
        { error: 'Unauthorized. Dev role access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Revoke reset token
    const result = await revokeResetToken(userId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset token revoked successfully',
    });
  } catch (error) {
    console.error('Revoke reset token API error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to revoke reset token' },
      { status: 500 }
    );
  }
}