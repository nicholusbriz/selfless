// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/server';
import { AUTH_CONSTANTS } from '@/lib/auth/types';
import { cookies } from 'next/headers';
import { generateToken } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, phoneNumber, techCenterId, gender, preferredTeamType, preferredTeamRole } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber || !techCenterId) {
      return NextResponse.json(
        { error: 'Name, email, password, phone number, and tech center are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Register user with default football team preference if not provided
    const result = await registerUser({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      techCenterId,
      gender,
      preferredTeamType: preferredTeamType || 'FOOTBALL',
      preferredTeamRole: preferredTeamRole || 'PLAYER',
    });

    // ✅ Handle registration failure - user already exists
    if (result.error) {
      // Check if user already exists
      if (result.error === 'Email already registered') {
        return NextResponse.json(
          { error: 'This email is already registered. Please log in instead.' },
          { status: 409 } // 409 Conflict
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    if (!result.user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      );
    }

    // Generate token for auto-login
    const token = generateToken(
      result.user.id,
      result.user.email,
      'student'
    );

    // Set HTTP-only cookie with JWT
    const cookieStore = await cookies();
    cookieStore.set(AUTH_CONSTANTS.TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.COOKIE_MAX_AGE,
      path: '/',
    });

    // ✅ Return 201 Created for successful registration
    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: 'student',
          techCenterId: result.user.techCenterId,
        },
        token,
        message: 'Registration successful!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}