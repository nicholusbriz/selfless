// app/api/admin/approve-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    // ----------------------------------------------------------
    // AUTH
    // ----------------------------------------------------------
    const adminUser = await requireAuth();

    if (
      !adminUser ||
      (adminUser.role?.name !== 'admin' &&
        adminUser.role?.name !== 'super_admin' &&
        adminUser.role?.name !== 'dev')
    ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // ----------------------------------------------------------
    // PARSE BODY (with diagnostics)
    // ----------------------------------------------------------
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      console.error('[approve-user] Failed to parse JSON body');
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const rawUserId =
      typeof body === 'object' && body !== null
        ? (body as { userId?: unknown }).userId
        : undefined;

    const rawAction =
      typeof body === 'object' && body !== null
        ? (body as { action?: unknown }).action
        : undefined;

    // Log exactly what was received so we can debug 400s
    console.log('[approve-user] Received body:', {
      userId: rawUserId,
      action: rawAction,
      rawBody: body,
    });

    const userId =
      typeof rawUserId === 'string' ? rawUserId.trim() : '';

    const action =
      typeof rawAction === 'string'
        ? rawAction.trim().toLowerCase()
        : '';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing or invalid userId in request body.' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        {
          error: `Invalid action "${rawAction}". Must be "approve" or "reject".`,
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // FIND TARGET USER
    // ----------------------------------------------------------
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { techCenter: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ----------------------------------------------------------
    // PERMISSION CHECK
    // ----------------------------------------------------------
    if (adminUser.role?.name === 'admin' && adminUser.techCenterId) {
      if (targetUser.techCenterId !== adminUser.techCenterId) {
        return NextResponse.json(
          { error: 'You can only manage users from your own tech center' },
          { status: 403 }
        );
      }
    }

    // ==========================================================
    // APPROVE
    // ==========================================================
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          verifiedById: adminUser.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User approved successfully',
        user: {
          id: targetUser.id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          email: targetUser.email,
        },
      });
    }

    // ==========================================================
    // REJECT
    // ==========================================================
    if (action === 'reject') {
      if (
        targetUser.isVerified === true ||
        targetUser.verificationStatus === 'APPROVED'
      ) {
        return NextResponse.json(
          {
            error:
              'Cannot reject an already-approved user. Suspend or disable the account instead.',
          },
          { status: 409 }
        );
      }

      // Clean up pending-user artifacts, then delete
      await prisma.$transaction([
        prisma.activityLog.deleteMany({ where: { userId } }),
        prisma.notification.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'User rejected and account deleted successfully',
        user: {
          id: targetUser.id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          email: targetUser.email,
        },
      });
    }

    // Unreachable, but TypeScript wants it
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[approve-user] Approve user error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2014'
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot delete this user because they have related records. Please contact a developer.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}