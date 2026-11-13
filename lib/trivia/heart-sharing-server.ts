import { prisma } from '@/lib/prisma/client';
import { createNotificationForUser } from '@/lib/notifications';
import { getUtcTriviaDayStart } from './daily-lock';
import {
  canGiveHeart,
  canRequestHeart,
  getEffectiveHearts,
  MAX_DAILY_HEARTS,
  MAX_DAILY_HEART_REQUESTS,
  MIN_HEARTS_TO_GIVE,
} from './heart-sharing';

export class HeartShareError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const accountSelect = {
  id: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  isActive: true,
  status: true,
  triviaHeartsDate: true,
  triviaHeartsRemaining: true,
  triviaLockedUntil: true,
} as const;

const fullName = (u: { firstName: string; lastName: string }) =>
  `${u.firstName} ${u.lastName}`.trim();

export async function getHeartSharingState(userId: string, now = new Date()) {
  const dayStart = getUtcTriviaDayStart(now);
  const me = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: accountSelect,
  });
  const heartsRemaining = getEffectiveHearts(me, now);

  const incomingRequests = await prisma.triviaHeartRequest.findMany({
    where: { donorId: userId, dayStart, status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });
  const requesters = await prisma.user.findMany({
    where: { id: { in: incomingRequests.map((r) => r.requesterId) } },
    select: { id: true, firstName: true, lastName: true, profileImageUrl: true },
  });
  const requesterById = new Map(requesters.map((u) => [u.id, u]));
  const incoming = incomingRequests.flatMap((request) => {
    const requester = requesterById.get(request.requesterId);
    return requester
      ? [{
          id: request.id,
          requester: {
            id: requester.id,
            name: fullName(requester),
            profileImageUrl: requester.profileImageUrl,
          },
          createdAt: request.createdAt.toISOString(),
        }]
      : [];
  });

  const requestsSent = await prisma.triviaHeartRequest.count({
    where: { requesterId: userId, dayStart },
  });
  const requestsRemaining = Math.max(0, MAX_DAILY_HEART_REQUESTS - requestsSent);

  let donors: Array<{
    id: string;
    name: string;
    profileImageUrl: string | null;
    requested: boolean;
  }> = [];

  if (canRequestHeart(me, now) && requestsRemaining > 0) {
    const [follows, outgoing] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: { following: { select: accountSelect } },
      }),
      prisma.triviaHeartRequest.findMany({
        where: { requesterId: userId, dayStart },
        select: { donorId: true },
      }),
    ]);
    const requestedIds = new Set(outgoing.map((r) => r.donorId));
    donors = follows
      .map((f) => f.following)
      .filter((u) => u.isActive && u.status === 'ACTIVE' && canGiveHeart(u, now))
      .map((u) => ({
        id: u.id,
        name: fullName(u),
        profileImageUrl: u.profileImageUrl,
        requested: requestedIds.has(u.id),
      }));
  }

  return {
    heartsRemaining,
    incoming,
    donors,
    requestsRemaining,
    requestLimit: MAX_DAILY_HEART_REQUESTS,
  };
}

export async function createHeartRequest(
  requesterId: string,
  donorId: string,
  now = new Date(),
) {
  if (requesterId === donorId) {
    throw new HeartShareError('You cannot request a heart from yourself.', 400);
  }
  const dayStart = getUtcTriviaDayStart(now);

  const [requester, donor, follow, existing] = await Promise.all([
    prisma.user.findUnique({ where: { id: requesterId }, select: accountSelect }),
    prisma.user.findUnique({ where: { id: donorId }, select: accountSelect }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: requesterId, followingId: donorId } },
      select: { id: true },
    }),
    prisma.triviaHeartRequest.findFirst({
      where: { requesterId, donorId, dayStart },
      select: { id: true },
    }),
  ]);

  if (!requester || !donor || !donor.isActive || donor.status !== 'ACTIVE') {
    throw new HeartShareError('That player is not available.', 404);
  }
  if (!follow) {
    throw new HeartShareError('You can only ask people you follow.', 403);
  }
  if (!canRequestHeart(requester, now)) {
    throw new HeartShareError('You still have hearts left today.', 409);
  }
  if (!canGiveHeart(donor, now)) {
    throw new HeartShareError('That player has no spare hearts right now.', 409);
  }
  if (existing) {
    throw new HeartShareError('You already asked this player today.', 409);
  }

  const limitMessage = `You can only request ${MAX_DAILY_HEART_REQUESTS} hearts per day.`;
  const sentToday = await prisma.triviaHeartRequest.count({
    where: { requesterId, dayStart },
  });
  if (sentToday >= MAX_DAILY_HEART_REQUESTS) {
    throw new HeartShareError(limitMessage, 429);
  }

  const request = await prisma.triviaHeartRequest.create({
    data: { requesterId, donorId, dayStart },
  });

  // Concurrent requests can all pass the check above, so recount and undo any overflow.
  const afterCreate = await prisma.triviaHeartRequest.findMany({
    where: { requesterId, dayStart },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (
    afterCreate.length > MAX_DAILY_HEART_REQUESTS &&
    !afterCreate.slice(0, MAX_DAILY_HEART_REQUESTS).some((r) => r.id === request.id)
  ) {
    await prisma.triviaHeartRequest.deleteMany({ where: { id: request.id } });
    throw new HeartShareError(limitMessage, 429);
  }

  try {
    await createNotificationForUser({
      userId: donorId,
      title: 'Heart request',
      message: `${fullName(requester)} is out of trivia hearts and asked you for one.`,
      type: 'trivia_heart_request',
      link: '/dashboard',
      generatedBy: requesterId,
      entityType: 'trivia_heart_request',
      entityId: request.id,
    });
  } catch (error) {
    console.error('Failed to notify donor about heart request:', error);
  }

  return { id: request.id };
}

export async function respondToHeartRequest(
  requestId: string,
  donorId: string,
  action: 'accept' | 'decline',
  now = new Date(),
) {
  const dayStart = getUtcTriviaDayStart(now);

  const request = await prisma.triviaHeartRequest.findFirst({
    where: { id: requestId, donorId, dayStart, status: 'pending' },
  });
  if (!request) {
    throw new HeartShareError('This request is no longer available.', 404);
  }

  if (action === 'decline') {
    await prisma.triviaHeartRequest.updateMany({
      where: { id: requestId, status: 'pending' },
      data: { status: 'declined', respondedAt: now },
    });
    return { accepted: false };
  }

  // Every write is in one transaction: the heart only leaves the giver
  // if it also reaches the requester, and the request can only be claimed once.
  await prisma.$transaction(async (tx) => {
    const stillFollowing = await tx.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: request.requesterId,
          followingId: donorId,
        },
      },
      select: { id: true },
    });
    if (!stillFollowing) {
      throw new HeartShareError('This player no longer follows you.', 403);
    }

    const claimed = await tx.triviaHeartRequest.updateMany({
      where: { id: requestId, status: 'pending' },
      data: { status: 'accepted', respondedAt: now },
    });
    if (claimed.count !== 1) {
      throw new HeartShareError('This request was already answered.', 409);
    }

    await tx.user.updateMany({
      where: {
        id: donorId,
        OR: [
          { triviaHeartsDate: null },
          { triviaHeartsDate: { lt: dayStart } },
        ],
      },
      data: {
        triviaHeartsDate: dayStart,
        triviaHeartsRemaining: MAX_DAILY_HEARTS,
        triviaFailureIds: [],
      },
    });

    const given = await tx.user.updateMany({
      where: {
        id: donorId,
        triviaHeartsDate: dayStart,
        triviaHeartsRemaining: { gte: MIN_HEARTS_TO_GIVE },
        OR: [
          { triviaLockedUntil: null },
          { triviaLockedUntil: { lte: now } },
        ],
      },
      data: { triviaHeartsRemaining: { decrement: 1 } },
    });
    if (given.count !== 1) {
      throw new HeartShareError(
        `You need at least ${MIN_HEARTS_TO_GIVE} hearts to share one.`,
        409,
      );
    }

    const received = await tx.user.updateMany({
      where: {
        id: request.requesterId,
        triviaHeartsDate: dayStart,
        triviaHeartsRemaining: 0,
      },
      data: { triviaHeartsRemaining: 1, triviaLockedUntil: null },
    });
    if (received.count !== 1) {
      throw new HeartShareError('This player no longer needs a heart.', 409);
    }
  }, { timeout: 30000, maxWait: 10000 });

  try {
    const donor = await prisma.user.findUnique({
      where: { id: donorId },
      select: { firstName: true, lastName: true },
    });
    await createNotificationForUser({
      userId: request.requesterId,
      title: 'You received a heart',
      message: `${donor ? fullName(donor) : 'Someone you follow'} shared a trivia heart with you. You can play again!`,
      type: 'trivia_heart_gift',
      link: '/dashboard',
      generatedBy: donorId,
      entityType: 'trivia_heart_request',
      entityId: request.id,
    });
  } catch (error) {
    console.error('Failed to notify requester about heart gift:', error);
  }

  return { accepted: true };
}
