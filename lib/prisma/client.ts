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

/**
 * Prisma Client instance with logging configuration
 * - Only logs errors to reduce terminal noise
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

// In development, cache the client in the global object
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;