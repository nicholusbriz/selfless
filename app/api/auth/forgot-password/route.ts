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
import { prisma } from '@/lib/prisma/client';

const GENERIC_RESPONSE = {
  success: true,
  message: 'If your email is registered, a reset code may be sent. Check your inbox and spam folder. If it does not arrive, contact your administrator for assistance.',
};

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
      return NextResponse.json(GENERIC_RESPONSE);
    }

    if (!result.token || !result.user || !result.expiry) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const storedToken = await prisma.user.findFirst({
      where: {
        id: result.user.id,
        resetToken: result.token,
        resetTokenExpiry: result.expiry,
      },
      select: { id: true },
    });

    if (!storedToken) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Log the password reset request using the existing logger
    const ipAddress = extractIpAddress(req);
    const userAgent = extractUserAgent(req);
    const location = req.headers.get('cf-ipcountry') || undefined;

    try {
      await logPasswordResetRequest(
        result.user.id,
        result.user.email,
        result.expiry,
        result.user.techCenter?.id,
        ipAddress,
        userAgent,
        location
      );
    } catch (error) {
      console.error('Failed to store password reset audit log:', error);
    }

    // Send email with reset code
    const emailResult = await sendPasswordResetEmail({
      to: result.user.email,
      firstName: result.user.firstName,
      resetCode: result.token,
      expiryDate: result.expiry,
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}