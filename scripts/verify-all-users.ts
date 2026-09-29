/**
 * scripts/verify-all-users.ts
 *
 * One-time update: sets isVerified=true and verificationStatus='APPROVED'
 * for every user that hasn't been approved yet.
 *
 * Usage (from the selfless directory):
 *   npx tsx scripts/verify-all-users.ts
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
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    console.warn('⚠️  Could not read .env file — relying on existing environment variables.');
  }
}
loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Fetching users that are not yet verified...');

  const unverifiedCount = await prisma.user.count({
    where: {
      OR: [
        { isVerified: false },
        { verificationStatus: { not: 'APPROVED' } },
      ],
    },
  });

  console.log(`Found ${unverifiedCount} user(s) that are not fully verified.`);

  if (unverifiedCount === 0) {
    console.log('✅ All users are already verified. Nothing to do.');
    return;
  }

  const result = await prisma.user.updateMany({
    where: {
      OR: [
        { isVerified: false },
        { verificationStatus: { not: 'APPROVED' } },
      ],
    },
    data: {
      isVerified: true,
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  console.log(`✅ Successfully updated ${result.count} user(s) to verified/approved.`);
}

main()
  .catch((e) => {
    console.error('❌ Error updating users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
