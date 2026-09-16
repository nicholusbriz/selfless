import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const {
      blobName,
      publicUrl,
      fileName,
      contentType,
      size,
      title,
      description,
      category,
    } = body ?? {};

    if (!blobName || !publicUrl || !title) {
      return NextResponse.json(
        { success: false, error: 'blobName, publicUrl, and title are required' },
        { status: 400 },
      );
    }

    // Safety: only allow saving blobs that belong to this user
    if (!blobName.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { success: false, error: 'You cannot save this file' },
        { status: 403 },
      );
    }

    const ext = fileName?.split('.').pop()?.toLowerCase() ?? null;

    const media = await prisma.media.create({
      data: {
        userId: user.id,
        blobName,
        publicUrl,
        containerName: 'media',
        contentType: contentType ?? 'application/octet-stream',
        size: Number(size) || 0,
        fileExtension: ext,
        title: String(title).slice(0, 120),
        description: description ? String(description).slice(0, 500) : null,
        category: category ? String(category) : 'gallery',
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Save media failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not save media' },
      { status: 500 },
    );
  }
}