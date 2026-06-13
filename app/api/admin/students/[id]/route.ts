import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helper';

// GET /api/admin/students/:id - Get student details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(request, ['admin']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { id } = await params;
    const student = await (prisma as any).studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        enrolledCourses: {
          include: {
            grades: true
          }
        },
        grades: {
          include: {
            course: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

// PUT /api/admin/students/:id - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(request, ['admin']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { firstName, lastName, email, phoneNumber } = await request.json();
    const { id } = await params;

    const student = await (prisma as any).studentProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: student.user.id },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE /api/admin/students/:id - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(request, ['admin']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { id } = await params;
    
    // Try to find by StudentProfile ID first
    let student = await (prisma as any).studentProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    // If not found, try to find by User ID (for backward compatibility)
    if (!student) {
      const userRecord = await prisma.user.findUnique({
        where: { id },
        include: { studentProfile: true }
      });
      
      if (userRecord?.studentProfile) {
        student = userRecord.studentProfile;
        student.user = userRecord;
      }
    }

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete student profile (cascade will handle related records)
    await (prisma as any).studentProfile.delete({
      where: { id: student.id }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: student.user.id }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
