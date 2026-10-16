// lib/email.ts
import { Resend } from 'resend';
import { PasswordResetEmail } from '@/components/email/PasswordResetEmail';
import { trackEmailSent } from '@/lib/email-stats';
// @ts-ignore
const { Client: MailjetClient } = require('node-mailjet');

const provider = process.env.EMAIL_PROVIDER || 'resend';

// Resend configuration
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'info@selflessstudentportal.org';
const resendFromName = process.env.RESEND_FROM_NAME || 'selflessstudentportal.org';

// Mailjet configuration
const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;
const mailjetFromEmail = process.env.MAILJET_FROM_EMAIL || 'info@selflessstudentportal.org';
const mailjetFromName = process.env.MAILJET_FROM_NAME || 'selflessstudentportal.org';

export interface SendPasswordResetEmailParams {
  to: string;
  firstName: string;
  resetCode: string;
  expiryDate: Date;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendBulkEmailParams {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams) {
  try {
    if (provider === 'mailjet') {
      return await sendMailjetEmail({ to, subject, html, text });
    } else {
      return await sendResendEmail({ to, subject, html, text });
    }
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendBulkEmail({
  to,
  subject,
  html,
  text,
}: SendBulkEmailParams) {
  const results = [];

  for (const recipient of to) {
    const result = await sendEmail({ to: recipient, subject, html, text });
    results.push({ email: recipient, ...result });

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  return {
    success: failureCount === 0,
    total: to.length,
    successCount,
    failureCount,
    results,
  };
}

async function sendResendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams) {
  if (!resend) {
    console.log('Resend not configured. Email would be sent to:', to);
    return { success: true, skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: `${resendFromName} <${resendFromEmail}>`,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

async function sendMailjetEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams) {
  if (!mailjetApiKey || !mailjetSecretKey) {
    console.log('Mailjet not configured. Email would be sent to:', to);
    return { success: true, skipped: true };
  }

  const mailjet = new MailjetClient({
    apiKey: mailjetApiKey,
    apiSecret: mailjetSecretKey,
  });

  const result = await mailjet
    .post('send', { version: 'v3.1' })
    .request({
      Messages: [
        {
          From: {
            Email: mailjetFromEmail,
            Name: mailjetFromName,
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          HTMLPart: html,
          TextPart: text,
        },
      ],
    });

  if (result.response?.status !== 200) {
    console.error('Mailjet email error:', result.response);
    return { success: false, error: 'Failed to send email via Mailjet' };
  }

  // Track successful email send
  await trackEmailSent(to, 'notification', 'mailjet');

  return { success: true, data: result.body };
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  resetCode,
  expiryDate,
}: SendPasswordResetEmailParams) {
  try {
    // Generate HTML email using the component
    const html = PasswordResetEmail({
      firstName,
      resetCode,
      expiryDate,
    });

    // Password reset emails always use Resend
    const result = await sendResendEmail({
      to,
      subject: 'Password Reset Code - Selfless CE Student Portal',
      html,
    });

    if (result.success) {
      // Track successful email send
      await trackEmailSent(to, 'password_reset', 'resend');
    }

    return result;
  } catch (error) {
    console.error('Send password reset email error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Send notification emails (from email page) - always uses Mailjet
export async function sendNotificationEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams) {
  try {
    // Notification emails always use Mailjet
    return await sendMailjetEmail({ to, subject, html, text });
  } catch (error) {
    console.error('Send notification email error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Send bulk notification emails (from email page) - always uses Mailjet
export async function sendBulkNotificationEmail({
  to,
  subject,
  html,
  text,
}: SendBulkEmailParams) {
  const results = [];

  for (const recipient of to) {
    const result = await sendNotificationEmail({ to: recipient, subject, html, text });
    results.push({ email: recipient, ...result });

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  return {
    success: failureCount === 0,
    total: to.length,
    successCount,
    failureCount,
    results,
  };
}
