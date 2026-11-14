/**
 * POST /api/user/upload-image
 *
 * Receives a multipart/form-data upload with a single field "image".
 * Uploads the new image and preserves the previous image in the profile gallery.
 *
 * Authentication: NextAuth session (any authenticated user can update
 * their own image — no extra role check needed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import {
  uploadProfileImage,
  deleteProfileImage,
  getOwnedProfileImageBlobName,
  PROFILE_IMAGES_CONTAINER,
  EXTERNAL_PROFILE_IMAGE_CONTAINER,
  ARCHIVED_PROFILE_IMAGE_TAG,
  EXTERNAL_PROFILE_IMAGE_TAG,
} from '@/lib/azure-storage';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const user = await requireAuth();

    // 2. Parse multipart body
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided. Send the file under the "image" field.' },
        { status: 400 },
      );
    }

    // 3. Validate type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.` },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5 MB.' },
        { status: 400 },
      );
    }

    // Upload first so a failed upload cannot affect the current image.
    const imageUrl = await uploadProfileImage(file, user.id);

    let previousImagePreserved: boolean;
    try {
      previousImagePreserved = await prisma.$transaction(async (tx) => {
        const currentUser = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
          select: { profileImageUrl: true },
        });
        const oldImageUrl = currentUser.profileImageUrl;
        const existingImage = oldImageUrl
          ? await tx.media.findFirst({
              where: {
                userId: user.id,
                publicUrl: oldImageUrl,
                category: 'profile',
                approvalStatus: 'APPROVED',
                isActive: true,
                isDeleted: false,
              },
              select: { id: true },
            })
          : null;
        const oldBlobName = oldImageUrl
          ? getOwnedProfileImageBlobName(oldImageUrl, user.id)
          : null;

        await tx.user.update({
          where: { id: user.id },
          data: {
            profileImageUrl: imageUrl,
            ...(oldImageUrl && !existingImage && {
              media: {
                create: {
                  blobName: oldBlobName ?? `external/${crypto.randomUUID()}`,
                  publicUrl: oldImageUrl,
                  containerName: oldBlobName ? PROFILE_IMAGES_CONTAINER : EXTERNAL_PROFILE_IMAGE_CONTAINER,
                  contentType: 'image/unknown',
                  size: 0,
                  title: 'Previous profile photo',
                  category: 'profile',
                  tags: oldBlobName
                    ? [ARCHIVED_PROFILE_IMAGE_TAG]
                    : [ARCHIVED_PROFILE_IMAGE_TAG, EXTERNAL_PROFILE_IMAGE_TAG],
                  approvalStatus: 'APPROVED',
                  approvedAt: new Date(),
                },
              },
            }),
          },
        });

        await tx.activityLog.create({
          data: {
            userId: user.id,
            action: 'update_profile_image',
            entityType: 'user',
            entityId: user.id,
            details: { imageUrl },
            techCenterId: user.techCenterId ?? undefined,
          },
        });
        return Boolean(oldImageUrl);
      });
    } catch (error) {
      try {
        const [currentAvatar, archivedImage] = await Promise.all([
          prisma.user.findFirst({
            where: { profileImageUrl: imageUrl },
            select: { id: true },
          }),
          prisma.media.findFirst({
            where: { publicUrl: imageUrl },
            select: { id: true },
          }),
        ]);
        if (!currentAvatar && !archivedImage) {
          await deleteProfileImage(imageUrl);
        }
      } catch (cleanupError) {
        console.error('[upload-image] Could not clean up the new image:', cleanupError);
      }
      throw error;
    }

    return NextResponse.json({ imageUrl, previousImagePreserved });
  } catch (error: unknown) {
    console.error('[upload-image] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to upload profile image.' },
      { status: 500 },
    );
  }
}
