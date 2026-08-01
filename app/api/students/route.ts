// app/api/students/route.ts
/**
 * STUDENTS LIST API ROUTE
 * 
 * Fetches all users grouped by tech center.
 * Requires authentication.
 * 
 * Endpoint: GET /api/students
 * Response: { studentsByTechCenter: { [techCenterName]: User[] }, techCenters: TechCenter[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Fetch all tech centers for filter
    const techCenters = await prisma.techCenter.findMany({
      select: {
        id: true,
        name: true,
        country: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' }
    });

    // Fetch all users with their tech center info
    const students = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        role: {
          select: {
            name: true
          }
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
        generalCourse: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: [
        { techCenter: { name: 'asc' } },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Group students by tech center
    const studentsByTechCenter: { [key: string]: any[] } = {};
    
    students.forEach((student: any) => {
      const techCenterName = student.techCenter?.name || 'No Tech Center';
      
      if (!studentsByTechCenter[techCenterName]) {
        studentsByTechCenter[techCenterName] = [];
      }
      
      studentsByTechCenter[techCenterName].push({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        profileImageUrl: student.profileImageUrl,
        role: student.role,
        techCenter: student.techCenter,
        generalCourse: student.generalCourse,
        status: student.status,
        isActive: student.isActive,
        createdAt: student.createdAt,
      });
    });

    return NextResponse.json({
      studentsByTechCenter,
      techCenters,
      totalStudents: students.length,
    });
  } catch (error: any) {
    console.error('Students list API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
