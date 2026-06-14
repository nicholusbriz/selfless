import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add connection timeout and better error handling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.PRISMA_QUERY_LOGGING === 'false' ? ['error'] : (process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']),
  errorFormat: 'pretty',
});

// Test connection on import (helps debug)
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err.message));
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;