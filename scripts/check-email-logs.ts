// scripts/check-email-logs.ts
import { prisma } from '../lib/prisma/client';

async function checkEmailLogs() {
  console.log('Checking email logs in database...\n');

  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  console.log('Current UTC time:', now.toISOString());
  console.log('Start of UTC day:', startOfDay.toISOString());
  console.log('Start of UTC month:', startOfMonth.toISOString());
  console.log();

  // Count all email logs
  const totalResend = await prisma.emailLog.count({
    where: { provider: 'resend' },
  });

  const totalMailjet = await prisma.emailLog.count({
    where: { provider: 'mailjet' },
  });

  console.log('Total email logs (all time):');
  console.log(`  Resend: ${totalResend}`);
  console.log(`  Mailjet: ${totalMailjet}`);
  console.log();

  // Count today's email logs
  const todayResend = await prisma.emailLog.count({
    where: {
      provider: 'resend',
      sentAt: { gte: startOfDay },
    },
  });

  const todayMailjet = await prisma.emailLog.count({
    where: {
      provider: 'mailjet',
      sentAt: { gte: startOfDay },
    },
  });

  console.log('Email logs sent today:');
  console.log(`  Resend: ${todayResend}`);
  console.log(`  Mailjet: ${todayMailjet}`);
  console.log();

  // Get recent email logs
  const recentEmails = await prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 15,
  });

  console.log('Recent email logs:');
  recentEmails.forEach((email) => {
    console.log(`  ${email.provider.toUpperCase()} - ${email.to} - ${email.type} - ${email.sentAt.toISOString()}`);
  });

  await prisma.$disconnect();
}

checkEmailLogs();
