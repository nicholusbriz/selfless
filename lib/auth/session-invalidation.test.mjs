import assert from 'node:assert/strict';
import test from 'node:test';
import { invalidateUserSessions } from './session-invalidation.ts';

const initialUsers = [
  { id: 'student', roleId: 'student-role', techCenterId: 'center-a', isActive: true, tokenVersion: 4 },
  { id: 'manager', roleId: 'manager-role', techCenterId: 'center-b', isActive: true, tokenVersion: 2 },
  { id: 'dev', roleId: 'dev-role', techCenterId: 'center-a', isActive: true, tokenVersion: 7 },
  { id: 'inactive', roleId: 'student-role', techCenterId: 'center-a', isActive: false, tokenVersion: 1 },
];

function createClient(users) {
  return {
    role: {
      findUnique: async () => ({ id: 'dev-role' }),
    },
    user: {
      updateMany: async ({ where, data }) => {
        let count = 0;
        for (const user of users) {
          const excludedRoleId = where.NOT?.roleId;
          if (
            user.isActive === where.isActive &&
            (!where.techCenterId || user.techCenterId === where.techCenterId) &&
            (!excludedRoleId || user.roleId !== excludedRoleId)
          ) {
            user.tokenVersion += data.tokenVersion.increment;
            count += 1;
          }
        }
        return { count };
      },
    },
  };
}

test('invalidating all sessions increments active non-Dev token versions only', async () => {
  const users = structuredClone(initialUsers);
  const count = await invalidateUserSessions(createClient(users), null);

  assert.equal(count.count, 2);
  assert.equal(users.find((user) => user.id === 'student').tokenVersion, 5);
  assert.equal(users.find((user) => user.id === 'manager').tokenVersion, 3);
  assert.equal(users.find((user) => user.id === 'dev').tokenVersion, 7);
  assert.equal(users.find((user) => user.id === 'inactive').tokenVersion, 1);
});

test('invalidating one tech center affects only its active non-Dev users', async () => {
  const users = structuredClone(initialUsers);
  const count = await invalidateUserSessions(createClient(users), 'center-a');

  assert.equal(count.count, 1);
  assert.equal(users.find((user) => user.id === 'student').tokenVersion, 5);
  assert.equal(users.find((user) => user.id === 'manager').tokenVersion, 2);
  assert.equal(users.find((user) => user.id === 'dev').tokenVersion, 7);
  assert.equal(users.find((user) => user.id === 'inactive').tokenVersion, 1);
});
