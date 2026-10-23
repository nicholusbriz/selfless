// app/api/admin/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail, sendBulkNotificationEmail } from '@/lib/email';
import { NotificationEmail } from '@/components/email/NotificationEmail';
import { requireAuth } from '@/lib/auth/server';
import { trackEmailSent, getMailjetStats } from '@/lib/email-stats';
import {
  invalidJsonBodyResponse,
  isBoolean,
  isJsonObject,
  isString,
  isStringOrStringArray,
  optional,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

type RecipientDetail = {
  email: string;
  firstName?: string;
  lastName?: string;
};

function isRecipientDetails(value: unknown): value is RecipientDetail[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isJsonObject(item) &&
        isString(item.email) &&
        (item.firstName === undefined || isString(item.firstName)) &&
        (item.lastName === undefined || isString(item.lastName)),
    )
  );
}

// ── Greeting helper ────────────────────────────────────────────────────────────
// Uses UTC hour at send time. Uganda is UTC+3, so the offsets map naturally:
//   UTC 04–11  →  07–14 local  →  Morning
//   UTC 12–16  →  15–19 local  →  Afternoon
//   UTC 17–03  →  20–06 local  →  Evening / Night
function getTimeGreeting(): string {
  const utcHour = new Date().getUTCHours();
  if (utcHour >= 4 && utcHour < 12) return 'Good morning';
  if (utcHour >= 12 && utcHour < 17) return 'Good afternoon';
  return 'Good evening';
}

export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth();

    if (
      !user ||
      (user.role?.name !== 'super_admin' &&
        user.role?.name !== 'admin' &&
        user.role?.name !== 'dev')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await parseJsonBody(req, {
      recipients: isStringOrStringArray,
      recipientDetails: optional(isRecipientDetails),
      subject: isString,
      message: isString,
      recipientName: optional(isString),
      isBulk: optional(isBoolean),
    });
    if (!body) return invalidJsonBodyResponse();
    const {
      recipients,          // string[]  — email addresses
      recipientDetails,    // { email: string; firstName: string; lastName: string }[] (optional)
      subject,
      message,
      recipientName = 'User', // fallback when no recipientDetails provided
      isBulk = false,
    } = body;

    // Validate
    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients are required' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // ── Mailjet daily-limit pre-flight check ──────────────────────────────────
    const mailjetStats = await getMailjetStats();
    if (mailjetStats) {
      const needed = Array.isArray(recipients) ? recipients.length : 1;
      if (mailjetStats.dailyRemaining === 0) {
        return NextResponse.json(
          {
            error: 'DAILY_LIMIT_EXCEEDED',
            message: `Cannot send — Mailjet daily limit reached (${mailjetStats.dailyUsed}/${mailjetStats.dailyLimit} used). Resets at 4:00 AM UTC.`,
            dailyUsed: mailjetStats.dailyUsed,
            dailyLimit: mailjetStats.dailyLimit,
            dailyRemaining: 0,
          },
          { status: 429 }
        );
      }
      if (needed > mailjetStats.dailyRemaining) {
        return NextResponse.json(
          {
            error: 'INSUFFICIENT_DAILY_QUOTA',
            message: `Cannot send to ${needed} recipient${needed > 1 ? 's' : ''} — only ${mailjetStats.dailyRemaining} email${mailjetStats.dailyRemaining > 1 ? 's' : ''} remaining today (${mailjetStats.dailyUsed}/${mailjetStats.dailyLimit} used). Resets at 4:00 AM UTC.`,
            dailyUsed: mailjetStats.dailyUsed,
            dailyLimit: mailjetStats.dailyLimit,
            dailyRemaining: mailjetStats.dailyRemaining,
            needed,
          },
          { status: 429 }
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Compute greeting once for the whole batch (same time for all)
    const timeGreeting = getTimeGreeting();

    // Build a lookup map: email → full name
    const nameMap = new Map<string, string>();
    if (Array.isArray(recipientDetails)) {
      for (const rd of recipientDetails) {
        if (rd.email) {
          const fullName = [rd.firstName, rd.lastName].filter(Boolean).join(' ').trim();
          nameMap.set(rd.email.toLowerCase(), fullName || rd.firstName || 'there');
        }
      }
    }

    const getFullName = (email: string): string =>
      nameMap.get(email.toLowerCase()) || recipientName;

    // ── BULK send — personalise each email ─────────────────────────────────────
    if (isBulk && recipients.length > 1) {
      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const email of recipients) {
        const fullName = getFullName(email);
        const greeting = `${timeGreeting}, ${fullName}`;

        const html = NotificationEmail({
          recipientName: fullName,
          greeting,
          subject,
          message,
        });

        const result = await sendNotificationEmail({ to: email, subject, html });
        results.push({ email, success: result.success, error: (result as any).error });

        if (result.success) {
          await trackEmailSent(email, 'notification', 'mailjet');
        }

        // Small delay to respect Mailjet rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const successCount = results.filter((r) => r.success).length;
      return NextResponse.json({
        success: successCount > 0,
        total: recipients.length,
        successCount,
        failureCount: recipients.length - successCount,
        results,
      });
    }

    // ── SINGLE send ────────────────────────────────────────────────────────────
    const to = Array.isArray(recipients) ? recipients[0] : recipients;
    const fullName = getFullName(to);
    const greeting = `${timeGreeting}, ${fullName}`;

    const html = NotificationEmail({
      recipientName: fullName,
      greeting,
      subject,
      message,
    });

    const result = await sendNotificationEmail({ to, subject, html });

    if (result.success) {
      await trackEmailSent(to, 'notification', 'mailjet');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
