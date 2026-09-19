/**
 * scripts/migrate-images-to-azure.ts
 *
 * One-time migration: copies every profile image that still lives on
 * Supabase Storage over to Azure Blob Storage and updates the MongoDB
 * record with the new URL.
 *
 * Usage (from the my-app directory):
 *   npx tsx scripts/migrate-images-to-azure.ts
 *
 * Flags:
 *   --dry-run   Print what would happen without writing anything.
 *   --limit N   Process at most N users (useful for testing a small batch).
 *
 * The script is safe to re-run: it only touches users whose
 * profileImageUrl still contains "supabase.co".
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

// Load .env manually — dotenv is not installed, Next.js normally handles this
// but standalone scripts need to do it themselves.
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
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

// ─── Config ───────────────────────────────────────────────────────────────────

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const CONTAINER = process.env.AZURE_PROFILE_IMAGES_CONTAINER_NAME ?? 'profile-images';

const isDryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : Infinity;

// ─── Azure client ─────────────────────────────────────────────────────────────

function getContainerClient() {
  const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
  const serviceClient = new BlobServiceClient(
    `https://${ACCOUNT_NAME}.blob.core.windows.net`,
    credential,
  );
  return serviceClient.getContainerClient(CONTAINER);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Guess a MIME type from a URL's file extension. */
function mimeFromUrl(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return map[ext ?? ''] ?? 'image/jpeg';
}

/** Download a URL and return the raw buffer + content-type. */
async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const contentType =
    res.headers.get('content-type')?.split(';')[0].trim() ||
    mimeFromUrl(url);
  const arrayBuffer = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

/** Upload a buffer to Azure and return the public URL. */
async function uploadToAzure(
  userId: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const ext = contentType.split('/')[1] ?? 'jpg';
  const blobName = `${userId}/avatar-migrated.${ext}`;
  const container = getContainerClient();

  // Ensure container exists (public blob access so images are directly readable)
  await container.createIfNotExists({ access: 'blob' });

  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlob.url;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   Supabase → Azure profile-image migration           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  Mode      : ${isDryRun ? '🔍 DRY RUN (no writes)' : '✏️  LIVE'}`);
  console.log(`  Container : ${CONTAINER}`);
  console.log(`  Account   : ${ACCOUNT_NAME}`);
  if (LIMIT !== Infinity) console.log(`  Limit     : ${LIMIT} users`);
  console.log('');

  if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
    console.error('❌  AZURE_STORAGE_ACCOUNT_NAME or AZURE_STORAGE_ACCOUNT_KEY is not set.');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  // Fetch every user whose image still lives on Supabase
  const users = await prisma.user.findMany({
    where: {
      profileImageUrl: { contains: 'supabase.co' },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
    },
    ...(LIMIT !== Infinity ? { take: LIMIT } : {}),
  });

  console.log(`Found ${users.length} user(s) with Supabase profile images.\n`);

  if (users.length === 0) {
    console.log('✅  Nothing to migrate.');
    await prisma.$disconnect();
    return;
  }

  // ── Track results ──
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  const failures: { userId: string; name: string; error: string }[] = [];

  for (const user of users) {
    const name = `${user.firstName} ${user.lastName} (${user.id})`;

    if (!user.profileImageUrl) {
      console.log(`  ⏭  SKIP  ${name} — no URL`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ⬇  Fetching  ${name} … `);

    try {
      // 1. Download from Supabase
      const { buffer, contentType } = await fetchImageBuffer(
        user.profileImageUrl,
      );

      process.stdout.write(`${buffer.length} bytes · ${contentType}\n`);

      if (isDryRun) {
        console.log(`     🔍 DRY RUN — would upload to Azure and update MongoDB`);
        succeeded++;
        continue;
      }

      // 2. Upload to Azure
      process.stdout.write(`     ⬆  Uploading to Azure … `);
      const azureUrl = await uploadToAzure(user.id, buffer, contentType);
      process.stdout.write(`done\n`);
      console.log(`     🔗 ${azureUrl}`);

      // 3. Update MongoDB
      await prisma.user.update({
        where: { id: user.id },
        data: { profileImageUrl: azureUrl },
      });

      console.log(`     ✅ MongoDB updated\n`);
      succeeded++;

    } catch (err: any) {
      const msg = err?.message ?? String(err);

      // HTTP 4xx means the file is already gone/broken on Supabase.
      // Clear the URL so the user falls back to their initials avatar
      // rather than showing a permanently broken image.
      if (/HTTP 4\d\d/.test(msg)) {
        console.log(`\n     ⚠️  Broken Supabase URL (${msg}) — clearing profileImageUrl`);
        if (!isDryRun) {
          await prisma.user.update({
            where: { id: user.id },
            data: { profileImageUrl: null },
          });
          console.log(`     ✅ MongoDB cleared (user will show initials)\n`);
        } else {
          console.log(`     🔍 DRY RUN — would clear profileImageUrl in MongoDB\n`);
        }
        skipped++;
      } else {
        console.log(`\n     ❌ FAILED: ${msg}\n`);
        failures.push({ userId: user.id, name, error: msg });
        failed++;
      }
    }
  }

  // ── Summary ──
  console.log('──────────────────────────────────────────────────────');
  console.log(`  Total   : ${users.length}`);
  console.log(`  ✅ OK    : ${succeeded}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏭ Skipped: ${skipped}`);

  if (failures.length > 0) {
    console.log('\n  Failed users:');
    for (const f of failures) {
      console.log(`    • ${f.name}`);
      console.log(`      ${f.error}`);
    }
  }

  if (isDryRun) {
    console.log('\n  ℹ️  This was a dry run — no data was written.');
    console.log('  Re-run without --dry-run to apply changes.');
  }

  console.log('');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
