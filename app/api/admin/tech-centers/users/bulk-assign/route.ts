import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PATCH - Bulk assign multiple students to a teacher
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
      return NextResponse.json({ error: 'Student IDs array is required' }, { status: 400 });
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
        id: { in: studentIds },
        techCenterId: adminUser.techCenter.id
      }
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json({ 
        error: 'Some students not found or do not belong to your tech center',
        foundCount: students.length,
        requestedCount: studentIds.length
      }, { status: 400 });
    }

    // Bulk assign students to teacher
    const result = await prisma.user.updateMany({
      where: {
        id: { in: studentIds }
      },
      data: { teacherId }
    });

    return NextResponse.json({
      message: `${result.count} students assigned to teacher successfully`,
      assignedCount: result.count,
    });
  } catch (error) {
    console.error('Error bulk assigning students to teacher:', error);
    return NextResponse.json(
      { error: 'Failed to bulk assign students to teacher' },
      { status: 500 }
    );
  }
}
