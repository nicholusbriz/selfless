import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTokenEdge } from '@/lib/jwt-edge';
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

    // ✅ FIXED: Ensure role is always present
    const userRole = user.role?.name || null;
    
    // If user has no role, this is a database issue
    if (!userRole) {
      console.error(`User ${user.id} has no role assigned!`);
      return NextResponse.json(
        { success: false, message: 'User account configuration error. Contact support.' },
        { status: 500 }
      );
    }

    // Generate JWT token with userId AND role using edge-compatible function
    const token = await generateTokenEdge({ 
      userId: user.id, 
      role: userRole
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // ✅ FIXED: Set cookie with proper options
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true for production (Vercel), false for localhost
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // Important for all routes
    });

    console.log('✅ Login successful for email:', email, 'userId:', user.id, 'role:', userRole);
    console.log('✅ Cookie set with token length:', token.length);
    console.log('✅ Response cookies:', response.cookies.get('token'));
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during login',
    }, { status: 500 });
  }
}