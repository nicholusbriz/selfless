import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import { beforeEach, test } from 'node:test';

const load = createRequire(import.meta.url);
let created;
let parentLookup;
let parentExists;
let requestedPreviousCenterIds;

function stubModule(path, exports) {
  const id = load.resolve(path);
  const stub = new Module(id);
  stub.filename = id;
  stub.loaded = true;
  stub.exports = exports;
  load.cache[id] = stub;
}

stubModule('next-auth', {
  getServerSession: async () => ({ user: { id: 'user-id' } }),
});
stubModule('@/lib/auth/nextauth', { authOptions: {} });
stubModule('@/lib/prisma/client', {
  prisma: {
    user: {
      findUnique: async () => ({ techCenterId: 'center-id' }),
    },
    announcement: {
      findFirst: async () => ({ id: 'announcement-id' }),
    },
    announcementComment: {
      findFirst: async ({ where }) => {
        parentLookup = where;
        return parentExists ? { id: where.id } : null;
      },
      create: async ({ data }) => {
        created = data;
        return {
          id: 'comment-id',
          ...data,
          author: {
            role: { name: 'super_admin', displayName: 'Director' },
            techCenter: null,
            previousTechCenterId: 'previous-center-id',
          },
        };
      },
    },
    techCenter: {
      findMany: async ({ where }) => {
        requestedPreviousCenterIds = where.id.in;
        return [{ id: 'previous-center-id', name: 'Previous Center' }];
      },
    },
  },
});

const { POST } = load('./route.ts');
const context = { params: Promise.resolve({ announcementId: 'announcement-id' }) };

beforeEach(() => {
  created = null;
  parentLookup = null;
  parentExists = true;
  requestedPreviousCenterIds = null;
});

function post(body) {
  return POST(new Request('http://localhost/api/announcements/announcement-id/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), context);
}

test('creates top-level comments with a null or omitted parent', async () => {
  for (const body of [{ content: '  Hello  ', parentId: null }, { content: '  Hello  ' }]) {
    const response = await post(body);
    assert.equal(response.status, 201);
    assert.deepEqual(created, {
      announcementId: 'announcement-id',
      authorId: 'user-id',
      parentId: null,
      content: 'Hello',
    });
    assert.equal(parentLookup, null);
    assert.deepEqual(requestedPreviousCenterIds, ['previous-center-id']);
    assert.equal((await response.json()).comment.author.techCenter.name, 'Previous Center');
  }
});

test('validates reply targets within the announcement', async () => {
  let response = await post({ content: 'Reply', parentId: 'parent-id' });
  assert.equal(response.status, 201);
  assert.deepEqual(parentLookup, { id: 'parent-id', announcementId: 'announcement-id' });
  assert.equal(created.parentId, 'parent-id');

  parentExists = false;
  created = null;
  response = await post({ content: 'Reply', parentId: 'other-parent' });
  assert.equal(response.status, 404);
  assert.equal(created, null);
});

test('rejects invalid parent IDs and empty comments', async () => {
  let response = await post({ content: 'Hello', parentId: 123 });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'Invalid request body');
  response = await post({ content: '   ', parentId: null });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'Comment content is required');
  assert.equal(created, null);
});
