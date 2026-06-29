import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/students/:id - Get student details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            role: true
          }
        },
        enrolledCourses: {
          include: {
            grades: true
          }
        },
        grades: true
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
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { firstName, lastName, email, phoneNumber } = await request.json();
    const { id } = await params;

    let student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      // Try to find by User ID
      const userRecord = await prisma.user.findUnique({
        where: { id },
        include: { studentProfile: true }
      });
      
      if (userRecord?.studentProfile) {
        student = { ...userRecord.studentProfile, user: userRecord } as any;
      }
    }

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
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    
    // Try to find by StudentProfile ID first
    let student = await prisma.studentProfile.findUnique({
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
        student = { ...userRecord.studentProfile, user: userRecord } as any;
      }
    }

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete in correct order to avoid foreign key constraints
    // 1. Delete grades
    await prisma.grade.deleteMany({
      where: { studentId: student.id }
    });
    
    // 2. Delete enrolled courses
    await prisma.enrolledCourse.deleteMany({
      where: { studentId: student.id }
    });
    
    // 3. Delete teacher-student assignments
    await prisma.teacherStudentAssignment.deleteMany({
      where: { studentId: student.user.id }
    });
    
    // 4. Delete teacher profile if exists
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: student.user.id }
    });
    if (teacherProfile) {
      await prisma.teacherProfile.delete({
        where: { id: teacherProfile.id }
      });
    }
    
    // 5. Delete admin profile if exists
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: student.user.id }
    });
    if (adminProfile) {
      await prisma.adminProfile.delete({
        where: { id: adminProfile.id }
      });
    }
    
    // 6. Delete student profile
    await prisma.studentProfile.delete({
      where: { id: student.id }
    });

    // 7. Delete user
    await prisma.user.delete({
      where: { id: student.user.id }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}