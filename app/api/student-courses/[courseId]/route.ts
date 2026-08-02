import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PUT - Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const { code, courseUnit, credits, takesReligion } = body;

    // Get the course to verify ownership
    const course = await prisma.studentCourse.findUnique({
      where: { id: courseId },
      select: { studentId: true }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.studentId !== session.user.id) {
      return NextResponse.json({ error: 'You can only update your own courses' }, { status: 403 });
    }

    // Update course
    const updatedCourse = await prisma.studentCourse.update({
      where: { id: courseId },
      data: {
        code: code || undefined,
        courseUnit: courseUnit || undefined,
        credits: credits !== undefined ? parseInt(credits) : undefined,
        takesReligion: takesReligion !== undefined ? takesReligion : undefined
      }
    });

    return NextResponse.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;

    // Get the course to verify ownership
    const course = await prisma.studentCourse.findUnique({
      where: { id: courseId },
      select: { studentId: true }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.studentId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own courses' }, { status: 403 });
    }

    // Delete course
    await prisma.studentCourse.delete({
      where: { id: courseId }
    });

    return NextResponse.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}