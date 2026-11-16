import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import {
  deleteProfileImage,
  getOwnedProfileImageBlobName,
  PROFILE_IMAGES_CONTAINER,
} from '@/lib/azure-storage';

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 },
      );
    }

    // Cannot delete the current profile image
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImageUrl: true, profileImageUrls: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    if (currentUser.profileImageUrl === imageUrl) {
      return NextResponse.json(
        { error: 'Cannot delete your current profile image. Upload a new one first.' },
        { status: 400 },
      );
    }

    // Remove from the array
    const updatedUrls = (currentUser.profileImageUrls || []).filter(
      (url) => url !== imageUrl
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrls: updatedUrls },
    });

    // Delete from Azure Blob Storage if it's an owned image
    const blobName = getOwnedProfileImageBlobName(imageUrl, user.id);
    if (blobName) {
      try {
        await deleteProfileImage(imageUrl);
      } catch (error) {
        console.error('[delete-profile-image] Failed to delete from Azure:', error);
        // Continue even if Azure deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[delete-profile-image] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete profile image' },
      { status: 500 },
    );
  }
}
