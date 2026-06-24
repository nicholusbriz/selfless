import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateTokenEdge } from '@/lib/jwt-edge';
import { registerSchema } from '@/lib/validations/auth';
import { rateLimit, getIdentifier } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input using Zod
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, phoneNumber } = validationResult.data;

    // Rate limiting
    const identifier = getIdentifier(request, email);
    const rateLimitResult = rateLimit(identifier, 5, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many registration attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find or create the student role
    let userRole = await prisma.role.findUnique({
      where: { name: 'student' }
    });

    if (!userRole) {
      userRole = await prisma.role.create({
        data: {
          name: 'student',
          permissions: ['read', 'submit_assignments', 'view_grades']
        }
      });
    }

    // Generate simple unique student ID using timestamp + random
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const studentId = `STU${year}${randomSuffix}`;

    // Create user first (sequential, no transaction)
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        roleId: userRole.id
      }
    });

    // Create student profile separately
    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: newUser.id,
        studentId: studentId,
        takesReligion: false,
        tuitionPaid: false,
        currentGPA: 0,
        totalCredits: 0
      }
    });

    // Fetch complete user with profiles
    const userWithProfiles = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        role: true,
        studentProfile: true,
        teacherProfile: true
      }
    });

    if (!userWithProfiles) {
      throw new Error('Failed to retrieve created user');
    }

    // Generate JWT token using edge-compatible function
    const token = await generateTokenEdge({ 
      userId: userWithProfiles.id, 
      role: 'student'
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userWithProfiles;

    // Set cookie with same options as login
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // Match login: false for localhost
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log('✅ Registration successful for email:', email, 'userId:', userWithProfiles.id);
    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    // Return actual error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error instanceof Error ? error.message : 'Unknown error')
      : 'Server error during registration';
    
    return NextResponse.json({
      success: false,
      message: errorMessage,
    }, { status: 500 });
  }
}