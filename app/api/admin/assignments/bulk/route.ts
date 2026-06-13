import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// POST /api/admin/assignments/bulk - Bulk assign students to a teacher
export async function POST(request: NextRequest) {
  try {
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
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { teacherId, studentIds, status, notes } = await request.json();

    if (!teacherId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: teacherId and studentIds array' }, { status: 400 });
    }

    // Verify teacher exists and has teacher role
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { role: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (teacher.role?.name !== 'teacher') {
      return NextResponse.json({ error: 'Selected user is not a teacher' }, { status: 400 });
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