import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/student/courses/[id] - Update a specific course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { courseName, credits, status } = body;

    console.log('PUT request received for course ID:', id, body);

    // Verify the course belongs to the user
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!userWithProfile?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check if course exists and belongs to the user
    const existingCourse = await prisma.enrolledCourse.findFirst({
      where: {
        id: id,
        studentId: userWithProfile.studentProfile!.id
      }
    });

    if (!existingCourse) {
      console.log('Course not found:', id, 'for student:', userWithProfile.studentProfile!.id);
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    // Update the course
    const updatedCourse = await prisma.enrolledCourse.update({
      where: { id },
      data: {
        ...(courseName !== undefined && { courseName }),
        ...(credits !== undefined && { credits }),
        ...(status !== undefined && { status })
      }
    });

    console.log('Successfully updated course:', id);

    // Recalculate total credits if credits changed
    if (credits !== undefined) {
      const allCourses = await prisma.enrolledCourse.findMany({
        where: { studentId: userWithProfile.studentProfile!.id }
      });

      const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

      await prisma.studentProfile.update({
        where: { id: userWithProfile.studentProfile!.id },
        data: { totalCredits }
      });
    }

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update course: ' + errorMessage }, { status: 500 });
  }
}

// DELETE /api/student/courses/[id] - Delete a specific course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    console.log('DELETE request received for course ID:', id);
    
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

    // Delete related grades first
    await prisma.grade.deleteMany({
      where: { courseId: id }
    });

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
