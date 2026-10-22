import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = process.argv[2] || 'marblemarsmays@gmail.com';
const directorySearch = process.argv.slice(3).join(' ').trim();
const MAX_STUDENTS = 1000;

function getRawId(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.toHexString === 'function') return value.toHexString();
  if (typeof value?.$oid === 'string') return value.$oid;
  throw new Error('Could not read a user ID from MongoDB diagnostic result.');
}

async function main() {
  const rawUsersMissingVerification = await prisma.user.findRaw({
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
  const missingUserIds = rawUsersMissingVerification.map((raw) =>
    getRawId(raw._id),
  );
  const affectedUsers = missingUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: missingUserIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: { select: { name: true } },
          techCenter: { select: { name: true } },
          techCenterId: true,
          previousTechCenterId: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      })
    : [];
  const previousCenterIds = affectedUsers
    .map((affected) => affected.previousTechCenterId)
    .filter((id) => id !== null);
  const previousCenters = previousCenterIds.length
    ? await prisma.techCenter.findMany({
        where: { id: { in: previousCenterIds } },
        select: { id: true, name: true },
      })
    : [];
  const previousCenterById = new Map(
    previousCenters.map((center) => [center.id, center.name]),
  );
  const affectedById = new Map(affectedUsers.map((affected) => [affected.id, affected]));
  const missingVerificationReport = rawUsersMissingVerification.map((raw) => {
    const id = getRawId(raw._id);
    const affected = affectedById.get(id);
    if (!affected) {
      throw new Error(`Could not match diagnostic record ${id} to Prisma user.`);
    }
    return {
      name: `${affected.firstName} ${affected.lastName}`.trim(),
      role: affected.role?.name ?? null,
      techCenter: affected.techCenter?.name ?? null,
      missingIsVerified: !Object.hasOwn(raw, 'isVerified'),
      missingVerificationStatus: !Object.hasOwn(raw, 'verificationStatus'),
      previousTechCenterId: affected.previousTechCenterId,
      previousTechCenter:
        previousCenterById.get(affected.previousTechCenterId ?? '') ?? null,
      excludedFromDirectoryByRole: affected.role?.name === 'dev',
    };
  });

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: { select: { name: true } },
      techCenterId: true,
      previousTechCenterId: true,
      techCenter: { select: { id: true, name: true } },
      isVerified: true,
      verificationStatus: true,
      status: true,
      isActive: true,
      submittedCourses: {
        select: {
          id: true,
          courseUnit: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    console.log(
      JSON.stringify(
        {
          missingVerificationFieldScan: {
            affectedCount: missingVerificationReport.length,
            likelyExcludedFromDirectoryCount: missingVerificationReport.filter(
              (affected) => !affected.excludedFromDirectoryByRole,
            ).length,
            affectedUsers: missingVerificationReport,
          },
          targetAccount: `No user found for ${email}.`,
        },
        null,
        2,
      ),
    );
    return;
  }

  const rawUsers = await prisma.user.findRaw({
    filter: { email },
  });
  const rawUser = rawUsers[0] ?? null;

  const candidateWhere = {
    AND: [
      {
        OR: [
          { techCenterId: { not: null } },
          { previousTechCenterId: { not: null } },
        ],
      },
      { isVerified: true, verificationStatus: 'APPROVED' },
    ],
  };
  const [
    techCenters,
    candidates,
    totalMatchingCandidates,
    directCandidateMatch,
    matchingByCenter,
    matchingByApproval,
    matchingByVerification,
  ] = await Promise.all([
    prisma.techCenter.findMany({
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: candidateWhere,
      select: {
        id: true,
        role: { select: { name: true } },
        techCenterId: true,
        previousTechCenterId: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: MAX_STUDENTS,
    }),
    prisma.user.count({ where: candidateWhere }),
    prisma.user.findFirst({
      where: { id: user.id, ...candidateWhere },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { id: user.id, techCenterId: { not: null } },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { id: user.id, verificationStatus: 'APPROVED' },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { id: user.id, isVerified: true },
      select: { id: true },
    }),
  ]);

  const candidateIndex = candidates.findIndex(
    (candidate) => candidate.id === user.id,
  );
  const passesDirectoryPostFilter =
    candidateIndex !== -1 &&
    user.role?.name !== 'dev' &&
    (user.techCenterId !== null ||
      (user.role?.name === 'super_admin' &&
        user.previousTechCenterId !== null &&
        techCenters.some(
          (center) => center.id === user.previousTechCenterId,
        )));
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const searchMatches =
    !directorySearch ||
    fullName.toLocaleLowerCase().includes(directorySearch.toLocaleLowerCase());

  console.log(
    JSON.stringify(
      {
        missingVerificationFieldScan: {
          affectedCount: missingVerificationReport.length,
          likelyExcludedFromDirectoryCount: missingVerificationReport.filter(
            (affected) => !affected.excludedFromDirectoryByRole,
          ).length,
          affectedUsers: missingVerificationReport,
        },
        account: {
          email,
          name: fullName,
          role: user.role?.name ?? null,
          techCenter: user.techCenter,
          techCenterId: user.techCenterId,
          previousTechCenterId: user.previousTechCenterId,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
          status: user.status,
          isActive: user.isActive,
          courses: user.submittedCourses.map((course) => ({
            courseUnit: course.courseUnit,
            status: course.status,
          })),
        },
        storedDocument: rawUser
          ? {
              hasTechCenterId: Object.hasOwn(rawUser, 'techCenterId'),
              hasPreviousTechCenterId: Object.hasOwn(
                rawUser,
                'previousTechCenterId',
              ),
              hasIsVerified: Object.hasOwn(rawUser, 'isVerified'),
              isVerified: rawUser.isVerified ?? null,
              hasVerificationStatus: Object.hasOwn(
                rawUser,
                'verificationStatus',
              ),
              verificationStatus: rawUser.verificationStatus ?? null,
            }
          : null,
        directoryChecks: {
          matchedVerifiedTechCenterCandidateQuery: candidateIndex !== -1,
          matchedDirectCandidateQuery: directCandidateMatch !== null,
          matchingCenterCondition: matchingByCenter !== null,
          matchingApprovalCondition: matchingByApproval !== null,
          matchingVerificationCondition: matchingByVerification !== null,
          candidatePositionWithinLimit:
            candidateIndex === -1 ? null : candidateIndex + 1,
          totalMatchingCandidates,
          candidateLimit: MAX_STUDENTS,
          passesDirectoryPostFilter,
          matchesDirectoryNameSearch: searchMatches,
          searchableName: fullName,
          possibleReasonsForNotAppearing: [
            ...(candidateIndex === -1
              ? [
                  'Not returned by the API candidate query: check tech-center assignment and approved verification status.',
                ]
              : []),
            ...(!passesDirectoryPostFilter
              ? [
                  'Removed by the API role/tech-center post-filter.',
                ]
              : []),
            ...(!searchMatches
              ? ['The supplied search text does not match the full name.']
              : []),
          ],
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error('Failed to check student directory eligibility:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
