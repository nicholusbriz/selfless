import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PATCH - Assign a student to a teacher
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { teacherId } = body;

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // Get the admin user with their tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { techCenter: true }
    });

    if (!adminUser || !adminUser.techCenter) {
      return NextResponse.json({ error: 'Admin or tech center not found' }, { status: 404 });
    }

    // Verify the teacher exists and belongs to the same tech center
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { 
        techCenter: true,
        role: true
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (teacher.techCenterId !== adminUser.techCenter.id) {
      return NextResponse.json({ error: 'Teacher does not belong to your tech center' }, { status: 403 });
    }

    if (teacher.role?.name !== 'teacher') {
      return NextResponse.json({ error: 'Target user is not a teacher' }, { status: 400 });
    }

    // Verify the student exists and belongs to the same tech center
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: { techCenter: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (student.techCenterId !== adminUser.techCenter.id) {
      return NextResponse.json({ error: 'Student does not belong to your tech center' }, { status: 403 });
    }

    // Assign student to teacher
    const updatedStudent = await prisma.user.update({
      where: { id: userId },
      data: { teacherId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        techCenter: true,
      }
    });

    return NextResponse.json({
      message: 'Student assigned to teacher successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Error assigning student to teacher:', error);
    return NextResponse.json(
      { error: 'Failed to assign student to teacher' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a student from a teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { teacherId } = body;

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // Get the admin user with their tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { techCenter: true }
    });

    if (!adminUser || !adminUser.techCenter) {
      return NextResponse.json({ error: 'Admin or tech center not found' }, { status: 404 });
    }

    // Verify the student exists and belongs to the same tech center
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: { techCenter: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (student.techCenterId !== adminUser.techCenter.id) {
      return NextResponse.json({ error: 'Student does not belong to your tech center' }, { status: 403 });
    }

    // Verify the student is currently assigned to the specified teacher
    if (student.teacherId !== teacherId) {
      return NextResponse.json({ error: 'Student is not assigned to this teacher' }, { status: 400 });
    }

    // Remove student from teacher
    const updatedStudent = await prisma.user.update({
      where: { id: userId },
      data: { teacherId: null },
      include: {
        techCenter: true,
      }
    });

    return NextResponse.json({
      message: 'Student removed from teacher successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Error removing student from teacher:', error);
    return NextResponse.json(
      { error: 'Failed to remove student from teacher' },
      { status: 500 }
    );
  }
}
