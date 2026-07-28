// C:\Selfless\my-app\app\api\auth\me\route.ts
/**
 * ME API ROUTE
 * 
 * Gets the currently authenticated user from the session cookie.
 * Used by client to fetch user data on page load.
 * 
 * Endpoint: GET /api/auth/me
 * Response: { user: AuthUser | null }
 */

import { NextResponse } from 'next/server';
import { getServerAuthUser } from '@/lib/auth/server';

export async function GET() {
  try {
    // Get authenticated user from cookie
    const user = await getServerAuthUser();

    if (!user) {
      return NextResponse.json(
        { user: null, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { user: null, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}