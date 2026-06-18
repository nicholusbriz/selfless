import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/teacher/assignments/[id] - Update assignment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for teacher or admin role
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Teacher or admin access required' }, { status: 403 });
    }

    const { id: assignmentId } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Find the assignment
    const assignment = await prisma.teacherStudentAssignment.findUnique({
      where: { id: assignmentId },
      include: { teacher: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if the user is the teacher assigned to this assignment or is an admin
    if (userRole === 'teacher' && assignment.teacherId !== userId) {
      return NextResponse.json({ error: 'Forbidden', message: 'You can only update your own assignments' }, { status: 403 });
    }

    // Update the assignment status
    const updatedAssignment = await prisma.teacherStudentAssignment.update({
      where: { id: assignmentId },
      data: { status }
    });

    return NextResponse.json({ assignment: updatedAssignment });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    return NextResponse.json({ 
      error: 'Failed to update assignment',
      details: error?.message 
    }, { status: 500 });
  }
}
