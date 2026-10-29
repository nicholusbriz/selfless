type RealtimeInvalidation =
  | { type: 'invalidate'; resource: 'messages'; conversationId: string }
  | { type: 'invalidate'; resource: 'profile' | 'social'; userId: string }
  | { type: 'invalidate'; resource: 'approvals' };

// Debounce cache for invalidation requests
const invalidationCache = new Map<string, ReturnType<typeof setTimeout>>();

function debounceInvalidation(
  key: string,
  fn: () => Promise<void>,
  delay: number = 500,
): void {
  // Clear existing timer if any
  if (invalidationCache.has(key)) {
    clearTimeout(invalidationCache.get(key)!);
  }

  // Set new timer
  const timer = setTimeout(async () => {
    await fn();
    invalidationCache.delete(key);
  }, delay);

  invalidationCache.set(key, timer);
}

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
  // Debounce profile invalidations to batch rapid updates
  const key = `profile:${userId}`;
  debounceInvalidation(key, async () => {
    // Only invalidate the user's personal room to reduce global broadcasts
    await publishRealtimeInvalidation(`user:${userId}`, {
      type: 'invalidate',
      resource: 'profile',
      userId,
    });
  }, 500);
}

export async function publishSocialInvalidation(
  userIds: string[],
): Promise<void> {
  // Debounce social invalidations per user to batch rapid updates
  const uniqueUserIds = Array.from(new Set(userIds));
  uniqueUserIds.forEach((userId) => {
    const key = `social:${userId}`;
    debounceInvalidation(key, async () => {
      await publishRealtimeInvalidation(`user:${userId}`, {
        type: 'invalidate',
        resource: 'social',
        userId,
      });
    }, 500);
  });
}

export async function publishApprovalInvalidation(): Promise<void> {
  // Debounce approval invalidations to batch rapid updates
  const key = 'approvals';
  debounceInvalidation(key, async () => {
    await publishRealtimeInvalidation('online-users', {
      type: 'invalidate',
      resource: 'approvals',
    });
  }, 500);
}

export async function publishMessageInvalidation(
  conversationId: string,
  participantIds: string[],
): Promise<void> {
  // Debounce message invalidations per conversation to batch rapid updates
  const key = `messages:${conversationId}`;
  debounceInvalidation(key, async () => {
    await Promise.all(
      participantIds.map((participantId) =>
        publishRealtimeInvalidation(`user:${participantId}`, {
          type: 'invalidate',
          resource: 'messages',
          conversationId,
        }),
      ),
    );
  }, 300); // Lower debounce for messages (more time-sensitive)
}
