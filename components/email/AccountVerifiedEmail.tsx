// components/email/AccountVerifiedEmail.tsx
/**
 * Account Verified Email Component
 * Generates HTML email template for when a user's account is verified/approved
 */

export interface AccountVerifiedEmailProps {
  firstName: string;
  lastName?: string;
  appName?: string;
  domain?: string;
}

export function AccountVerifiedEmail({
  firstName,
  lastName,
  appName = 'Selfless CE Student Portal',
  domain = 'https://www.selflessstudentportal.org',
}: AccountVerifiedEmailProps) {
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verified - ${appName}</title>
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
    .message-from {
      color: #E8A33D;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    p {
      color: #4a5568;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #0D1117 0%, #1a2332 100%);
      color: #E8A33D;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      box-shadow: 0 4px 12px rgba(232, 163, 61, 0.2);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(232, 163, 61, 0.3);
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">Selfless CE</div>
      <div class="tagline">Student Self-Service Portal</div>
    </div>

    <div class="content">
      <div class="message-from">Message from the Director</div>

      <h2>Your Official Selfless CE Student Portal is Live — Enjoy It!</h2>

      <p>Heloo</p>

      <p>${fullName},</p>

      <p>We are excited to announce that your official Selfless CE Student Portal is fully up and running!</p>

      <p>Everything you need to stay organized, connected, and up to date is now centralized in one easy-to-use platform. Take a moment to log in, explore your dashboard, and make the most of all the features built just for you.</p>

      <p>Enjoy the experience, and let's keep growing together!</p>

      <a href="${domain}" class="cta-button">Visit our portal</a>

      <p>Access your dashboard, resources, and updates at <a href="${domain}" style="color: #E8A33D; text-decoration: underline;">www.selflessstudentportal.org</a></p>

      <div class="info-box">
        <h3>Getting Started:</h3>
        <ul>
          <li>Log in with your registered email and password</li>
          <li>Explore your personalized dashboard</li>
          <li>Access resources and updates</li>
          <li>Connect with your tech center community</li>
        </ul>
      </div>

      <div class="divider"></div>

      <p>Thank you for being part of the Selfless CE community.</p>

      <p><em>This message was sent to you by a Director via the official portal.</em></p>
    </div>

    <div class="footer">
      <p><a href="${domain}">www.selflessstudentportal.org</a></p>
      <p>© 2026 Selfless CE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
