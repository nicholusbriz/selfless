// app/api/students/[studentId]/route.ts
/**
 * STUDENT PROFILE API ROUTE
 * 
 * Fetches a student's public profile information.
 * Requires authentication (users can view other students' profiles).
 * 
 * Endpoint: GET /api/students/[studentId]
 * Response: { student: StudentProfile }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    // Get authenticated user
    await requireAuth();

    const { studentId } = await params;

    // Validate studentId
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Fetch student profile
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true, // Email is needed on the profile page
        phoneNumber: true,
        profileImageUrl: true,
        role: {
          select: {
            name: true,
          },
        },
        techCenter: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
        country: true,
        city: true,
        town: true,
        street: true,
        generalCourse: true,
        takesReligion: true,
        linkedinUrl: true,
        githubUrl: true,
        projectUrls: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        isActive: true,
        lastLoginAt: true,
        submittedCourses: {
          select: {
            id: true,
            code: true,
            courseUnit: true,
            credits: true,
            status: true
          }
        }
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Return student profile data with cache headers
    const response = NextResponse.json({
      student: {
        _id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email, // Email included for profile page
        phoneNumber: student.phoneNumber,
        profileImage: student.profileImageUrl,
        role: student.role?.name || 'student',
        studentId: student.id,
        techCenter: student.techCenter,
        country: student.country,
        city: student.city,
        town: student.town,
        street: student.street,
        generalCourse: student.generalCourse,
        takesReligion: student.takesReligion,
        linkedinUrl: student.linkedinUrl,
        githubUrl: student.githubUrl,
        projectUrls: student.projectUrls,
        gender: student.gender,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        status: student.status,
        isActive: student.isActive,
        lastLoginAt: student.lastLoginAt,
        studentCourses: student.submittedCourses
      },
    });

    // Set cache headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: unknown) {
    console.error('Student profile API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch student profile' },
      { status: 500 }
    );
  }
}