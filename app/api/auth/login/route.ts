// app/api/auth/login/route.ts
/**
 * LOGIN API ROUTE
 * 
 * Handles user login requests.
 * Validates credentials and sets HTTP-only cookie with JWT.
 * 
 * Endpoint: POST /api/auth/login
 * Request Body: { email: string, password: string }
 * Response: { user: AuthUser, token: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginUser, generateToken } from '@/lib/auth/server';
import { AUTH_CONSTANTS } from '@/lib/auth/types';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await loginUser(email, password);

    // Handle authentication failure
    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Login failed' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(
      result.user.id,
      result.user.email,
      result.user.role?.name || 'student'
    );

    // Set HTTP-only cookie with JWT
    const cookieStore = await cookies();
    cookieStore.set(AUTH_CONSTANTS.TOKEN_NAME, token, {
      httpOnly: true,           // ✅ Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only in production
      sameSite: 'lax',          // ✅ CSRF protection
      maxAge: AUTH_CONSTANTS.COOKIE_MAX_AGE,
      path: '/',
    });

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role?.name || 'student',
        techCenterId: result.user.techCenterId,
        profileImageUrl: result.user.profileImageUrl,
        status: result.user.status,
        isActive: result.user.isActive,
      },
      token,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}