import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ MUST await params - this is the key fix
    const { id } = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify course ownership
    const existingCourse = await prisma.enrolledCourse.findFirst({
      where: {
        id: id,
        studentId: user.studentProfile.id
      }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Delete the course
    await prisma.enrolledCourse.delete({
      where: { id: id }
    });

    // Recalculate total credits
    const allCourses = await prisma.enrolledCourse.findMany({
      where: { studentId: user.studentProfile.id }
    });
    const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

    await prisma.studentProfile.update({
      where: { id: user.studentProfile.id },
      data: { totalCredits }
    });

    return NextResponse.json({ success: true, totalCredits });
  } catch (error) {
    console.error('DELETE error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete course: ' + errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ MUST await params - this is the key fix
    const { id } = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { courseName, credits } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify course ownership
    const existingCourse = await prisma.enrolledCourse.findFirst({
      where: {
        id: id,
        studentId: user.studentProfile.id
      }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Update the course
    const updatedCourse = await prisma.enrolledCourse.update({
      where: { id: id },
      data: { courseName, credits }
    });

    // Recalculate total credits
    const allCourses = await prisma.enrolledCourse.findMany({
      where: { studentId: user.studentProfile.id }
    });
    const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

    await prisma.studentProfile.update({
      where: { id: user.studentProfile.id },
      data: { totalCredits }
    });

    return NextResponse.json({ success: true, course: updatedCourse, totalCredits });
  } catch (error) {
    console.error('PUT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update course: ' + errorMessage }, { status: 500 });
  }
}