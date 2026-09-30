/**
 * scripts/backfill-counters.ts
 *
 * One-time update: recomputes User.followersCount, User.followingCount,
 * and User.likesReceivedCount from the Follow and Like collections.
 *
 * Fixes the case where relationships exist but counters were never
 * incremented (e.g. rows created before the counter logic was added).
 *
 * Safe to re-run — always recomputes from source of truth.
 *
 * Usage (from the selfless directory):
 *   npx tsx scripts/backfill-counters.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

// Load .env manually — standalone scripts need to do this themselves
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed
        .slice(eqIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    console.warn(
      '⚠️  Could not read .env file — relying on existing environment variables.',
    );
  }
}
loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Fetching all users...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      followersCount: true,
      followingCount: true,
      likesReceivedCount: true,
    },
  });

  console.log(`Found ${users.length} user(s).\n`);

  if (users.length === 0) {
    console.log('✅ No users to update. Nothing to do.');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let changed = 0;

  for (const user of users) {
    const [actualFollowers, actualFollowing, actualLikes] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.like.count({ where: { likedUserId: user.id } }),
    ]);

    const needsUpdate =
      user.followersCount !== actualFollowers ||
      user.followingCount !== actualFollowing ||
      user.likesReceivedCount !== actualLikes;

    if (!needsUpdate) {
      skipped++;
      console.log(
        `⏭️  ${user.firstName} ${user.lastName} — already accurate ` +
          `(${actualFollowers} followers, ${actualFollowing} following, ${actualLikes} likes)`,
      );
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        followersCount: actualFollowers,
        followingCount: actualFollowing,
        likesReceivedCount: actualLikes,
      },
    });

    updated++;
    changed++;
    console.log(
      `✅ ${user.firstName} ${user.lastName} — ` +
        `followers: ${user.followersCount} → ${actualFollowers}, ` +
        `following: ${user.followingCount} → ${actualFollowing}, ` +
        `likes: ${user.likesReceivedCount} → ${actualLikes}`,
    );
  }

  console.log('\n────────────────────────────────────────');
  console.log(`Total users scanned:  ${users.length}`);
  console.log(`Updated:              ${updated}`);
  console.log(`Already accurate:     ${skipped}`);
  console.log('────────────────────────────────────────');
  console.log(
    changed > 0
      ? `✅ Backfill complete. ${changed} user(s) corrected.`
      : '✅ All counters were already accurate — nothing to change.',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error backfilling counters:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });