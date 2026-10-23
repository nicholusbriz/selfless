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
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';
import { createPasswordResetRequest } from '@/lib/auth/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { logPasswordResetRequest, extractIpAddress, extractUserAgent } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await parseJsonBody(req, { email: isString });
    if (!body) return invalidJsonBodyResponse();
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

    // Log the password reset request using the existing logger
    const ipAddress = extractIpAddress(req);
    const userAgent = extractUserAgent(req);
    const location = req.headers.get('cf-ipcountry') || undefined;

    if (result.user) {
      await logPasswordResetRequest(
        result.user.id,
        result.user.email,
        result.token,
        result.expiry,
        result.user.techCenter?.id,
        ipAddress,
        userAgent,
        location
      );
    }

    // Send email with reset code
    if (result.token && result.user && result.expiry) {
      const emailResult = await sendPasswordResetEmail({
        to: result.user.email,
        firstName: result.user.firstName,
        resetCode: result.token,
        expiryDate: result.expiry,
      });

      if (emailResult.skipped) {
        console.log(`[forgot-password] Password reset email skipped due to daily limit for user: ${result.user.email}`);
      } else if (!emailResult.success) {
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