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

export async function POST() {
  try {
    // Delete the auth cookie
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_CONSTANTS.TOKEN_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}