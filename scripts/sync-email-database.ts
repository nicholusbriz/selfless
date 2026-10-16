// scripts/sync-email-database.ts
// This script syncs the database with email providers by adding email logs
// for emails that were sent before tracking was implemented
// Uses UTC time to match provider reset times

import { prisma } from '../lib/prisma/client';

async function syncEmailDatabase() {
  console.log('Starting email database sync...');

  try {
    // Get UTC date ranges to sync with provider reset times
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    console.log('Current UTC time:', now.toISOString());
    console.log('Start of UTC day:', startOfDay.toISOString());
    console.log('Start of UTC month:', startOfMonth.toISOString());
    console.log();

    // Count existing email logs
    const resendCount = await prisma.emailLog.count({
      where: {
        provider: 'resend',
        sentAt: { gte: startOfDay },
      },
    });

    const mailjetCount = await prisma.emailLog.count({
      where: {
        provider: 'mailjet',
        sentAt: { gte: startOfDay },
      },
    });

    console.log(`Current database counts (today UTC):`);
    console.log(`  Resend: ${resendCount}`);
    console.log(`  Mailjet: ${mailjetCount}`);

    // User said they sent 7 Resend and 3 Mailjet emails
    const targetResendCount = 7;
    const targetMailjetCount = 3;

    const resendToAdd = targetResendCount - resendCount;
    const mailjetToAdd = targetMailjetCount - mailjetCount;

    console.log(`\nEmails to add:`);
    console.log(`  Resend: ${resendToAdd}`);
    console.log(`  Mailjet: ${mailjetToAdd}`);

    // Add Resend emails if needed
    if (resendToAdd > 0) {
      console.log(`\nAdding ${resendToAdd} Resend email logs...`);
      for (let i = 0; i < resendToAdd; i++) {
        // Ensure timestamp is within today UTC by using startOfDay + some minutes
        const sentAt = new Date(startOfDay.getTime() + (i * 10 * 60 * 1000)); // 10 min intervals
        await prisma.emailLog.create({
          data: {
            to: 'user@example.com', // Placeholder - update with actual emails if needed
            subject: 'Password reset email',
            provider: 'resend',
            type: 'password_reset',
            status: 'sent',
            sentAt,
          },
        });
      }
      console.log(`✓ Added ${resendToAdd} Resend email logs`);
    }

    // Add Mailjet emails if needed
    if (mailjetToAdd > 0) {
      console.log(`\nAdding ${mailjetToAdd} Mailjet email logs...`);
      for (let i = 0; i < mailjetToAdd; i++) {
        // Ensure timestamp is within today UTC by using startOfDay + some minutes
        const sentAt = new Date(startOfDay.getTime() + ((i + resendToAdd) * 10 * 60 * 1000)); // Continue after Resend
        await prisma.emailLog.create({
          data: {
            to: 'user@example.com', // Placeholder - update with actual emails if needed
            subject: 'Notification email',
            provider: 'mailjet',
            type: 'notification',
            status: 'sent',
            sentAt,
          },
        });
      }
      console.log(`✓ Added ${mailjetToAdd} Mailjet email logs`);
    }

    // Verify final counts
    const finalResendCount = await prisma.emailLog.count({
      where: {
        provider: 'resend',
        sentAt: { gte: startOfDay },
      },
    });

    const finalMailjetCount = await prisma.emailLog.count({
      where: {
        provider: 'mailjet',
        sentAt: { gte: startOfDay },
      },
    });

    console.log(`\nFinal database counts (today UTC):`);
    console.log(`  Resend: ${finalResendCount}`);
    console.log(`  Mailjet: ${finalMailjetCount}`);
    console.log('\n✓ Email database sync completed successfully!');

  } catch (error) {
    console.error('Error syncing email database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncEmailDatabase();
