// app/api/media/approve/[mediaId]/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { createNotificationForUser } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { mediaId } = await params;

    // Only dev and super_admin can approve posts
    if (
      currentUser.role?.name !== 'dev' &&
      currentUser.role?.name !== 'super_admin'
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Dev or Super Admin role required' },
        { status: 403 }
      );
    }

    // Check if media exists
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { user: true },
    });

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    // Approve the media
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedById: currentUser.id,
      },
    });

    // Create notification for the post creator
    const approverName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    try {
      await createNotificationForUser({
        userId: media.userId,
        title: 'Your post has been approved',
        message: `Your post "${media.title}" has been approved by ${approverName}.`,
        type: 'media_approved',
        link: `/dashboard/gallery#${mediaId}`,
        generatedBy: currentUser.id,
        entityType: 'media',
        entityId: mediaId,
      });
    } catch (notificationError) {
      console.error('Failed to notify user about approval:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Media approved successfully',
      media: updatedMedia,
    });
  } catch (error) {
    console.error('Media approval failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve media' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { mediaId } = await params;

    // Only dev and super_admin can reject posts
    if (
      currentUser.role?.name !== 'dev' &&
      currentUser.role?.name !== 'super_admin'
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Dev or Super Admin role required' },
        { status: 403 }
      );
    }

    // Check if media exists
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    // Reject the media
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        approvalStatus: 'REJECTED',
        approvedAt: null,
        approvedById: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Media rejected successfully',
      media: updatedMedia,
    });
  } catch (error) {
    console.error('Media rejection failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject media' },
      { status: 500 }
    );
  }
}
