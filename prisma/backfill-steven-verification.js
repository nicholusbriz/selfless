import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeObjectId(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.toHexString === 'function') return value.toHexString();
  if (typeof value?.$oid === 'string') return value.$oid;
  return null;
}

async function main() {
  const matches = await prisma.user.findMany({
    where: {
      firstName: 'Steven',
      lastName: 'Ssebuma',
      role: { name: 'super_admin' },
    },
    select: {
      id: true,
      techCenterId: true,
      previousTechCenterId: true,
      isVerified: true,
      verificationStatus: true,
    },
  });

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one Steven Ssebuma super_admin, found ${matches.length}. No data was changed.`,
    );
  }

  const steven = matches[0];
  if (!steven.previousTechCenterId || steven.techCenterId) {
    throw new Error(
      'Steven does not have the expected previous-center-only assignment. No data was changed.',
    );
  }

  const previousCenter = await prisma.techCenter.findUnique({
    where: { id: steven.previousTechCenterId },
    select: { id: true, name: true },
  });
  if (!previousCenter) {
    throw new Error(
      'Steven’s previous tech center does not exist. No data was changed.',
    );
  }

  const updateResult = await prisma.user.updateMany({
    where: {
      id: steven.id,
      previousTechCenterId: previousCenter.id,
      techCenterId: null,
      role: { name: 'super_admin' },
    },
    data: {
      isVerified: true,
      verificationStatus: 'APPROVED',
    },
  });
  if (updateResult.count !== 1) {
    throw new Error(
      `Expected to update Steven exactly once, updated ${updateResult.count}.`,
    );
  }

  const rawUsers = await prisma.user.findRaw({
    filter: { firstName: 'Steven', lastName: 'Ssebuma' },
  });
  const rawSteven = rawUsers[0];
  if (
    !rawSteven ||
    rawSteven.isVerified !== true ||
    rawSteven.verificationStatus !== 'APPROVED' ||
    normalizeObjectId(rawSteven.previousTechCenterId) !== previousCenter.id
  ) {
    throw new Error(
      'Verification failed: stored verification fields or previous tech-center assignment do not match expectations.',
    );
  }

  const directoryMatch = await prisma.user.findFirst({
    where: {
      id: steven.id,
      OR: [
        { techCenterId: { not: null } },
        { previousTechCenterId: { not: null } },
      ],
      isVerified: true,
      verificationStatus: 'APPROVED',
      role: { name: 'super_admin' },
    },
    select: { id: true },
  });
  if (!directoryMatch) {
    throw new Error(
      'Steven passed the stored-field check but did not match the directory candidate query.',
    );
  }

  console.log(
    JSON.stringify(
      {
        updatedCount: updateResult.count,
        name: 'Steven Ssebuma',
        techCenter: previousCenter.name,
        isVerified: rawSteven.isVerified,
        verificationStatus: rawSteven.verificationStatus,
        previousTechCenterAssignmentPreserved: true,
        matchesDirectoryCandidateQuery: true,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error('Failed to update Steven’s verification fields:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
