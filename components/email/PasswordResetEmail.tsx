// components/email/PasswordResetEmail.tsx
/**
 * Password Reset Email Component
 * Generates HTML email template for password reset
 */

export interface PasswordResetEmailProps {
  firstName: string;
  resetCode: string;
  expiryDate: Date;
  appName?: string;
  supportEmail?: string;
  domain?: string;
}

export function PasswordResetEmail({
  firstName,
  resetCode,
  expiryDate,
  appName = 'Selfless CE Student Portal',
  supportEmail = 'turyamurebanicholus@gmail.com',
  domain = 'https://www.selflessstudentportal.org',
}: PasswordResetEmailProps) {
  const formattedExpiry = expiryDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code - ${appName}</title>
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
    .code-box {
      background: linear-gradient(135deg, #0D1117 0%, #1a2332 100%);
      color: #E8A33D;
      font-size: 48px;
      font-weight: 700;
      letter-spacing: 12px;
      text-align: center;
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
      box-shadow: 0 4px 12px rgba(232, 163, 61, 0.2);
      position: relative;
    }
    .copy-hint {
      font-size: 12px;
      color: #8b949e;
      text-align: center;
      margin-top: 8px;
      font-style: italic;
    }
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #E8A33D;
      padding: 20px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .info-box h3 {
      color: #92400e;
      font-size: 16px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .info-box ul {
      color: #92400e;
      padding-left: 20px;
      font-size: 14px;
    }
    .info-box li {
      margin-bottom: 8px;
    }
    .warning-box {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .warning-box p {
      color: #991b1b;
      font-size: 14px;
      margin: 0;
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
      <h2>Password Reset Request</h2>

      <p>Hi ${firstName},</p>

      <p>We received a request to reset your password for your ${appName} account. Use the following 6-digit code to reset your password:</p>

      <div class="code-box">${resetCode}</div>
      <div class="copy-hint">💡 Tip: You can copy and paste this code directly</div>

      <div class="info-box">
        <h3>Important Information:</h3>
        <ul>
          <li>This code will expire on: <strong>${formattedExpiry}</strong></li>
          <li>If you didn't request this code, please ignore this email</li>
          <li>Never share this code with anyone</li>
          <li>The code is case-sensitive</li>
        </ul>
      </div>

      <div class="warning-box">
        <p><strong>Security Notice:</strong> Selfless CE will never ask for your password or reset code via phone or email. If you receive such a request, please report it immediately.</p>
      </div>

      <div class="contact-info">
        <p><strong>Need Help?</strong></p>
        <p>If you have any issues or didn't request this password reset, please contact your tech center administrator at:</p>
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
