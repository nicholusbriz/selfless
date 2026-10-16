// lib/email-stats.ts
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma/client';
// @ts-ignore
const { Client: MailjetClient } = require('node-mailjet');

const provider = process.env.EMAIL_PROVIDER || 'resend';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;

export interface EmailStats {
  provider: string;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  lastUpdated: Date;
}

export async function getEmailStats(): Promise<EmailStats | null> {
  // For the email page, we want Mailjet stats
  return await getMailjetStats();
}

// Get Resend stats separately for password reset emails
export async function getResendEmailStats(): Promise<EmailStats | null> {
  return await getResendStats();
}

// Get both provider stats
export async function getAllEmailStats(): Promise<{
  resend: EmailStats | null;
  mailjet: EmailStats | null;
}> {
  const [resendStats, mailjetStats] = await Promise.all([
    getResendStats(),
    getMailjetStats(),
  ]);

  return {
    resend: resendStats,
    mailjet: mailjetStats,
  };
}

export async function getResendStats(): Promise<EmailStats | null> {
  if (!resend) {
    return null;
  }

  try {
    // Get UTC date ranges with 4:00 AM reset time
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    // If it's before 4:00 AM UTC, the "day" started yesterday at 4:00 AM
    // If it's 4:00 AM or later, the "day" started today at 4:00 AM
    let startOfDay;
    if (utcHour < 4) {
      // Before 4:00 AM - use yesterday's date
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      startOfDay = new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 4, 0, 0));
    } else {
      // 4:00 AM or later - use today's date
      startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0));
    }
    
    // Monthly reset on the 10th at 4:00 AM UTC
    const utcDay = now.getUTCDate();
    let startOfMonth;
    if (utcDay < 10) {
      // Before the 10th - use previous month's 10th
      const previousMonth = new Date(now);
      previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);
      startOfMonth = new Date(Date.UTC(previousMonth.getUTCFullYear(), previousMonth.getUTCMonth(), 10, 4, 0, 0));
    } else {
      // 10th or later - use current month's 10th
      startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 10, 4, 0, 0));
    }

    // Query database for Resend email stats
    const [dailyCount, monthlyCount] = await Promise.all([
      prisma.emailLog.count({
        where: {
          provider: 'resend',
          sentAt: { gte: startOfDay },
        },
      }),
      prisma.emailLog.count({
        where: {
          provider: 'resend',
          sentAt: { gte: startOfMonth },
        },
      }),
    ]);

    // Resend free tier: 100 emails/day, 3,000 emails/month
    const dailyLimit = 100;
    const monthlyLimit = 3000;

    const dailyUsed = dailyCount;
    const monthlyUsed = monthlyCount;
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);

    return {
      provider: 'Resend',
      dailyLimit,
      dailyUsed,
      dailyRemaining,
      monthlyLimit,
      monthlyUsed,
      monthlyRemaining,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching Resend stats:', error);
    return null;
  }
}

export async function getMailjetStats(): Promise<EmailStats | null> {
  if (!mailjetApiKey || !mailjetSecretKey) {
    return null;
  }

  try {
    // Get UTC date ranges with 4:00 AM reset time
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    // If it's before 4:00 AM UTC, the "day" started yesterday at 4:00 AM
    // If it's 4:00 AM or later, the "day" started today at 4:00 AM
    let startOfDay;
    if (utcHour < 4) {
      // Before 4:00 AM - use yesterday's date
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      startOfDay = new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 4, 0, 0));
    } else {
      // 4:00 AM or later - use today's date
      startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0));
    }
    
    // Monthly reset on the 10th at 4:00 AM UTC
    const utcDay = now.getUTCDate();
    let startOfMonth;
    if (utcDay < 10) {
      // Before the 10th - use previous month's 10th
      const previousMonth = new Date(now);
      previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);
      startOfMonth = new Date(Date.UTC(previousMonth.getUTCFullYear(), previousMonth.getUTCMonth(), 10, 4, 0, 0));
    } else {
      // 10th or later - use current month's 10th
      startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 10, 4, 0, 0));
    }

    // Query database for Mailjet email stats
    const [dailyCount, monthlyCount] = await Promise.all([
      prisma.emailLog.count({
        where: {
          provider: 'mailjet',
          sentAt: { gte: startOfDay },
        },
      }),
      prisma.emailLog.count({
        where: {
          provider: 'mailjet',
          sentAt: { gte: startOfMonth },
        },
      }),
    ]);

    // Mailjet free tier: 200 emails/day, 6,000 emails/month
    const dailyLimit = 200;
    const monthlyLimit = 6000;

    const dailyUsed = dailyCount;
    const monthlyUsed = monthlyCount;
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);

    return {
      provider: 'Mailjet',
      dailyLimit,
      dailyUsed,
      dailyRemaining,
      monthlyLimit,
      monthlyUsed,
      monthlyRemaining,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching Mailjet stats:', error);
    return null;
  }
}

// Track emails sent in your database for accurate stats
export async function trackEmailSent(email: string, type: 'password_reset' | 'notification' | 'other', provider: 'resend' | 'mailjet') {
  try {
    await prisma.emailLog.create({
      data: {
        to: email,
        subject: `${type} email`,
        provider,
        type,
        status: 'sent',
      },
    });
  } catch (error) {
    console.error('Error tracking email sent:', error);
    // Don't throw - email sending should not fail if tracking fails
  }
}
