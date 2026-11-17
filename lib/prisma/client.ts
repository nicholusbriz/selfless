// C:\Selfless\my-app\lib\prisma\client.ts
/**
 * PRISMA CLIENT
 *
 * This file creates and exports a singleton Prisma Client instance.
 *
 * Purpose: Prevents multiple database connections during development
 * by reusing the same instance across the application.
 *
 * Note: In production, this creates a new instance per request
 * but we use the global object to cache it in development.
 */

import { PrismaClient } from '@prisma/client';

// Use global object to cache Prisma Client across hot reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForExtendedPrisma = globalThis as unknown as {
  extendedPrisma: ExtendedPrismaClient | undefined;
};

/**
 * Prisma Client instance with optimized configuration
 * - Only logs errors to reduce terminal noise
 * - Increased connection limits for better performance
 * - Query extension auto-includes `hasVerifiedBadge` on every User select,
 *   so the verified badge flag is returned globally without editing each API.
 */
function createPrismaClient() {
  const base =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
      // Optimize connection pool for MongoDB
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = base;
  }

  return base.$extends({
    name: 'verifiedBadge',
    query: {
      user: {
        async $allOperations({ args, query }) {
          const queryArgs = args as
            | { select?: Record<string, unknown> }
            | undefined;
          if (queryArgs?.select && typeof queryArgs.select === 'object') {
            queryArgs.select = {
              ...queryArgs.select,
              hasVerifiedBadge: true,
            };
          }
          return query(args);
        },
      },
    },
  });
}

const extendedPrisma =
  globalForExtendedPrisma.extendedPrisma ?? createPrismaClient();

// In development, cache the client in the global object
if (process.env.NODE_ENV !== 'production') {
  globalForExtendedPrisma.extendedPrisma = extendedPrisma;
}

// Export typed as PrismaClient so existing helpers (e.g. HeartDatabase)
// keep their signatures; the query extension still runs at runtime.
export const prisma = extendedPrisma as unknown as PrismaClient;

export default prisma;
