// components/email/NotificationEmail.tsx
/**
 * General Notification Email Component
 * Generates HTML email template for general notifications
 */

export interface NotificationEmailProps {
  recipientName: string;
  subject: string;
  message: string;
  appName?: string;
  supportEmail?: string;
  domain?: string;
}

export function NotificationEmail({
  recipientName,
  subject,
  message,
  appName = 'Selfless CE Student Portal',
  supportEmail = 'turyamurebanicholus@gmail.com',
  domain = 'https://www.selflessstudentportal.org',
}: NotificationEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject} - ${appName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0D1117 0%, #1a2332 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: #E8A33D;
      margin-bottom: 8px;
    }
    .tagline {
      color: #8b949e;
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    h2 {
      color: #0D1117;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    p {
      color: #4a5568;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .message-box {
      background-color: #f9fafb;
      border-left: 4px solid #E8A33D;
      padding: 24px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .message-box p {
      color: #374151;
      line-height: 1.8;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .footer a {
      color: #E8A33D;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .contact-info {
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .contact-info p {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .contact-info strong {
      color: #0D1117;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">Selfless CE</div>
      <div class="tagline">Student Self Service Portal</div>
    </div>

    <div class="content">
      <h2>${subject}</h2>

      <p>Hi ${recipientName},</p>

      <div class="message-box">
        <p>${message}</p>
      </div>

      <div class="contact-info">
        <p><strong>Need Help?</strong></p>
        <p>If you have any questions about this notification, please contact your tech center administrator at:</p>
        <p><strong>Email:</strong> ${supportEmail}</p>
      </div>

      <div class="divider"></div>

      <p>Thank you for being part of the Selfless CE community.</p>
    </div>

    <div class="footer">
      <p>This is an automated email from ${appName}</p>
      <p><a href="${domain}">${domain}</a></p>
      <p>© 2026 Selfless CE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
