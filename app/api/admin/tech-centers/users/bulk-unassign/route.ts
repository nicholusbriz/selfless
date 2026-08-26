import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PATCH - Bulk unassign students from a teacher
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { studentIds, teacherId } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 });
    }

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

    // Verify all students exist and belong to the same tech center
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds }
      },
      include: { techCenter: true }
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json({ error: 'One or more students not found' }, { status: 404 });
    }

    for (const student of students) {
      if (student.techCenterId !== adminUser.techCenter.id) {
        return NextResponse.json({ error: 'One or more students do not belong to your tech center' }, { status: 403 });
      }
    }

    // Bulk unassign students from teacher
    const updatedStudents = await prisma.user.updateMany({
      where: {
        id: { in: studentIds },
        teacherId: teacherId
      },
      data: { teacherId: null }
    });

    return NextResponse.json({
      message: 'Students unassigned from teacher successfully',
      count: updatedStudents.count,
    });
  } catch (error) {
    console.error('Error bulk unassigning students from teacher:', error);
    return NextResponse.json(
      { error: 'Failed to bulk unassign students from teacher' },
      { status: 500 }
    );
  }
}
