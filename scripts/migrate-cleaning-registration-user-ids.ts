import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

function loadEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    console.warn('Could not read .env; using environment variables already set.');
  }
}

type AggregateResult = {
  cursor?: {
    firstBatch?: Array<Record<string, unknown>>;
  };
};

loadEnv();
const prisma = new PrismaClient();

async function aggregate(pipeline: Record<string, unknown>[]) {
  const result = await prisma.$runCommandRaw({
    aggregate: 'cleaning_registrations',
    pipeline,
    cursor: {},
  }) as AggregateResult;
  return result.cursor?.firstBatch ?? [];
}

async function main() {
  const [stringIdSummary] = await aggregate([
    { $match: { userId: { $type: 'string' } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        invalid: {
          $sum: {
            $cond: [
              { $regexMatch: { input: '$userId', regex: '^[0-9a-fA-F]{24}$' } },
              0,
              1,
            ],
          },
        },
      },
    },
  ]);

  const stringIdCount = Number(stringIdSummary?.total ?? 0);
  const invalidIdCount = Number(stringIdSummary?.invalid ?? 0);
  const [duplicateSummary] = await aggregate([
    { $match: { userId: { $type: 'string' } } },
    { $group: { _id: { $toLower: '$userId' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: 'duplicateKeys' },
  ]);
  const duplicateKeyCount = Number(duplicateSummary?.duplicateKeys ?? 0);

  console.log(`String userId records: ${stringIdCount}`);
  console.log(`Malformed ObjectId strings: ${invalidIdCount}`);
  console.log(`Duplicate IDs after ObjectId normalization: ${duplicateKeyCount}`);

  if (invalidIdCount > 0 || duplicateKeyCount > 0) {
    throw new Error('Preflight failed; no records were changed. Resolve these records first.');
  }

  if (!process.argv.includes('--apply')) {
    console.log('Dry run only. Re-run with --apply to convert the validated string IDs.');
    return;
  }

  const result = await prisma.$runCommandRaw({
    update: 'cleaning_registrations',
    updates: [
      {
        q: { userId: { $type: 'string' } },
        u: [{ $set: { userId: { $toObjectId: '$userId' } } }],
        multi: true,
      },
    ],
  }) as { n?: number; nModified?: number; writeErrors?: unknown[] };

  if (result.writeErrors?.length) {
    throw new Error('MongoDB reported write errors while converting registration user IDs.');
  }

  console.log(`Converted ${Number(result.nModified ?? result.n ?? 0)} registration userId value(s).`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });