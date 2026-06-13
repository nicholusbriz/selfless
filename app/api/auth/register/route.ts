import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';
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

    // Generate a unique student ID (Format: STU2024001)
    const generateStudentId = async () => {
      const year = new Date().getFullYear();
      const lastStudent = await prisma.studentProfile.findFirst({
        orderBy: { studentId: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastStudent && lastStudent.studentId) {
        const match = lastStudent.studentId.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }
      
      return `STU${year}${nextNumber.toString().padStart(4, '0')}`;
    };

    // Create new user with student profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phoneNumber,
          roleId: userRole.id
        }
      });

      // Generate student ID
      const studentId = await generateStudentId();

      // Create the student profile with ONLY fields that exist in your schema
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: newUser.id,
          studentId: studentId,
          takesReligion: false,     // Default value
          tuition: null,            // No tuition set yet
          tuitionPaid: false,       // Default false
          currentGPA: 0,            // Starting GPA
          totalCredits: 0           // Starting credits
        }
      });

      // Get the complete user with profiles
      const userWithProfiles = await tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          role: true,
          studentProfile: true,
          teacherProfile: true
        }
      });

      return userWithProfiles;
    });

    // Generate JWT token
    const token = generateToken(result!.id);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: result
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during registration',
    }, { status: 500 });
  }
}