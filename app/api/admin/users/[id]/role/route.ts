import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/users/[id]/role - Update user role
export async function PUT(
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
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { roleId } = await request.json();
    const targetUserId = (await params).id;

    // Verify the role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Get the current user with all profiles
    const currentUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        role: true,
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found',
        details: `No user found with ID: ${targetUserId}`
      }, { status: 404 });
    }

    const oldRoleName = currentUser.role?.name;

    // Generate IDs if promoting to teacher or admin
    const generateTeacherId = async () => {
      const year = new Date().getFullYear();
      const lastTeacher = await prisma.teacherProfile.findFirst({
        orderBy: { teacherId: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastTeacher && lastTeacher.teacherId) {
        const match = lastTeacher.teacherId.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }
      
      return `TCH${year}${nextNumber.toString().padStart(4, '0')}`;
    };

    const generateAdminId = async () => {
      const year = new Date().getFullYear();
      const lastAdmin = await prisma.adminProfile.findFirst({
        orderBy: { adminId: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastAdmin && lastAdmin.adminId) {
        const match = lastAdmin.adminId.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }
      
      return `ADM${year}${nextNumber.toString().padStart(4, '0')}`;
    };

    // Update the user's role and manage profiles
    await prisma.$transaction(async (tx) => {
      // Delete TeacherProfile if changing away from teacher role
      if (oldRoleName === 'teacher' && role.name !== 'teacher' && currentUser.teacherProfile) {
        // Delete all teacher-student assignments for this teacher
        await tx.teacherStudentAssignment.deleteMany({
          where: { teacherId: targetUserId }
        });

        // Delete the teacher profile
        await tx.teacherProfile.delete({
          where: { id: currentUser.teacherProfile.id }
        });
      }

      // Delete AdminProfile if changing away from admin role
      if (oldRoleName === 'admin' && role.name !== 'admin' && currentUser.adminProfile) {
        await tx.adminProfile.delete({
          where: { id: currentUser.adminProfile.id }
        });
      }

      // Update the user's role
      await tx.user.update({
        where: { id: targetUserId },
        data: { roleId }
      });

      // Create StudentProfile if changing to student role and doesn't exist
      if (role.name === 'student' && !currentUser.studentProfile) {
        const generateStudentId = async () => {
          const year = new Date().getFullYear();
          const lastStudent = await tx.studentProfile.findFirst({
            orderBy: { studentId: 'desc' }
          });

          let nextNumber = 1;
          if (lastStudent && lastStudent.studentId) {
            const match = lastStudent.studentId.match(/\d+$/);
            if (match) {
              nextNumber = parseInt(match[0]) + 1;
            }
          }

          return `STU${year}${nextNumber.toString().padStart(4, '0')}`;
        };

        const studentId = await generateStudentId();
        await tx.studentProfile.create({
          data: {
            userId: targetUserId,
            studentId: studentId
          }
        });
      }

      // Create TeacherProfile if promoting to teacher and doesn't exist
      if (role.name === 'teacher' && !currentUser.teacherProfile) {
        const teacherId = await generateTeacherId();
        await tx.teacherProfile.create({
          data: {
            userId: targetUserId,
            teacherId: teacherId
          }
        });
      }

      // Create AdminProfile if promoting to admin and doesn't exist
      if (role.name === 'admin' && !currentUser.adminProfile) {
        const adminId = await generateAdminId();
        await tx.adminProfile.create({
          data: {
            userId: targetUserId,
            adminId: adminId
          }
        });
      }
    }, {
      timeout: 10000 // Increase timeout to 10 seconds
    });

    // Fetch updated user with all profiles (outside transaction)
    const userWithProfiles = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        role: true,
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: userWithProfiles,
      message: `Role updated from ${oldRoleName} to ${role.name}`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ 
      error: 'Failed to update user role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}