import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// PUT /api/admin/users/[id]/role - Update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!adminUser || adminUser.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { roleId } = await request.json();
    const userId = (await params).id;

    // Verify the role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Get the current user with all profiles
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
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
        details: `No user found with ID: ${userId}`
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
        where: { id: userId },
        data: { roleId }
      });

      // Create TeacherProfile if promoting to teacher and doesn't exist
      if (role.name === 'teacher' && !currentUser.teacherProfile) {
        const teacherId = await generateTeacherId();
        await tx.teacherProfile.create({
          data: {
            userId: userId,
            teacherId: teacherId
          }
        });
      }

      // Create AdminProfile if promoting to admin and doesn't exist
      if (role.name === 'admin' && !currentUser.adminProfile) {
        const adminId = await generateAdminId();
        await tx.adminProfile.create({
          data: {
            userId: userId,
            adminId: adminId
          }
        });
      }
    }, {
      timeout: 10000 // Increase timeout to 10 seconds
    });

    // Fetch updated user with all profiles (outside transaction)
    const userWithProfiles = await prisma.user.findUnique({
      where: { id: userId },
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