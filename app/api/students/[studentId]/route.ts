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
    const user = await requireAuth();

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
        linkedinUrl: true,
        githubUrl: true,
        projectUrls: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        isActive: true,
        lastLoginAt: true,
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
        linkedinUrl: student.linkedinUrl,
        githubUrl: student.githubUrl,
        projectUrls: student.projectUrls,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        status: student.status,
        isActive: student.isActive,
        lastLoginAt: student.lastLoginAt,
      },
    });

    // Set cache headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error('Student profile API error:', error);
    
    if (error.message === 'Unauthorized') {
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
