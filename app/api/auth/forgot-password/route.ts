// app/api/auth/forgot-password/route.ts
/**
 * FORGOT PASSWORD API ROUTE
 * 
 * Handles password reset requests.
 * Generates a 6-digit token valid for 24 hours.
 * 
 * Endpoint: POST /api/auth/forgot-password
 * Request Body: { email: string }
 * Response: { success: boolean, message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetRequest } from '@/lib/auth/server';

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

    // Create password reset request
    const result = await createPasswordResetRequest(email);

    if (result.error) {
      // For security, still return success message even if user doesn't exist
      // This prevents email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a reset code within 24 hours. Please contact your administrator for assistance.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive a reset code within 24 hours. Please contact your administrator for assistance.',
    });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}