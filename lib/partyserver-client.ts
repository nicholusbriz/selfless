// This file previously handled Cloudflare Worker invalidation logic.
// Invalidations are now handled manually via session invalidation API.
// This file is kept as a stub for backward compatibility during migration.
// TODO: Remove all imports of this file and delete it.

export async function publishUserProfileInvalidation(_userId: string): Promise<void> {
  // No-op: invalidations are now handled manually
}

export async function publishSocialInvalidation(_userIds: string[]): Promise<void> {
  // No-op: invalidations are now handled manually
}

export async function publishApprovalInvalidation(): Promise<void> {
  // No-op: invalidations are now handled manually
}

export async function publishMessageInvalidation(
  _conversationId: string,
  _participantIds: string[],
): Promise<void> {
  // No-op: invalidations are now handled manually
}
