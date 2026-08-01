// C:\Selfless\my-app\app\api\auth\logout\route.ts
/**
 * LOGOUT API ROUTE
 * 
 * Handles user logout.
 * Clears the HTTP-only cookie.
 * 
 * Endpoint: POST /api/auth/logout
 * Response: { success: true }
 */

import { NextResponse } from 'next/server';
import { AUTH_CONSTANTS } from '@/lib/auth/types';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';
import { logLogout, extractIpAddress, extractUserAgent } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    // Get user info from token before deleting cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONSTANTS.TOKEN_NAME)?.value;
    
    let userId: string | undefined;
    let techCenterId: string | undefined;
    
    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId;
      techCenterId = decoded?.techCenterId;
    }

    // Delete the auth cookie
    cookieStore.delete(AUTH_CONSTANTS.TOKEN_NAME);

    // Log the logout activity if we have user info
    if (userId) {
      await logLogout(
        userId,
        techCenterId,
        extractIpAddress(req),
        extractUserAgent(req)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}