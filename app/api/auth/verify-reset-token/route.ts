// app/api/auth/verify-reset-token/route.ts
/**
 * VERIFY RESET TOKEN API ROUTE
 * 
 * Verifies if a reset token is valid and not expired.
 * 
 * Endpoint: POST /api/auth/verify-reset-token
 * Request Body: { email: string, token: string }
 * Response: { success: boolean, message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token } = body;

    // Validate required fields
    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Verify reset token
    const result = await verifyResetToken(email, token);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token verified successfully. You can now reset your password.',
    });
  } catch (error) {
    console.error('Verify reset token API error:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}