// scripts/cleanup-old-email-logs.ts
// This script removes email logs that are older than the current UTC day/month
// to keep the database in sync with provider reset times

import { prisma } from '../lib/prisma/client';

async function cleanupOldEmailLogs() {
  console.log('Cleaning up old email logs...');

  try {
    // Get UTC date ranges
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    console.log('Current UTC time:', now.toISOString());
    console.log('Start of UTC day:', startOfDay.toISOString());
    console.log('Start of UTC month:', startOfMonth.toISOString());
    console.log();

    // Count old logs before cleanup
    const totalResend = await prisma.emailLog.count({ where: { provider: 'resend' } });
    const totalMailjet = await prisma.emailLog.count({ where: { provider: 'mailjet' } });

    console.log('Before cleanup:');
    console.log(`  Total Resend logs: ${totalResend}`);
    console.log(`  Total Mailjet logs: ${totalMailjet}`);
    console.log();

    // Delete logs older than the current UTC day (for daily stats)
    // We keep logs from the current UTC day onwards
    const deleteResult = await prisma.emailLog.deleteMany({
      where: {
        sentAt: { lt: startOfDay },
      },
    });

    console.log(`Deleted ${deleteResult.count} old email logs (before current UTC day)`);

    // Verify cleanup
    const finalResend = await prisma.emailLog.count({ where: { provider: 'resend' } });
    const finalMailjet = await prisma.emailLog.count({ where: { provider: 'mailjet' } });

    console.log();
    console.log('After cleanup:');
    console.log(`  Total Resend logs: ${finalResend}`);
    console.log(`  Total Mailjet logs: ${finalMailjet}`);
    console.log();
    console.log('✓ Cleanup completed successfully');

  } catch (error) {
    console.error('Error cleaning up email logs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldEmailLogs();
