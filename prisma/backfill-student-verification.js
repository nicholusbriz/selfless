import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const expectedAccounts = [
  { firstName: 'AARON', lastName: 'KABUGO', role: 'student' },
  { firstName: 'Erjok', lastName: 'Agot', role: 'student' },
  { firstName: 'Rwotomiyo', lastName: 'Isaiah', role: 'student' },
  { firstName: 'Reese', lastName: 'James', role: 'student' },
  { firstName: 'Tracy', lastName: 'Nalubwama', role: 'student' },
  { firstName: 'Ben', lastName: 'Mark', role: 'teacher' },
  { firstName: 'Developer', lastName: 'Account', role: 'admin' },
  { firstName: 'Doddo ', lastName: 'Arnold', role: 'admin' },
  { firstName: 'Nabawanda', lastName: 'MARBLE', role: 'student' },
  { firstName: 'Samuel', lastName: 'Bitum', role: 'teacher' },
];

function getRawId(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.toHexString === 'function') return value.toHexString();
  if (typeof value?.$oid === 'string') return value.$oid;
  throw new Error('Could not read a user ID from MongoDB diagnostic result.');
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ');
}

async function main() {
  const rawAffected = await prisma.user.findRaw({
    filter: {
      $and: [
        {
          $or: [
            { techCenterId: { $exists: true, $ne: null } },
            { previousTechCenterId: { $exists: true, $ne: null } },
          ],
        },
        {
          $or: [
            { isVerified: { $exists: false } },
            { verificationStatus: { $exists: false } },
          ],
        },
      ],
    },
  });
  const affectedIds = rawAffected.map((raw) => getRawId(raw._id));
  const affectedUsers = affectedIds.length
    ? await prisma.user.findMany({
        where: { id: { in: affectedIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: { select: { name: true } },
        },
      })
    : [];
  const excludedSteven = affectedUsers.filter(
    (user) =>
      user.firstName.trim() === 'Steven' &&
      user.lastName.trim() === 'Ssebuma' &&
      user.role?.name === 'super_admin',
  );
  if (excludedSteven.length !== 1) {
    throw new Error(
      `Safety check failed. Expected to find exactly one Steven Ssebuma super_admin to exclude, found ${excludedSteven.length}. No data was changed.`,
    );
  }

  const updateUsers = affectedUsers.filter(
    (user) => user.id !== excludedSteven[0].id,
  );
  const updateIds = updateUsers.map((user) => user.id);
  const updateRaw = rawAffected.filter((raw) =>
    updateIds.includes(getRawId(raw._id)),
  );
  const actualAccounts = updateUsers.map((user) => ({
    firstName: normalizeName(user.firstName),
    lastName: normalizeName(user.lastName),
    role: user.role?.name ?? null,
  }));
  const sortKey = (account) =>
    `${account.role}|${normalizeName(account.firstName)}|${normalizeName(account.lastName)}`;
  const expectedKeys = expectedAccounts.map(sortKey).sort();
  const actualKeys = actualAccounts.map(sortKey).sort();

  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    throw new Error(
      `Safety check failed. Expected ${expectedKeys.length} affected accounts excluding Steven, found ${actualKeys.length}. No data was changed. Current matches: ${JSON.stringify(actualAccounts)}`,
    );
  }

  const updateResult = await prisma.user.updateMany({
    where: { id: { in: updateIds } },
    data: {
      isVerified: true,
      verificationStatus: 'APPROVED',
    },
  });

  if (updateResult.count !== expectedAccounts.length) {
    throw new Error(
      `Expected to update ${expectedAccounts.length} accounts, but Prisma reported ${updateResult.count}.`,
    );
  }

  const rawVerification = await prisma.user.findRaw({
    filter: {
      _id: { $in: updateRaw.map((raw) => raw._id) },
    },
  });
  const notPersisted = rawVerification.filter(
    (raw) => raw.isVerified !== true || raw.verificationStatus !== 'APPROVED',
  );
  if (notPersisted.length > 0) {
    throw new Error(
      `Verification failed: ${notPersisted.length} updated records do not contain the expected stored values.`,
    );
  }

  console.log(
    JSON.stringify(
      {
        updatedCount: updateResult.count,
        persistedVerificationValues: {
          isVerified: true,
          verificationStatus: 'APPROVED',
        },
        excluded: {
          firstName: excludedSteven[0].firstName,
          lastName: excludedSteven[0].lastName,
          role: excludedSteven[0].role?.name,
        },
        updatedAccounts: actualAccounts.map(
          ({ firstName, lastName, role }) => ({
            name: `${firstName} ${lastName}`.trim(),
            role,
          }),
        ),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error('Failed to backfill student verification fields:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
