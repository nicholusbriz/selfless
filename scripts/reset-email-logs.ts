// scripts/reset-email-logs.ts
import { prisma } from '../lib/prisma/client';

async function resetEmailLogs() {
  console.log('Resetting email logs...');

  try {
    // Delete all email logs (or specific ones you want to reset)
    const result = await prisma.emailLog.deleteMany({});

    console.log(`Deleted ${result.count} email logs`);
    console.log('✓ Reset completed');

  } catch (error) {
    console.error('Error resetting email logs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetEmailLogs();
