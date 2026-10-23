import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import {
  invalidJsonBodyResponse,
  isBoolean,
  isString,
  isStringOrNumber,
  optional,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

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
    const body = await parseJsonBody(request, {
      code: optional(isString),
      courseUnit: optional(isString),
      credits: optional(isStringOrNumber),
      takesReligion: optional(isBoolean),
    });
    if (!body) return invalidJsonBodyResponse();
    const { code, courseUnit, credits, takesReligion } = body;
    const parsedCredits = credits === undefined ? undefined : Number(credits);

    if (
      parsedCredits !== undefined &&
      (!Number.isInteger(parsedCredits) || !Number.isFinite(parsedCredits))
    ) {
      return NextResponse.json({ error: 'Credits must be a whole number' }, { status: 400 });
    }

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
        credits: parsedCredits,
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