type RealtimeInvalidation =
  | { type: 'invalidate'; resource: 'messages'; conversationId: string }
  | { type: 'invalidate'; resource: 'profile' | 'social'; userId: string }
  | { type: 'invalidate'; resource: 'approvals' };

export async function publishRealtimeInvalidation(
  room: string,
  event: RealtimeInvalidation,
): Promise<void> {
  const host =
    process.env.PARTYSERVER_HOST || process.env.NEXT_PUBLIC_PARTYSERVER_HOST;
  const secret = process.env.PARTYSERVER_SYNC_SECRET;

  if (!host || !secret) {
    console.warn('PartyServer invalidation skipped: host or sync secret is missing.');
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
      console.warn(`PartyServer invalidation failed with status ${response.status}.`);
    }
  } catch (error) {
    console.warn('PartyServer invalidation request failed.', error);
  }
}

export async function publishUserProfileInvalidation(
  userId: string,
): Promise<void> {
  await Promise.all([
    publishRealtimeInvalidation(`user:${userId}`, {
      type: 'invalidate',
      resource: 'profile',
      userId,
    }),
    publishRealtimeInvalidation('online-users', {
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
      publishRealtimeInvalidation(`user:${userId}`, {
        type: 'invalidate',
        resource: 'social',
        userId,
      }),
    ),
  );
}

export async function publishApprovalInvalidation(): Promise<void> {
  await publishRealtimeInvalidation('online-users', {
    type: 'invalidate',
    resource: 'approvals',
  });
}
