// app/api/auth/login/route.ts (UPDATED)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { loginSchema } from '@/lib/validations/auth';
import { rateLimit, getIdentifier } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input using Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Rate limiting
    const identifier = getIdentifier(request, email);
    const rateLimitResult = rateLimit(identifier, 5, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many login attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // Find user by email with role AND profiles
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        role: true,
        studentProfile: true,
        teacherProfile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email not found. Please register first.' },
        { status: 404 }
      );
    }

    // Generate JWT token with userId AND role (recommended for better performance)
    const token = generateToken({ 
      userId: user.id, 
      role: user.role?.name || 'student'  // Include role in token
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during login',
    }, { status: 500 });
  }
}