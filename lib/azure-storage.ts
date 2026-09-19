/**
 * lib/azure-storage.ts
 *
 * Azure Blob Storage helpers for profile images.
 * Drop-in replacement for the equivalent functions in lib/supabase.ts.
 *
 * Environment variables required (server-side only – no NEXT_PUBLIC_ prefix):
 *   AZURE_STORAGE_ACCOUNT_NAME
 *   AZURE_STORAGE_ACCOUNT_KEY
 *   AZURE_STORAGE_CONTAINER_NAME   (defaults to "profile-images")
 */

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobDeleteIfExistsResponse,
} from '@azure/storage-blob';

// ─── Configuration ────────────────────────────────────────────────────────────

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const ACCOUNT_KEY  = process.env.AZURE_STORAGE_ACCOUNT_KEY!;

/** Container used exclusively for profile images. */
const PROFILE_IMAGES_CONTAINER =
  process.env.AZURE_PROFILE_IMAGES_CONTAINER_NAME ?? 'profile-images';

// ─── Client factory ───────────────────────────────────────────────────────────

function getBlobServiceClient(): BlobServiceClient {
  if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
    throw new Error(
      'Missing Azure Storage credentials. ' +
      'Set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY.',
    );
  }

  const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
  return new BlobServiceClient(
    `https://${ACCOUNT_NAME}.blob.core.windows.net`,
    credential,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives the blob name from a full Azure Blob URL.
 *
 * E.g. https://account.blob.core.windows.net/profile-images/abc/avatar.jpg
 *   → "abc/avatar.jpg"
 */
function blobNameFromUrl(imageUrl: string): string {
  const url = new URL(imageUrl);
  // pathname = /<container>/<blobName…>
  const withoutContainer = url.pathname
    .split('/')
    .slice(2) // remove leading '' and container segment
    .join('/');
  return decodeURIComponent(withoutContainer);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a profile image for a user and return its public URL.
 *
 * @param file     - The File object selected by the user.
 * @param userId   - Used to namespace the blob: `{userId}/avatar.{ext}`.
 * @returns        - Full public URL of the uploaded blob.
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
): Promise<string> {
  const ext      = file.name.split('.').pop() ?? 'jpg';
  // Include a timestamp so browsers don't serve a stale cached version
  // after the user replaces their avatar.
  const blobName = `${userId}/avatar-${Date.now()}.${ext}`;

  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(PROFILE_IMAGES_CONTAINER);

  // Create the container if it does not exist yet (idempotent).
  await containerClient.createIfNotExists({ access: 'blob' });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const arrayBuffer = await file.arrayBuffer();
  await blockBlobClient.uploadData(arrayBuffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  });

  return blockBlobClient.url;
}

/**
 * Delete a profile image given its full Azure Blob URL.
 * Safe to call when the URL is empty/invalid — the error is swallowed after logging.
 *
 * @param imageUrl - The full URL previously returned by uploadProfileImage.
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    const blobName = blobNameFromUrl(imageUrl);

    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(PROFILE_IMAGES_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const result: BlobDeleteIfExistsResponse =
      await blockBlobClient.deleteIfExists({ deleteSnapshots: 'include' });

    if (!result.succeeded) {
      console.warn(
        `[azure-storage] Blob not found or already deleted: ${blobName}`,
      );
    }
  } catch (error) {
    console.error('[azure-storage] Error deleting profile image:', error);
    throw error;
  }
}

/**
 * Delete ALL profile image blobs for a given user (useful when deleting
 * a user account to avoid leaving orphaned blobs).
 *
 * @param userId - The user whose blobs should be removed.
 */
export async function deleteAllProfileImagesForUser(
  userId: string,
): Promise<void> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(PROFILE_IMAGES_CONTAINER);

  for await (const blob of containerClient.listBlobsFlat({
    prefix: `${userId}/`,
  })) {
    await containerClient.deleteBlob(blob.name, {
      deleteSnapshots: 'include',
    });
  }
}
