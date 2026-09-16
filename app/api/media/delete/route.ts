// app/api/media/delete/route.ts
import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';

const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

export async function DELETE(request: Request) {
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
    const mediaId = typeof body?.mediaId === 'string' ? body.mediaId : '';

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: 'mediaId is required' },
        { status: 400 },
      );
    }

    const media = await prisma.media.findUnique({ where: { id: mediaId } });

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 },
      );
    }

    // Only the uploader may delete their own media
    if (media.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own media' },
        { status: 403 },
      );
    }

    const accountName = getRequiredEnv('AZURE_STORAGE_ACCOUNT_NAME');
    const accountKey = getRequiredEnv('AZURE_STORAGE_ACCOUNT_KEY');
    const containerName = getRequiredEnv('AZURE_STORAGE_CONTAINER_NAME');

    const serviceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new (await import('@azure/storage-blob')).StorageSharedKeyCredential(
        accountName,
        accountKey,
      ),
    );

    const containerClient = serviceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(media.blobName);

    try {
      await blobClient.deleteIfExists();
    } catch (azureError) {
      // Log but continue — we still want to remove the DB record
      console.error('Azure delete failed (continuing):', azureError);
    }

    await prisma.media.delete({ where: { id: mediaId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not delete media' },
      { status: 500 },
    );
  }
}