/**
 * POST /api/user/upload-image
 *
 * Receives a multipart/form-data upload with a single field "image".
 * Deletes the user's previous profile image from Azure if one exists,
 * uploads the new one, saves the URL to the database, and returns it.
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

    // 4. Delete the old image first (non-fatal if it fails)
    if (user.profileImageUrl) {
      try {
        await deleteProfileImage(user.profileImageUrl);
      } catch (deleteErr) {
        console.warn(
          '[upload-image] Could not delete old profile image — continuing:',
          deleteErr,
        );
      }
    }

    // 5. Upload to Azure Blob Storage
    const imageUrl = await uploadProfileImage(file, user.id);

    // 6. Persist the new URL in the database
    await prisma.user.update({
      where: { id: user.id },
      data:  { profileImageUrl: imageUrl },
    });

    // 7. Log the action
    await prisma.activityLog.create({
      data: {
        userId:      user.id,
        action:      'update_profile_image',
        entityType:  'user',
        entityId:    user.id,
        details:     { imageUrl },
        techCenterId: user.techCenterId ?? undefined,
      },
    });

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('[upload-image] Error:', error);

    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to upload profile image.' },
      { status: 500 },
    );
  }
}
