// app/api/admin/users/[userId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logUserAction } from '@/lib/logger';

// PATCH - Update user status
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
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 },
      );
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, INACTIVE, or SUSPENDED' },
        { status: 400 },
      );
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own status' },
        { status: 400 },
      );
    }

    // Fetch caller's own promotedById so we can block them from touching
    // the person who promoted them.
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { promotedById: true },
    });

    // Fetch target
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        techCenterId: true,
        promotedById: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ── Ownership checks (skipped for dev) ───────────────────────────────────
    if (session.user.role !== 'dev') {
      // admin cannot touch a super_admin's status at all
      if (user.role?.name === 'super_admin' && session.user.role === 'admin') {
        return NextResponse.json(
          { error: "Admins cannot change a Super Admin's status." },
          { status: 403 },
        );
      }

      // super_admin → super_admin: ownership check
      // Can only change status of a super_admin they personally promoted,
      // and cannot touch the one who promoted them.
      if (user.role?.name === 'super_admin' && session.user.role === 'super_admin') {
        if (caller?.promotedById && caller.promotedById === userId) {
          return NextResponse.json(
            { error: 'You cannot change the status of the Super Admin who promoted you.' },
            { status: 403 },
          );
        }
        if (user.promotedById !== session.user.id) {
          return NextResponse.json(
            { error: 'You can only change the status of Super Admins you personally promoted.' },
            { status: 403 },
          );
        }
      }

      // admin → admin: ownership check
      // Can only change status of an admin they personally promoted,
      // and cannot touch the one who promoted them.
      if (user.role?.name === 'admin' && session.user.role === 'admin') {
        if (caller?.promotedById && caller.promotedById === userId) {
          return NextResponse.json(
            { error: 'You cannot change the status of the Admin who promoted you.' },
            { status: 403 },
          );
        }
        if (user.promotedById !== session.user.id) {
          return NextResponse.json(
            { error: 'You can only change the status of Admins you personally promoted.' },
            { status: 403 },
          );
        }
      }

      // super_admin touching admin/teacher/student → free, no restriction.
      // admin touching teacher/student → free within their tech center scope.
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      include: { role: true, techCenter: true },
    });

    await logUserAction(
      session.user.id,
      'update',
      'user',
      userId,
      {
        targetUser: `${updatedUser.firstName} ${updatedUser.lastName}`,
        oldStatus: user.status,
        newStatus: status,
        action: 'change_status',
      },
      updatedUser.techCenterId || undefined,
    );

    return NextResponse.json({
      message: `User status changed from ${user.status} to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error changing user status:', error);
    return NextResponse.json(
      { error: 'Failed to change user status' },
      { status: 500 },
    );
  }
}
