import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logCourseSubmission } from '@/lib/logger';

// GET - Fetch student's courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await prisma.studentCourse.findMany({
      where: {
        studentId: session.user.id,
        status: 'ACTIVE'
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Calculate total credits
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

    return NextResponse.json({ 
      courses,
      totalCredits
    });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Submit courses (bulk or single)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courses, tuitionAmount, takesReligion } = body;

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ error: 'At least one course is required' }, { status: 400 });
    }

    // Validate each course
    for (const course of courses) {
      if (!course.code || !course.courseUnit || !course.credits) {
        return NextResponse.json({ error: 'Each course must have code, course unit, and credits' }, { status: 400 });
      }
    }

    // Get user's tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!user?.techCenterId) {
      return NextResponse.json({ error: 'User must be assigned to a tech center to submit courses' }, { status: 400 });
    }

    // Parse tuition amount
    const parsedTuition = tuitionAmount !== undefined && tuitionAmount !== null && tuitionAmount !== ''
      ? parseFloat(tuitionAmount)
      : null;

    // Create courses with tuition and religion data stored in each record
    const createdCourses = await Promise.all(
      courses.map((course: any) =>
        prisma.studentCourse.create({
          data: {
            studentId: session.user.id,
            techCenterId: user.techCenterId as string,
            name: course.name || course.code,
            code: course.code,
            courseUnit: course.courseUnit,
            credits: parseInt(course.credits),
            takesReligion: takesReligion || false,
            tuition: parsedTuition
          }
        })
      )
    );

    // Log the course submission activity
    await logCourseSubmission(
      session.user.id,
      user.techCenterId || undefined,
      {
        courseCount: createdCourses.length,
        courseCodes: createdCourses.map(c => c.code),
        totalCredits: createdCourses.reduce((sum, c) => sum + c.credits, 0),
      }
    );

    return NextResponse.json({
      message: 'Courses submitted successfully',
      courses: createdCourses
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting courses:', error);
    return NextResponse.json(
      { error: 'Failed to submit courses' },
      { status: 500 }
    );
  }
}

// PUT - Update student's academic settings (tuition and religion) across all active courses
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tuitionAmount, takesReligion } = body;

    // Parse tuition amount
    const parsedTuition = tuitionAmount !== undefined && tuitionAmount !== null && tuitionAmount !== ''
      ? parseFloat(tuitionAmount)
      : null;

    // Update all active courses for this student with the new tuition and religion settings
    const updatedCourses = await prisma.studentCourse.updateMany({
      where: {
        studentId: session.user.id,
        status: 'ACTIVE'
      },
      data: {
        tuition: parsedTuition,
        takesReligion: takesReligion !== undefined ? takesReligion : undefined
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: updatedCourses.count
    });
  } catch (error) {
    console.error('Error updating academic settings:', error);
    return NextResponse.json(
      { error: 'Failed to update academic settings' },
      { status: 500 }
    );
  }
}