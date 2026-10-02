type PartyInvalidation =
  | { type: 'invalidate'; resource: 'messages'; conversationId: string }
  | { type: 'invalidate'; resource: 'profile' | 'social'; userId: string }
  | { type: 'invalidate'; resource: 'approvals' };

export async function publishPartyInvalidation(
  room: string,
  event: PartyInvalidation,
): Promise<void> {
  const host =
    process.env.PARTYKIT_HOST || process.env.NEXT_PUBLIC_PARTYKIT_HOST;
  const secret = process.env.PARTYKIT_SYNC_SECRET;

  if (!host || !secret) {
    console.warn('PartyKit invalidation skipped: host or sync secret is missing.');
    return;
  }

  const normalizedHost = host.replace(/\/$/, '');
  const origin = /^https?:\/\//i.test(normalizedHost)
    ? normalizedHost
    : `${normalizedHost.startsWith('localhost') ? 'http' : 'https'}://${normalizedHost}`;

  try {
    const response = await fetch(
      `${origin}/parties/main/${encodeURIComponent(room)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      console.warn(`PartyKit invalidation failed with status ${response.status}.`);
    }
  } catch (error) {
    console.warn('PartyKit invalidation request failed.', error);
  }
}

export async function publishUserProfileInvalidation(
  userId: string,
): Promise<void> {
  await Promise.all([
    publishPartyInvalidation(`user:${userId}`, {
      type: 'invalidate',
      resource: 'profile',
      userId,
    }),
    publishPartyInvalidation('online-users', {
      type: 'invalidate',
      resource: 'profile',
      userId,
    }),
  ]);
}

export async function publishSocialInvalidation(
  userIds: string[],
): Promise<void> {
  await Promise.all(
    Array.from(new Set(userIds)).map((userId) =>
      publishPartyInvalidation(`user:${userId}`, {
        type: 'invalidate',
        resource: 'social',
        userId,
      }),
    ),
  );
}

export async function publishApprovalInvalidation(): Promise<void> {
  await publishPartyInvalidation('online-users', {
    type: 'invalidate',
    resource: 'approvals',
  });
}