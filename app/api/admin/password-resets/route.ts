// app/api/admin/password-resets/route.ts
/**
 * GET PASSWORD RESET REQUESTS API ROUTE
 * 
 * Fetches all users with active password reset tokens.
 * Only accessible by dev role.
 * 
 * Endpoint: GET /api/admin/password-resets
 * Response: { users: Array }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, hasRole } from '@/lib/auth/server';
import { getUsersWithActiveResetTokens } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    // Require authentication and dev role
    const user = await requireAuth();
    
    if (!hasRole(user, 'dev')) {
      return NextResponse.json(
        { error: 'Unauthorized. Dev role access required.' },
        { status: 403 }
      );
    }

    // Get users with active reset tokens
    const result = await getUsersWithActiveResetTokens();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: result.users,
    });
  } catch (error) {
    console.error('Get password resets API error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch password reset requests' },
      { status: 500 }
    );
  }
}