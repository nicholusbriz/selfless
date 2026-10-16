// app/api/auth/forgot-password/route.ts
/**
 * FORGOT PASSWORD API ROUTE
 *
 * Handles password reset requests.
 * Generates a 6-digit token valid for 24 hours.
 * Sends the code via email using Resend.
 *
 * Endpoint: POST /api/auth/forgot-password
 * Request Body: { email: string }
 * Response: { success: boolean, message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetRequest } from '@/lib/auth/server';
import { sendPasswordResetEmail } from '@/lib/email';

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

    // Send email with reset code
    if (result.token && result.user && result.expiry) {
      const emailResult = await sendPasswordResetEmail({
        to: result.user.email,
        firstName: result.user.firstName,
        resetCode: result.token,
        expiryDate: result.expiry,
      });

      if (!emailResult.success && !emailResult.skipped) {
        console.error('Failed to send password reset email:', emailResult.error);
        // Continue anyway - the code is still generated and stored
      }
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