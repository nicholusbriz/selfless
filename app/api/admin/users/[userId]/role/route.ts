// app/api/admin/users/[userId]/role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logUserAction } from '@/lib/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Ownership helper
//
// Returns true when the caller is allowed to modify the target user's role.
//
// Rules:
//   dev       → always allowed, no conditions
//   super_admin → allowed ONLY if they personally promoted the target
//                 (target.promotedById === caller.id)
//                 AND the target is not the caller's own promoter
//                 (target.id !== caller.promotedById)
//   admin     → same ownership logic as super_admin but scoped to non-super roles
// ─────────────────────────────────────────────────────────────────────────────
function callerCanManage(
  callerRole: string,
  callerId: string,
  callerPromotedById: string | null,
  targetId: string,
  targetPromotedById: string | null,
): { allowed: boolean; reason?: string } {
  // dev has zero restrictions
  if (callerRole === 'dev') return { allowed: true };

  // Cannot manage self (handled separately, but belt-and-suspenders)
  if (callerId === targetId) {
    return { allowed: false, reason: 'Cannot change your own role' };
  }

  // Target must have been promoted by THIS caller
  if (targetPromotedById !== callerId) {
    return {
      allowed: false,
      reason:
        'You can only manage users you personally promoted. This user was promoted by someone else or has no promoter on record.',
    };
  }

  // The target must not be the caller's own promoter
  if (callerPromotedById && callerPromotedById === targetId) {
    return {
      allowed: false,
      reason: 'You cannot demote or change the role of the person who promoted you.',
    };
  }

  return { allowed: true };
}

// PATCH - Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Allow dev, super_admin, and admin to reach this endpoint
    const allowedRoles = ['dev', 'super_admin', 'admin'];
    if (!session?.user?.id || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 },
      );
    }

    // Cannot change own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 },
      );
    }

    // Fetch caller's own record to get their promotedById
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, promotedById: true },
    });

    if (!caller) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    // Fetch target user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        techCenterId: true,
        previousTechCenterId: true,
        promotedById: true,
        teacherId: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the requested role
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // ── Role assignment restrictions ─────────────────────────────────────────

    // Never allow assigning the dev role through the UI — REMOVED.
    // dev can now promote users to dev, subject to ownership checks below.

    // Admin cannot promote to super_admin or dev
    if ((role.name === 'super_admin' || role.name === 'dev') && session.user.role === 'admin') {
      return NextResponse.json(
        { error: `Admins cannot assign the ${role.name === 'dev' ? 'Dev' : 'Super Admin'} role.` },
        { status: 403 },
      );
    }

    // super_admin cannot promote to dev
    if (role.name === 'dev' && session.user.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Super Admins cannot assign the Dev role.' },
        { status: 403 },
      );
    }

    // ── Ownership check ──────────────────────────────────────────────────────
    //
    // For super_admin and admin callers:
    //   • They can promote a non-elevated user to super_admin / admin
    //     IF the target's promotedById is null (fresh user, never promoted)
    //     OR if the target's promotedById === caller's id (re-assigning someone
    //     they already own).
    //   • They can demote / change an elevated user ONLY IF they are the one
    //     who promoted them.
    //
    // Special case for target who is currently super_admin:
    //   • admin cannot touch a super_admin at all
    //   • super_admin can only touch a super_admin they personally promoted
    // ─────────────────────────────────────────────────────────────────────────

    // ── Ownership checks (skipped for dev) ───────────────────────────────────
    if (session.user.role !== 'dev') {
      // Admins can never change a super_admin's role
      if (user.role?.name === 'super_admin' && session.user.role === 'admin') {
        return NextResponse.json(
          { error: "Admins cannot change a Super Admin's role." },
          { status: 403 },
        );
      }

      // super_admin → super_admin: ownership check
      if (user.role?.name === 'super_admin' && session.user.role === 'super_admin') {
        if (caller.promotedById && caller.promotedById === userId) {
          return NextResponse.json(
            { error: 'You cannot change the role of the Super Admin who promoted you.' },
            { status: 403 },
          );
        }
        if (user.promotedById !== session.user.id) {
          return NextResponse.json(
            { error: 'You can only demote Super Admins you personally promoted.' },
            { status: 403 },
          );
        }
      }

      // admin → admin: ownership check
      if (user.role?.name === 'admin' && session.user.role === 'admin') {
        if (caller.promotedById && caller.promotedById === userId) {
          return NextResponse.json(
            { error: 'You cannot change the role of the Admin who promoted you.' },
            { status: 403 },
          );
        }
        if (user.promotedById !== session.user.id) {
          return NextResponse.json(
            { error: 'You can only change the role of Admins you personally promoted.' },
            { status: 403 },
          );
        }
      }

      // super_admin touching any other role (admin, teacher, student) → free.
      // admin touching teacher/student → free (within their tech center scope).
    }

    // dev → dev: ownership check (a promoted dev cannot demote the dev who promoted them)
    if (session.user.role === 'dev' && user.role?.name === 'dev') {
      if (caller.promotedById && caller.promotedById === userId) {
        return NextResponse.json(
          { error: 'You cannot change the role of the Dev who promoted you.' },
          { status: 403 },
        );
      }
      if (user.promotedById !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only demote Devs you personally promoted.' },
          { status: 403 },
        );
      }
    }

    // ── Build update payload ─────────────────────────────────────────────────

    const updateData: {
      roleId: string;
      roleUpdatedAt: Date;
      promotedById?: string | null;
      techCenterId?: string | null;
      previousTechCenterId?: string | null;
      teacherId?: string | null;
    } = {
      roleId,
      roleUpdatedAt: new Date(), // triggers JWT token refresh on next request
    };

    // Record the promoter when elevating to dev, super_admin, or admin
    if (role.name === 'dev' || role.name === 'super_admin' || role.name === 'admin') {
      updateData.promotedById = session.user.id;
    } else {
      // Demoting / changing away from an elevated role — clear the promoter
      updateData.promotedById = null;
    }

    // Handle super_admin promotion — store previous tech center and clear current
    if (role.name === 'super_admin') {
      if (user.techCenterId) {
        updateData.previousTechCenterId = user.techCenterId;
      }
      updateData.techCenterId = null;
    }
    // Handle demotion from super_admin — restore previous tech center if available
    else if (user.role?.name === 'super_admin' && user.previousTechCenterId) {
      updateData.techCenterId = user.previousTechCenterId;
      updateData.previousTechCenterId = null;
    }

    // Clear teacherId when moving to teacher / admin / super_admin
    if (
      role.name === 'teacher' ||
      role.name === 'admin' ||
      role.name === 'super_admin'
    ) {
      updateData.teacherId = null;
    }

    // If user is moving away from teacher, clear their assigned students
    if (user.role?.name === 'teacher' && role.name !== 'teacher') {
      await prisma.user.updateMany({
        where: { teacherId: userId },
        data: { teacherId: null },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: true,
        techCenter: true,
      },
    });

    // Log the role change
    await logUserAction(
      session.user.id,
      'update',
      'user',
      userId,
      {
        targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`,
        oldRole: user.role?.name,
        newRole: role.name,
        action: 'change_role',
        promotedById: updateData.promotedById ?? null,
        techCenterCleared: role.name === 'super_admin' ? true : undefined,
        techCenterRestored:
          user.role?.name === 'super_admin' && user.previousTechCenterId
            ? true
            : undefined,
      },
      updatedUser.techCenterId || undefined,
    );

    let message = `User role changed from ${user.role?.name} to ${role.name}`;
    if (role.name === 'super_admin') {
      message +=
        ' — tech center cleared (previous stored for restoration)';
    } else if (
      user.role?.name === 'super_admin' &&
      user.previousTechCenterId
    ) {
      message += ' — previous tech center restored';
    }

    return NextResponse.json({ message, user: updatedUser });
  } catch (error) {
    console.error('Error changing user role:', error);
    return NextResponse.json(
      { error: 'Failed to change user role' },
      { status: 500 },
    );
  }
}
