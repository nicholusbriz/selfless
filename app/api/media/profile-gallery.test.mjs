import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import test from 'node:test';

const load = createRequire(import.meta.url);
let role = 'student';
let created;
let listWhere;
let profileWhere;
let approvalNotice;

function stubModule(path, exports) {
  const id = load.resolve(path);
  const stub = new Module(id);
  stub.filename = id;
  stub.loaded = true;
  stub.exports = exports;
  load.cache[id] = stub;
}

stubModule('@/lib/auth/server', {
  requireAuth: async () => ({
    id: 'user-id',
    firstName: 'Test',
    lastName: 'User',
    role: { name: role },
  }),
});
stubModule('@/lib/prisma/client', {
  prisma: {
    media: {
      create: async ({ data }) => {
        created = data;
        return { id: 'media-id', ...data };
      },
      findMany: async ({ where }) => {
        if (where.userId && where.contentType) profileWhere = where;
        else listWhere = where;
        return [];
      },
      findUnique: async () => ({ id: 'media-id', userId: 'user-id', title: 'Photo', category: 'profile' }),
      update: async () => ({ id: 'media-id' }),
    },
    user: {
      findUnique: async () => ({ id: 'user-id', role: null, submittedCourses: [] }),
    },
  },
});
stubModule('@/lib/notifications', {
  createNotificationForDevs: async () => {},
  createNotificationForUser: async (notice) => { approvalNotice = notice; },
});

const { POST } = load('./save/route.ts');
const { GET: listMedia } = load('./list/route.ts');
const { GET: getStudent } = load('../students/[studentId]/route.ts');
const { POST: approveMedia } = load('./approve/[mediaId]/route.ts');

function save(category, contentType = 'image/jpeg') {
  return POST(new Request('http://localhost/api/media/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blobName: 'user-id/photo.jpg',
      publicUrl: 'https://example.com/photo.jpg',
      title: 'Photo',
      contentType,
      category,
    }),
  }));
}

test('profile uploads stay separate from community posts for all roles', async () => {
  for (const userRole of ['student', 'dev', 'super_admin']) {
    role = userRole;
    const response = await save('profile');
    assert.equal(response.status, 200);
    assert.equal(created.category, 'profile');
    assert.equal(created.approvalStatus, userRole === 'student' ? 'PENDING' : 'APPROVED');
  }

  role = 'student';
  await save('gallery');
  assert.equal(created.category, 'gallery');
  await save('dashboard');
  assert.equal(created.category, 'gallery');
  role = 'dev';
  await save('dashboard');
  assert.equal(created.category, 'dashboard');
});

test('profile gallery rejects non-images', async () => {
  role = 'student';
  const response = await save('profile', 'video/mp4');
  assert.equal(response.status, 400);
});

test('community feed and public profile query different categories', async () => {
  role = 'student';
  const response = await listMedia(new Request('http://localhost/api/media/list?category=gallery'));
  assert.equal(response.status, 200);
  assert.equal(listWhere.category, 'gallery');
  assert.equal(listWhere.approvalStatus, 'APPROVED');

  const ownResponse = await listMedia(new Request('http://localhost/api/media/list?category=profile&mine=true'));
  assert.equal(ownResponse.status, 200);
  assert.equal(listWhere.category, 'profile');
  assert.equal(listWhere.userId, 'user-id');
  assert.equal(listWhere.approvalStatus, undefined);

  const profileResponse = await getStudent(
    new Request('http://localhost/api/students/user-id'),
    { params: Promise.resolve({ studentId: 'user-id' }) },
  );
  assert.equal(profileResponse.status, 200);
  assert.deepEqual(profileWhere, {
    userId: 'user-id',
    category: 'profile',
    contentType: { startsWith: 'image/' },
    approvalStatus: 'APPROVED',
    isActive: true,
    isDeleted: false,
  });
});

test('approval notifications link to the profile gallery', async () => {
  role = 'dev';
  const response = await approveMedia(
    new Request('http://localhost/api/media/approve/media-id', { method: 'POST' }),
    { params: Promise.resolve({ mediaId: 'media-id' }) },
  );
  assert.equal(response.status, 200);
  assert.equal(approvalNotice.link, '/dashboard/profile#profile-gallery');
});
