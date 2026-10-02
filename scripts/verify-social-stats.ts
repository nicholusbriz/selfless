/**
 * scripts/verify-social-stats.ts
 *
 * Comprehensive verification of social stats (followers, following, likes):
 *   1. Checks for mismatches between cached counters and actual table counts
 *   2. Checks for duplicate Follow/Like records
 *   3. Checks for orphaned records (pointing to non-existent users)
 *   4. Reports any inconsistencies found
 *
 * Usage (from the selfless directory):
 *   npx tsx scripts/verify-social-stats.ts
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

interface UserIssue {
  userId: string;
  firstName: string;
  lastName: string;
  type: 'followers_mismatch' | 'following_mismatch' | 'likes_mismatch';
  cached: number;
  actual: number;
}

interface DuplicateIssue {
  type: 'follow' | 'like';
  userId1: string;
  userId2: string;
  count: number;
}

interface OrphanIssue {
  type: 'follow' | 'like';
  recordId: string;
  userId: string;
  missingUserType: 'follower' | 'following' | 'liker' | 'liked';
}

async function main() {
  console.log('🔍 Starting social stats verification...\n');

  const issues: {
    counterMismatches: UserIssue[];
    duplicates: DuplicateIssue[];
    orphans: OrphanIssue[];
  } = {
    counterMismatches: [],
    duplicates: [],
    orphans: [],
  };

  // ==============================
  // 1. Check for counter mismatches
  // ==============================
  console.log('📊 Checking for counter mismatches...');

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

  console.log(`   Found ${users.length} users to check\n`);

  for (const user of users) {
    const [actualFollowers, actualFollowing, actualLikes] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.like.count({ where: { likedUserId: user.id } }),
    ]);

    if (user.followersCount !== actualFollowers) {
      issues.counterMismatches.push({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        type: 'followers_mismatch',
        cached: user.followersCount,
        actual: actualFollowers,
      });
    }

    if (user.followingCount !== actualFollowing) {
      issues.counterMismatches.push({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        type: 'following_mismatch',
        cached: user.followingCount,
        actual: actualFollowing,
      });
    }

    if (user.likesReceivedCount !== actualLikes) {
      issues.counterMismatches.push({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        type: 'likes_mismatch',
        cached: user.likesReceivedCount,
        actual: actualLikes,
      });
    }
  }

  // ==============================
  // 2. Check for duplicates
  // ==============================
  console.log('🔁 Checking for duplicate Follow/Like records...');

  // Check for duplicate follows by fetching all and grouping in memory
  const allFollowsForDupes = await prisma.follow.findMany({
    select: {
      followerId: true,
      followingId: true,
    },
  });

  const followKeyCounts = new Map<string, number>();
  for (const follow of allFollowsForDupes) {
    const key = `${follow.followerId}_${follow.followingId}`;
    followKeyCounts.set(key, (followKeyCounts.get(key) || 0) + 1);
  }

  for (const [key, count] of followKeyCounts.entries()) {
    if (count > 1) {
      const [userId1, userId2] = key.split('_');
      issues.duplicates.push({
        type: 'follow',
        userId1,
        userId2,
        count,
      });
    }
  }

  // Check for duplicate likes by fetching all and grouping in memory
  const allLikesForDupes = await prisma.like.findMany({
    select: {
      likerId: true,
      likedUserId: true,
    },
  });

  const likeKeyCounts = new Map<string, number>();
  for (const like of allLikesForDupes) {
    const key = `${like.likerId}_${like.likedUserId}`;
    likeKeyCounts.set(key, (likeKeyCounts.get(key) || 0) + 1);
  }

  for (const [key, count] of likeKeyCounts.entries()) {
    if (count > 1) {
      const [userId1, userId2] = key.split('_');
      issues.duplicates.push({
        type: 'like',
        userId1,
        userId2,
        count,
      });
    }
  }

  console.log(`   Checked ${allFollowsForDupes.length} follows and ${allLikesForDupes.length} likes\n`);

  // ==============================
  // 3. Check for orphaned records
  // ==============================
  console.log('👻 Checking for orphaned Follow/Like records...');

  // Get all user IDs for validation
  const allUserIds = new Set(users.map((u) => u.id));

  // Check for orphaned follows
  const allFollowsForOrphans = await prisma.follow.findMany({
    select: {
      id: true,
      followerId: true,
      followingId: true,
    },
  });

  for (const follow of allFollowsForOrphans) {
    if (!allUserIds.has(follow.followerId)) {
      issues.orphans.push({
        type: 'follow',
        recordId: follow.id,
        userId: follow.followerId,
        missingUserType: 'follower',
      });
    }
    if (!allUserIds.has(follow.followingId)) {
      issues.orphans.push({
        type: 'follow',
        recordId: follow.id,
        userId: follow.followingId,
        missingUserType: 'following',
      });
    }
  }

  // Check for orphaned likes
  const allLikesForOrphans = await prisma.like.findMany({
    select: {
      id: true,
      likerId: true,
      likedUserId: true,
    },
  });

  for (const like of allLikesForOrphans) {
    if (!allUserIds.has(like.likerId)) {
      issues.orphans.push({
        type: 'like',
        recordId: like.id,
        userId: like.likerId,
        missingUserType: 'liker',
      });
    }
    if (!allUserIds.has(like.likedUserId)) {
      issues.orphans.push({
        type: 'like',
        recordId: like.id,
        userId: like.likedUserId,
        missingUserType: 'liked',
      });
    }
  }

  console.log(`   Checked ${allFollowsForOrphans.length} follows and ${allLikesForOrphans.length} likes\n`);

  // ==============================
  // 4. Report results
  // ==============================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('VERIFICATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (issues.counterMismatches.length === 0 && issues.duplicates.length === 0 && issues.orphans.length === 0) {
    console.log('✅ No issues found! All social stats are consistent.\n');
    return;
  }

  // Counter mismatches
  if (issues.counterMismatches.length > 0) {
    console.log(`❌ COUNTER MISMATCHES (${issues.counterMismatches.length} found):\n`);
    for (const issue of issues.counterMismatches) {
      console.log(
        `   ${issue.firstName} ${issue.lastName} (${issue.type}):`,
      );
      console.log(
        `      Cached: ${issue.cached} → Actual: ${issue.actual} (diff: ${issue.actual - issue.cached})`,
      );
    }
    console.log('');
  }

  // Duplicates
  if (issues.duplicates.length > 0) {
    console.log(`❌ DUPLICATE RECORDS (${issues.duplicates.length} found):\n`);
    for (const issue of issues.duplicates) {
      console.log(
        `   ${issue.type.toUpperCase()}: ${issue.userId1} → ${issue.userId2} (${issue.count} records)`,
      );
    }
    console.log('');
  }

  // Orphans
  if (issues.orphans.length > 0) {
    console.log(`❌ ORPHANED RECORDS (${issues.orphans.length} found):\n`);
    for (const issue of issues.orphans) {
      console.log(
        `   ${issue.type.toUpperCase()} record ${issue.recordId}: missing ${issue.missingUserType} user ${issue.userId}`,
      );
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total issues: ${issues.counterMismatches.length + issues.duplicates.length + issues.orphans.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (issues.counterMismatches.length > 0) {
    console.log('💡 To fix counter mismatches, run: npx tsx scripts/backfill-counters.ts\n');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
