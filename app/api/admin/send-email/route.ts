// app/api/admin/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail, sendBulkNotificationEmail } from '@/lib/email';
import { NotificationEmail } from '@/components/email/NotificationEmail';
import { requireAuth } from '@/lib/auth/server';
import { trackEmailSent } from '@/lib/email-stats';

export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth();

    if (!user || (user.role?.name !== 'super_admin' && user.role?.name !== 'admin' && user.role?.name !== 'dev')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { recipients, subject, message, recipientName = 'User', isBulk = false } = body;

    // Validate required fields
    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required' },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate HTML email using the template
    const html = NotificationEmail({
      recipientName,
      subject,
      message,
    });

    // Send email(s) using Mailjet (for email page)
    let result;
    if (isBulk && recipients.length > 1) {
      result = await sendBulkNotificationEmail({
        to: recipients,
        subject,
        html,
      });

      // Track each email sent
      for (const recipient of recipients) {
        await trackEmailSent(recipient, 'notification', 'mailjet');
      }
    } else {
      // Send to single recipient (or first one if array but not bulk)
      const to = Array.isArray(recipients) ? recipients[0] : recipients;
      result = await sendNotificationEmail({
        to,
        subject,
        html,
      });

      if (result.success) {
        await trackEmailSent(to, 'notification', 'mailjet');
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
