import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/student/courses - Get all courses for the authenticated student
export async function GET(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            enrolledCourses: {
              select: {
                id: true,
                courseName: true,
                credits: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!userWithProfile?.studentProfile) {
      return NextResponse.json({ courses: [] });
    }

    return NextResponse.json({ courses: userWithProfile.studentProfile.enrolledCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST /api/student/courses - Add multiple courses for the authenticated student
export async function POST(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courses } = await request.json();

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ error: 'Invalid courses data' }, { status: 400 });
    }

    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!userWithProfile?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Create all courses
    const createdCourses = await Promise.all(
      courses.map((course) =>
        prisma.enrolledCourse.create({
          data: {
            studentId: userWithProfile.studentProfile!.id,
            courseName: course.courseName,
            credits: course.credits,
            status: 'active'
          }
        })
      )
    );

    // Recalculate total credits
    const allCourses = await prisma.enrolledCourse.findMany({
      where: { studentId: userWithProfile.studentProfile!.id }
    });

    const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

    // Update student profile
    await prisma.studentProfile.update({
      where: { id: userWithProfile.studentProfile!.id },
      data: { totalCredits }
    });

    return NextResponse.json({ courses: createdCourses, totalCredits });
  } catch (error) {
    console.error('Error submitting courses:', error);
    return NextResponse.json({ error: 'Failed to submit courses' }, { status: 500 });
  }
}

// PUT /api/student/courses?id={id} - Update a specific course
export async function PUT(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const { courseName, credits } = await request.json();

    // Verify the course belongs to the user
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!userWithProfile?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const course = await prisma.enrolledCourse.findFirst({
      where: {
        id: id,
        studentId: userWithProfile.studentProfile!.id
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    const updatedCourse = await prisma.enrolledCourse.update({
      where: { id },
      data: { courseName, credits }
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE /api/student/courses?id={id} - Delete a specific course
export async function DELETE(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    console.log('DELETE request received for course ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Verify the course belongs to the user
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!userWithProfile?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check if course exists and belongs to the user
    const course = await prisma.enrolledCourse.findFirst({
      where: {
        id: id,
        studentId: userWithProfile.studentProfile!.id
      }
    });

    if (!course) {
      console.log('Course not found:', id, 'for student:', userWithProfile.studentProfile!.id);
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    // Delete the course
    await prisma.enrolledCourse.delete({
      where: { id }
    });

    console.log('Successfully deleted course:', id);

    // Recalculate total credits
    const allCourses = await prisma.enrolledCourse.findMany({
      where: { studentId: userWithProfile.studentProfile!.id }
    });

    const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

    // Update student profile
    await prisma.studentProfile.update({
      where: { id: userWithProfile.studentProfile!.id },
      data: { totalCredits }
    });

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete course: ' + errorMessage }, { status: 500 });
  }
}