import { NextResponse } from 'next/server';
import {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { requireAuth } from '@/lib/auth/server';

export const runtime = 'nodejs';

const ALLOWED_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);

const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

const safeExtension = (fileName: string, contentType: string) => {
  const extension = fileName
    .split('.')
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (extension && extension.length <= 8) return extension;
  return (
    contentType.split('/')[1]?.replace(/[^a-z0-9]/g, '') || 'bin'
  );
};

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const fileName = typeof body?.fileName === 'string' ? body.fileName : '';
    const contentType =
      typeof body?.contentType === 'string' ? body.contentType : '';

    if (!fileName || !contentType) {
      return NextResponse.json(
        { success: false, error: 'fileName and contentType are required' },
        { status: 400 },
      );
    }

    if (!ALLOWED_MEDIA_TYPES.has(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Only supported image, audio, and video files are allowed',
        },
        { status: 415 },
      );
    }

    const accountName = getRequiredEnv('AZURE_STORAGE_ACCOUNT_NAME');
    const accountKey = getRequiredEnv('AZURE_STORAGE_ACCOUNT_KEY');
    const containerName = getRequiredEnv('AZURE_STORAGE_CONTAINER_NAME');

    const extension = safeExtension(fileName, contentType);
    const blobName = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    );

    // Token valid for 15 minutes, create + write only
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.valueOf() + 15 * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cw'),
        startsOn,
        expiresOn,
        contentType,
      },
      sharedKeyCredential,
    ).toString();

    const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    const publicUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      blobName,
      contentType,
    });
  } catch (error) {
    console.error('SAS generation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not prepare upload' },
      { status: 500 },
    );
  }
}