// app/api/auth/check-reset-token/route.ts
/**
 * CHECK RESET TOKEN API ROUTE
 * 
 * Checks if a user has an active password reset token.
 * 
 * Endpoint: POST /api/auth/check-reset-token
 * Request Body: { email: string }
 * Response: { hasActiveToken: boolean, message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await getUserByEmail(email);

    if (!user) {
      // For security, don't reveal if user exists
      return NextResponse.json({
        hasActiveToken: false,
        message: 'No active reset token found'
      });
    }

    // Check if user has an active reset token
    const now = new Date();
    const hasActiveToken = user.resetToken && user.resetTokenExpiry && new Date(user.resetTokenExpiry) > now;

    return NextResponse.json({
      hasActiveToken,
      message: hasActiveToken 
        ? 'Active reset token found' 
        : 'No active reset token found'
    });
  } catch (error) {
    console.error('Check reset token API error:', error);
    return NextResponse.json(
      { error: 'Failed to check reset token' },
      { status: 500 }
    );
  }
}