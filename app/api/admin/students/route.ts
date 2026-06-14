import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/students - Get all students with filters
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const gpaMin = searchParams.get('gpaMin');
    const gpaMax = searchParams.get('gpaMax');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    const where: any = {};

    if (gpaMin !== null || gpaMax !== null) {
      where.studentProfile = {};
      if (gpaMin) where.studentProfile.currentGPA = { ...where.studentProfile.currentGPA, gte: parseFloat(gpaMin) };
      if (gpaMax) where.studentProfile.currentGPA = { ...where.studentProfile.currentGPA, lte: parseFloat(gpaMax) };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by role (student, teacher, admin, or all)
    if (roleFilter && roleFilter !== 'all') {
      where.role = {
        name: roleFilter
      };
    }

    // Fetch all users (not just students) as potential students for assignment
    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        studentProfile: {
          include: {
            enrolledCourses: true,
            grades: true
          }
        },
        teacherProfile: true,
        adminProfile: true
      }
    });

    const formattedStudents = users.map((user: any) => {
      const profile = user.studentProfile;
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        studentId: profile?.studentId || '',
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        currentGPA: profile?.currentGPA || 0,
        totalCredits: profile?.totalCredits || 0,
        coursesCount: profile?.enrolledCourses?.length || 0,
        tuition: profile?.tuition || null,
        tuitionPaid: profile?.tuitionPaid || false,
        enrolledCourses: profile?.enrolledCourses || [],
        grades: profile?.grades || []
      };
    });

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// PUT /api/admin/students?id={id} - Update student
export async function PUT(request: NextRequest) {
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

    const url = new URL(request.url);
    const studentId = url.searchParams.get('id');
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const { firstName, lastName, email, phoneNumber } = await request.json();

    // Find the student profile and get the user id
    let student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      // Try to find by user ID
      const userRecord = await prisma.user.findUnique({
        where: { id: studentId },
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
      where: { id: student.user!.id },
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

// DELETE /api/admin/students?id={id} - Delete student
export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const studentId = url.searchParams.get('id');
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }
    
    // Find the student
    let student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      // Try to find by user ID
      const userRecord = await prisma.user.findUnique({
        where: { id: studentId },
        include: { studentProfile: true }
      });
      
      if (userRecord?.studentProfile) {
        student = { ...userRecord.studentProfile, user: userRecord } as any;
      }
    }

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete in correct order (child records first)
    
    // 1. Delete grades associated with this student
    await prisma.grade.deleteMany({
      where: { studentId: student.id }
    });
    
    // 2. Delete enrolled courses for this student
    await prisma.enrolledCourse.deleteMany({
      where: { studentId: student.id }
    });
    
    // 3. Delete teacher-student assignments
    await prisma.teacherStudentAssignment.deleteMany({
      where: { studentId: student.user!.id }
    });
    
    // 4. Check if user has teacher profile (if so, delete it first)
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: student.user!.id }
    });
    
    if (teacherProfile) {
      await prisma.teacherProfile.delete({
        where: { id: teacherProfile.id }
      });
    }
    
    // 5. Check if user has admin profile
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: student.user!.id }
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

    // 7. Finally delete user
    await prisma.user.delete({
      where: { id: student.user!.id }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ 
      error: 'Failed to delete student',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}