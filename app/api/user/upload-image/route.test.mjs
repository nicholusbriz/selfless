import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import { beforeEach, test } from 'node:test';

const load = createRequire(import.meta.url);
process.env.AZURE_STORAGE_ACCOUNT_NAME = 'testaccount';
process.env.AZURE_PROFILE_IMAGES_CONTAINER_NAME = 'profile-images';
const storage = load('@/lib/azure-storage');

const oldUrl = 'https://testaccount.blob.core.windows.net/profile-images/user-id/old.png';
const newUrl = 'https://testaccount.blob.core.windows.net/profile-images/user-id/new.png';
let currentUrl;
let existingImage;
let updateData;
let transactionFails;
let transactionDelay;
let uploadFails;
let activeReference;
let mediaReference;
let mediaToDelete;
let deletedBlobs;
let deletedRecords;

function stubModule(path, exports) {
  const id = load.resolve(path);
  const stub = new Module(id);
  stub.filename = id;
  stub.loaded = true;
  stub.exports = exports;
  load.cache[id] = stub;
}

stubModule('@/lib/auth/server', {
  requireAuth: async () => ({ id: 'user-id', role: { name: 'student' }, techCenterId: null }),
});
stubModule('@/lib/azure-storage', {
  ...storage,
  uploadProfileImage: async () => {
    if (uploadFails) throw new Error('upload failed');
    return newUrl;
  },
  deleteProfileImage: async (url) => { deletedBlobs.push(url); },
});
stubModule('@/app/api/media/_lib/interactions', {
  deleteMediaCommentsSafely: async () => [],
});
stubModule('@/lib/prisma/client', {
  prisma: {
    $transaction: async (operation, options) => {
      const start = Date.now();
      const result = await operation({
        user: {
          findUniqueOrThrow: async () => ({ profileImageUrl: currentUrl }),
          update: async ({ data }) => {
            if (transactionDelay) {
              await new Promise((resolve) => setTimeout(resolve, transactionDelay));
              if (Date.now() - start > (options?.timeout ?? 5000)) {
                throw new Error('transaction expired');
              }
            }
            updateData = data;
          },
        },
        media: { findFirst: async () => existingImage },
        activityLog: {
          create: async () => {
            if (transactionFails) throw new Error('transaction failed');
          },
        },
      });
      return result;
    },
    user: { findFirst: async () => activeReference },
    media: {
      findFirst: async () => mediaReference,
      findUnique: async () => mediaToDelete,
      delete: async () => { deletedRecords++; },
    },
    mediaLike: { deleteMany: async () => {} },
    mediaSave: { deleteMany: async () => {} },
  },
});

const { POST } = load('./route.ts');
const { DELETE } = load('../../media/delete/route.ts');

beforeEach(() => {
  currentUrl = oldUrl;
  existingImage = null;
  updateData = null;
  transactionFails = false;
  transactionDelay = 0;
  uploadFails = false;
  activeReference = null;
  mediaReference = null;
  deletedBlobs = [];
  deletedRecords = 0;
  mediaToDelete = {
    id: 'media-id',
    userId: 'user-id',
    publicUrl: oldUrl,
    blobName: 'user-id/old.png',
    containerName: 'profile-images',
    tags: [storage.ARCHIVED_PROFILE_IMAGE_TAG],
  };
});

function upload(type = 'image/png') {
  const form = new FormData();
  form.append('image', new File(['image'], 'new.png', { type }));
  return POST(new Request('http://localhost/api/user/upload-image', {
    method: 'POST',
    body: form,
  }));
}

function remove() {
  return DELETE(new Request('http://localhost/api/media/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaId: 'media-id' }),
  }));
}

test('changing an avatar archives the previous photo as an approved profile image', async () => {
  const response = await upload();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { imageUrl: newUrl, previousImagePreserved: true });
  assert.equal(updateData.profileImageUrl, newUrl);
  assert.equal(updateData.media.create.publicUrl, oldUrl);
  assert.equal(updateData.media.create.blobName, 'user-id/old.png');
  assert.equal(updateData.media.create.containerName, 'profile-images');
  assert.equal(updateData.media.create.category, 'profile');
  assert.equal(updateData.media.create.approvalStatus, 'APPROVED');
  assert.deepEqual(deletedBlobs, []);
});

test('preserves the previous image when database work exceeds five seconds', async () => {
  transactionDelay = 5300;
  const response = await upload();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).previousImagePreserved, true);
  assert.equal(updateData.media.create.publicUrl, oldUrl);
});

test('first upload and an existing approved gallery image do not create duplicates', async () => {
  currentUrl = null;
  let response = await upload();
  assert.equal((await response.json()).previousImagePreserved, false);
  assert.equal(updateData.media, undefined);

  currentUrl = oldUrl;
  existingImage = { id: 'existing' };
  response = await upload();
  assert.equal((await response.json()).previousImagePreserved, true);
  assert.equal(updateData.media, undefined);
});

test('external avatars are retained as references and not mistaken for owned blobs', async () => {
  currentUrl = 'https://example.test/portrait';
  const response = await upload();
  assert.equal(response.status, 200);
  assert.equal(updateData.media.create.publicUrl, currentUrl);
  assert.equal(updateData.media.create.containerName, storage.EXTERNAL_PROFILE_IMAGE_CONTAINER);
  assert.equal(storage.getOwnedProfileImageBlobName(oldUrl, 'other-user'), null);
  assert.equal(storage.getOwnedProfileImageBlobName('https://example.test/profile-images/user-id/old.png', 'user-id'), null);
});

test('failed database update cleans up the new image only if it is unreferenced', async () => {
  transactionFails = true;
  let response = await upload();
  assert.equal(response.status, 500);
  assert.deepEqual(deletedBlobs, [newUrl]);

  deletedBlobs = [];
  activeReference = { id: 'user-id' };
  response = await upload();
  assert.equal(response.status, 500);
  assert.deepEqual(deletedBlobs, []);
});

test('a failed upload leaves the previous avatar untouched', async () => {
  uploadFails = true;
  const response = await upload();
  assert.equal(response.status, 500);
  assert.equal(updateData, null);
  assert.deepEqual(deletedBlobs, []);
});

test('deleting an archived photo preserves referenced or external images', async () => {
  let response = await remove();
  assert.equal(response.status, 200);
  assert.deepEqual(deletedBlobs, [oldUrl]);
  assert.equal(deletedRecords, 1);

  deletedBlobs = [];
  activeReference = { id: 'user-id' };
  response = await remove();
  assert.equal(response.status, 200);
  assert.deepEqual(deletedBlobs, []);

  activeReference = null;
  mediaReference = { id: 'other-media' };
  response = await remove();
  assert.equal(response.status, 200);
  assert.deepEqual(deletedBlobs, []);

  mediaToDelete.containerName = storage.EXTERNAL_PROFILE_IMAGE_CONTAINER;
  mediaToDelete.publicUrl = 'https://example.test/portrait';
  mediaToDelete.tags.push(storage.EXTERNAL_PROFILE_IMAGE_TAG);
  mediaReference = null;
  response = await remove();
  assert.equal(response.status, 200);
  assert.deepEqual(deletedBlobs, []);
});

test('an archived image with an invalid storage location is not deleted', async () => {
  mediaToDelete.publicUrl = 'https://example.test/portrait';
  const response = await remove();
  assert.equal(response.status, 500);
  assert.deepEqual(deletedBlobs, []);
  assert.equal(deletedRecords, 0);
});

test('invalid file types do not change the avatar', async () => {
  const response = await upload('video/mp4');
  assert.equal(response.status, 400);
  assert.equal(updateData, null);
});
