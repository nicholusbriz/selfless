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

import {  NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

// Define types for better type safety
interface StudentWithTechCenter {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: { name: string } | null;
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    } | null;
  } | null;
  generalCourse: string | null;
  takesReligion: boolean | null;
  status: string;
  isActive: boolean;
  createdAt: Date;
  submittedCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
}

interface TechCenterWithCountry {
  id: string;
  name: string;
  country: {
    name: string;
  } | null;
}

// Type for the grouped student (without submittedCourses, with studentCourses)
type GroupedStudent = Omit<StudentWithTechCenter, 'submittedCourses'> & {
  studentCourses: StudentWithTechCenter['submittedCourses'];
};

export async function GET() {
  try {
    // Get authenticated user
    await requireAuth();

    // Fetch all tech centers for filter
    const techCenters: TechCenterWithCountry[] = await prisma.techCenter.findMany({
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

    // Fetch all users with tech center info and course data
    const students = await prisma.user.findMany({
      where: {
        techCenterId: {
          not: null
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
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
        takesReligion: true,
        status: true,
        isActive: true,
        createdAt: true,
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
      orderBy: [
        { techCenter: { name: 'asc' } },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Group students by tech center
    const studentsByTechCenter: Record<string, GroupedStudent[]> = {};
    
    students.forEach((student) => {
      const techCenterName = student.techCenter?.name || 'No Tech Center';
      
      if (!studentsByTechCenter[techCenterName]) {
        studentsByTechCenter[techCenterName] = [];
      }
      
      studentsByTechCenter[techCenterName].push({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        profileImageUrl: student.profileImageUrl,
        role: student.role,
        techCenter: student.techCenter,
        generalCourse: student.generalCourse,
        takesReligion: student.takesReligion,
        status: student.status,
        isActive: student.isActive,
        createdAt: student.createdAt,
        studentCourses: student.submittedCourses
      });
    });

    return NextResponse.json({
      studentsByTechCenter,
      techCenters,
      totalStudents: students.length,
    });
  } catch (error: unknown) {
    console.error('Students list API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
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