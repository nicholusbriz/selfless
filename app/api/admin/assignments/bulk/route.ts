import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/assignments/bulk - Bulk assign students to a teacher
export async function POST(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { teacherId, studentIds, status, notes } = await request.json();

    if (!teacherId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: teacherId and studentIds array' }, { status: 400 });
    }

    // Verify tutor exists and has teacher or admin role
    const tutor = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { role: true }
    });

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Allow both teachers and admins to be tutors
    if (tutor.role?.name !== 'teacher' && tutor.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Selected user must be a teacher or admin' }, { status: 400 });
    }

    const assignments = [];
    const errors = [];

    for (const studentUserId of studentIds) {
      try {
        // Verify student exists (can be any user - student, teacher, or admin)
        const studentUser = await prisma.user.findUnique({
          where: { id: studentUserId }
        });

        if (!studentUser) {
          errors.push({ studentUserId, error: `Student user not found with ID: ${studentUserId}` });
          continue;
        }

        // Check if assignment already exists
        const existingAssignment = await prisma.teacherStudentAssignment.findFirst({
          where: {
            teacherId: teacherId,
            studentId: studentUserId
          }
        });

        if (existingAssignment) {
          errors.push({ studentUserId, error: 'Assignment already exists' });
          continue;
        }

        const assignment = await prisma.teacherStudentAssignment.create({
          data: {
            teacherId: teacherId,
            studentId: studentUserId,
            status: status || 'not_verified',
            notes: notes || null
          },
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            },
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        });

        assignments.push(assignment);
      } catch (error) {
        console.error(`Error creating assignment for student ${studentUserId}:`, error);
        errors.push({ studentUserId, error: 'Failed to create assignment' });
      }
    }

    return NextResponse.json({
      assignments,
      errors,
      message: `Successfully assigned ${assignments.length} students, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Error creating bulk assignments:', error);
    return NextResponse.json({ error: 'Failed to create bulk assignments' }, { status: 500 });
  }
}

// DELETE /api/admin/assignments/bulk - Bulk delete assignments
export async function DELETE(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { assignmentIds } = await request.json();

    if (!assignmentIds || !Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: assignmentIds array' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const assignmentId of assignmentIds) {
      try {
        const assignment = await prisma.teacherStudentAssignment.findUnique({
          where: { id: assignmentId }
        });

        if (!assignment) {
          errors.push({ assignmentId, error: 'Assignment not found' });
          continue;
        }

        await prisma.teacherStudentAssignment.delete({
          where: { id: assignmentId }
        });

        results.push({ assignmentId, deleted: true });
      } catch (error) {
        console.error(`Error deleting assignment ${assignmentId}:`, error);
        errors.push({ assignmentId, error: 'Failed to delete assignment' });
      }
    }

    return NextResponse.json({
      results,
      errors,
      message: `Successfully deleted ${results.length} assignments, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Error deleting bulk assignments:', error);
    return NextResponse.json({ error: 'Failed to delete bulk assignments' }, { status: 500 });
  }
}