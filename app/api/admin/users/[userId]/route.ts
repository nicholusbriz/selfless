import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logUserAction } from '@/lib/logger';

// GET - Fetch single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            permissions: true,
          }
        },
        techCenter: {
          include: {
            country: true,
          }
        },
        _count: {
          select: {
            submittedCourses: true,
            grades: true,
            gradesGiven: true,
            notifications: true,
            activityLogs: true,
            // cleaningRegistration is a one-to-one relation, cannot count
            // Remove this line
            attendanceRecords: true,
          }
        },
        // Recent activity
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, country, city, techCenterId } = body;

    // Cannot update self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot update your own profile here' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (techCenterId !== undefined) updateData.techCenterId = techCenterId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: true,
        techCenter: true,
      }
    });

    // Log the user update activity
    await logUserAction(
      session.user.id,
      'update',
      'user',
      userId,
      {
        updatedFields: Object.keys(updateData),
        targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`
      },
      updatedUser.techCenterId || undefined
    );

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user with cascade deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Cannot delete self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        techCenter: true,
        accounts: { select: { id: true } },
        sessions: { select: { id: true } },
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Use a transaction to delete all related records
    await prisma.$transaction(async (tx) => {
      // 1. Delete cleaning registration (one-to-one relation)
      await tx.cleaningRegistration.deleteMany({
        where: { userId }
      });

      // 2. Delete attendance records
      await tx.attendanceRecord.deleteMany({
        where: { userId }
      });

      // 3. Delete grades (both student and teacher)
      await tx.grade.deleteMany({
        where: {
          OR: [
            { studentId: userId },
            { assignedBy: userId }
          ]
        }
      });

      // 4. Delete student courses
      await tx.studentCourse.deleteMany({
        where: { studentId: userId }
      });

      // 5. Delete announcements
      await tx.announcement.deleteMany({
        where: { authorId: userId }
      });

      // 6. Delete notifications
      await tx.notification.deleteMany({
        where: { userId }
      });

      // 7. Delete activity logs
      await tx.activityLog.deleteMany({
        where: { userId }
      });

      // 8. Delete sessions (NextAuth)
      await tx.session.deleteMany({
        where: { userId }
      });

      // 9. Delete accounts (NextAuth)
      await tx.account.deleteMany({
        where: { userId }
      });

      // 10. Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    }, {
      timeout: 30000 // Increase timeout to 30 seconds
    });

    // Log the user deletion activity
    await logUserAction(
      session.user.id,
      'delete',
      'user',
      userId,
      {
        deletedUser: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role?.name
      },
      user.techCenterId || undefined
    );

    return NextResponse.json({
      message: `User ${user.firstName} ${user.lastName} deleted successfully`,
      deleted: {
        id: userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}