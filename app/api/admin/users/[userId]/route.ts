import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import {
  invalidJsonBodyResponse,
  isBoolean,
  isString,
  optional,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';
import { logUserAction } from '@/lib/logger';
import { deleteAllProfileImagesForUser } from '@/lib/azure-storage';

function isPrismaWriteConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2034'
  );
}

// GET - Fetch single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
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
            cleaningRegistrations: true,
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

    const allowedRoles = ['dev', 'super_admin', 'admin'];
    if (!session?.user?.id || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await parseJsonBody(request, {
      firstName: optional(isString),
      lastName: optional(isString),
      email: optional(isString),
      phoneNumber: optional(isString),
      country: optional(isString),
      city: optional(isString),
      techCenterId: optional(isString),
      hasVerifiedBadge: optional(isBoolean),
    });
    if (!body) return invalidJsonBodyResponse();
    const { firstName, lastName, email, phoneNumber, country, city, techCenterId, hasVerifiedBadge } = body;

    // Cannot update self — except dev/super_admin toggling their own verified badge
    if (userId === session.user.id) {
      const onlyBadge =
        hasVerifiedBadge !== undefined &&
        [firstName, lastName, email, phoneNumber, country, city, techCenterId].every(
          (v) => v === undefined,
        );
      if (
        (session.user.role === 'dev' || session.user.role === 'super_admin') &&
        onlyBadge
      ) {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { hasVerifiedBadge },
          select: { id: true, hasVerifiedBadge: true },
        });
        return NextResponse.json({ success: true, user: updated });
      }
      return NextResponse.json(
        { error: 'Cannot update your own profile here' },
        { status: 400 },
      );
    }

    // Fetch caller's promotedById for ownership checks
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { promotedById: true },
    });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        techCenterId: true,
        promotedById: true,
        role: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // ── Ownership checks (skipped for dev) ───────────────────────────────────
    if (session.user.role !== 'dev') {
      // admin cannot edit a super_admin
      if (existingUser.role?.name === 'super_admin' && session.user.role === 'admin') {
        return NextResponse.json(
          { error: "Admins cannot edit a Super Admin's profile." },
          { status: 403 },
        );
      }

      // super_admin → super_admin: ownership check
      if (existingUser.role?.name === 'super_admin' && session.user.role === 'super_admin') {
        if (caller?.promotedById && caller.promotedById === userId) {
          return NextResponse.json(
            { error: 'You cannot edit the profile of the Super Admin who promoted you.' },
            { status: 403 },
          );
        }
        if (existingUser.promotedById !== session.user.id) {
          return NextResponse.json(
            { error: 'You can only edit profiles of Super Admins you personally promoted.' },
            { status: 403 },
          );
        }
      }

      // admin → admin: ownership check
      if (existingUser.role?.name === 'admin' && session.user.role === 'admin') {
        if (caller?.promotedById && caller.promotedById === userId) {
          return NextResponse.json(
            { error: 'You cannot edit the profile of the Admin who promoted you.' },
            { status: 403 },
          );
        }
        if (existingUser.promotedById !== session.user.id) {
          return NextResponse.json(
            { error: 'You can only edit profiles of Admins you personally promoted.' },
            { status: 403 },
          );
        }
      }

      // super_admin touching admin/teacher/student → free.
      // admin touching teacher/student → free within their tech center scope.
    }

    // Only dev / super_admin may grant or revoke the verified badge
    if (
      hasVerifiedBadge !== undefined &&
      session.user.role !== 'dev' &&
      session.user.role !== 'super_admin'
    ) {
      return NextResponse.json(
        { error: 'Only devs and super admins can change verification' },
        { status: 403 },
      );
    }

    // Build update data
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Handle email update (requires validation)
    if (email !== undefined && email !== existingUser.email) {
      // Check if email is already taken by another user
      const emailUser = await prisma.user.findUnique({
        where: { email },
      });

      if (emailUser && emailUser.id !== userId) {
        return NextResponse.json(
          { error: 'Email already in use by another account' },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (hasVerifiedBadge !== undefined) updateData.hasVerifiedBadge = hasVerifiedBadge;
    const nextTechCenterId =
      techCenterId === '' ? null : techCenterId;
    const techCenterChanged =
      techCenterId !== undefined &&
      nextTechCenterId !== existingUser.techCenterId;

    if (techCenterId !== undefined) {
      updateData.techCenterId = nextTechCenterId;
    }

    const roleName = existingUser.role?.name;
    const shouldDemoteToStudent =
      techCenterChanged &&
      roleName !== 'student' &&
      roleName !== 'dev' &&
      roleName !== 'super_admin';

    if (shouldDemoteToStudent) {
      const studentRole = await prisma.role.findUnique({
        where: { name: 'student' },
        select: { id: true },
      });
      if (!studentRole) {
        return NextResponse.json(
          { error: 'Student role is not configured' },
          { status: 500 },
        );
      }

      updateData.roleId = studentRole.id;
      updateData.roleUpdatedAt = new Date();
      updateData.promotedById = null;

      if (roleName === 'teacher') {
        await prisma.user.updateMany({
          where: { teacherId: userId },
          data: { teacherId: null },
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: true,
        techCenter: true,
      },
    });

    // Log the user update activity
    await logUserAction(
      session.user.id,
      'update',
      'user',
      userId,
      {
        updatedFields: Object.keys(updateData),
        targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`,
      },
      updatedUser.techCenterId || undefined,
    );

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow super_admin, dev, and admin
    if (session.user.role !== 'super_admin' && session.user.role !== 'dev' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { userId } = await params;

    // Cannot delete self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 },
      );
    }

    // Fetch caller's promotedById for ownership checks
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true, promotedById: true },
    });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        techCenter: true,
        accounts: { select: { id: true } },
        sessions: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // ── Ownership / role checks ───────────────────────────────────────────────
    if (session.user.role !== 'dev') {
      // Nobody below dev can delete a super_admin
      if (user.role?.name === 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot delete a Super Admin user.' },
          { status: 403 },
        );
      }

      // admin cannot delete another admin
      if (user.role?.name === 'admin' && session.user.role === 'admin') {
        return NextResponse.json(
          { error: 'Admins cannot delete other Admins.' },
          { status: 403 },
        );
      }

      // For regular admins — also enforce same tech center restriction
      if (session.user.role === 'admin') {
        if (!caller?.techCenterId) {
          return NextResponse.json(
            { error: 'No tech center assigned' },
            { status: 404 },
          );
        }
        if (user.techCenterId !== caller.techCenterId) {
          return NextResponse.json(
            { error: 'Access denied. User not in your tech center.' },
            { status: 403 },
          );
        }
      }

      // super_admin can delete any admin, teacher, or student freely.
      // No further ownership restriction for super_admin on non-super_admin targets.
    }

    // dev → dev: a promoted dev cannot delete the dev who promoted them
    if (session.user.role === 'dev' && user.role?.name === 'dev') {
      if (caller?.promotedById && caller.promotedById === userId) {
        return NextResponse.json(
          { error: 'You cannot delete the Dev who promoted you.' },
          { status: 403 },
        );
      }
    }

    // MongoDB can abort a long transaction when another request updates a
    // document touched by the deletion (for example, a concurrent heartbeat).
    const maxAttempts = 3;
    for (let attempt = 1; ; attempt += 1) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.cleaningRegistration.deleteMany({
            where: { userId },
          });

          await tx.attendanceRecord.deleteMany({
            where: { userId },
          });

          await tx.grade.deleteMany({
            where: {
              OR: [{ studentId: userId }, { assignedBy: userId }],
            },
          });

          await tx.studentCourse.deleteMany({
            where: { studentId: userId },
          });

          await tx.announcement.deleteMany({
            where: { authorId: userId },
          });

          await tx.notification.deleteMany({
            where: { userId },
          });

          await tx.activityLog.deleteMany({
            where: { userId },
          });

          await tx.session.deleteMany({
            where: { userId },
          });

          await tx.account.deleteMany({
            where: { userId },
          });

          await tx.user.delete({
            where: { id: userId },
          });
        }, {
          timeout: 30000,
        });
        break;
      } catch (error) {
        if (!isPrismaWriteConflict(error) || attempt >= maxAttempts) {
          throw error;
        }

        const delayMs = 100 * 2 ** (attempt - 1) + Math.floor(Math.random() * 100);
        console.warn(
          `User deletion transaction write conflict for ${userId}; retrying (${attempt}/${maxAttempts - 1})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // Azure cleanup cannot participate in the database transaction.
    try {
      await deleteAllProfileImagesForUser(userId);
    } catch (imageErr) {
      console.error(
        `Failed to delete profile images for user ${userId}:`,
        imageErr,
      );
    }

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
    if (isPrismaWriteConflict(error)) {
      return NextResponse.json(
        { error: 'The user record is being updated. Please retry the deletion.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}