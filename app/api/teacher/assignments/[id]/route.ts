import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastToAll, broadcastToUser } from '@/lib/websocket-server';

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
      include: { 
        teacher: true,
        student: true
      }
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
      data: { status },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        }
      }
    });

    // Broadcast assignment update to all connected clients
    broadcastToAll('assignment:updated', updatedAssignment);
    // Notify the specific student
    broadcastToUser(assignment.studentId, 'assignment:updated', updatedAssignment);
    // Notify the teacher
    broadcastToUser(assignment.teacherId, 'assignment:updated', updatedAssignment);

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
