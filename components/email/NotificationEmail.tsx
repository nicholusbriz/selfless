// components/email/NotificationEmail.tsx
/**
 * Notification Email Template — Selfless CE brand
 * Uses the exact colour palette from the public-facing site.
 *
 * Colours sourced from header-2.tsx COLORS constant:
 *   navy       #12203B  navyDeep  #0D182C
 *   brass      #B98A3E  brassLight #E8A33D  brassBright #F0B85C
 *   page       #F1F1EC  surface   #FAFAF7
 *   border     #DADCD3  muted     #6B7268
 */

export interface NotificationEmailProps {
  recipientName: string;
  /** e.g. "Good morning, John Doe" — computed by the server at send time */
  greeting: string;
  subject: string;
  message: string;
  /** Label shown above the subject line, e.g. "Message from the Director" */
  senderLabel?: string;
  appName?: string;
  supportEmail?: string;
  domain?: string;
}

export function NotificationEmail({
  recipientName,
  greeting,
  subject,
  message,
  senderLabel = 'Message from the Director',
  appName = 'Selfless CE Student Portal',
  supportEmail = 'turyamurebanicholus@gmail.com',
  domain = 'https://www.selflessstudentportal.org',
}: NotificationEmailProps) {
  // Escape the message so newlines become <br> tags in the HTML output
  const messageHtml = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  const displayDomain = domain.replace('https://', '').replace('http://', '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${subject} — Selfless CE</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    /* ── Reset ── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   'Helvetica Neue', Arial, sans-serif;
      background-color: #F1F1EC;
      color: #1F2937;
      -webkit-font-smoothing: antialiased;
      padding: 32px 16px 48px;
    }
    a { color: inherit; text-decoration: none; }
    img { border: 0; display: block; max-width: 100%; }

    /* ── Outer wrapper ── */
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    /* ── Card ── */
    .card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 4px 24px rgba(13, 24, 44, 0.10),
        0 1px 4px  rgba(13, 24, 44, 0.06);
    }

    /* ──────────────────────────────────────
       HEADER (compact — no logo mark, no glow padding)
    ────────────────────────────────────── */
    .header {
      background-color: #0D182C;
      position: relative;
      overflow: hidden;
    }
    /* Gold shimmer line across the very top */
    .header-shimmer {
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent   0%,
        #E8A33D      40%,
        #F0B85C      60%,
        transparent 100%
      );
    }
    .header-inner {
      position: relative;
      z-index: 1;
      padding: 14px 36px 12px;
    }
    .logo-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.2px;
      line-height: 1.2;
    }
    .logo-sub {
      font-size: 10.5px;
      color: rgba(255, 255, 255, 0.42);
      margin-top: 1px;
      letter-spacing: 0.02em;
    }

    /* ──────────────────────────────────────
       SUBJECT STRIP
    ────────────────────────────────────── */
    .subject-strip {
      background-color: #12203B;
      border-top: 1px solid rgba(232, 163, 61, 0.14);
      padding: 14px 36px 16px;
    }
    .subject-label {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #E8A33D;
      margin-bottom: 5px;
    }
    .subject-dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: #E8A33D;
      box-shadow: 0 0 7px #E8A33D;
      flex-shrink: 0;
    }
    .subject-title {
      font-size: 19px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
      letter-spacing: -0.3px;
    }

    /* ──────────────────────────────────────
       BODY
    ────────────────────────────────────── */
    .body {
      padding: 26px 36px 22px;
      background-color: #ffffff;
    }

    /* Time-of-day greeting block */
    .greeting-block {
      margin-bottom: 20px;
      padding-bottom: 18px;
      border-bottom: 1px solid #DADCD3;
    }
    .greeting-time {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #B98A3E;
      margin-bottom: 4px;
    }
    .greeting-name {
      font-size: 22px;
      font-weight: 700;
      color: #0D182C;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }

    /* Message card */
    .message-card {
      background-color: #FAFAF7;
      border: 1px solid #DADCD3;
      border-radius: 12px;
      padding: 20px 22px 20px 26px;
      margin-bottom: 22px;
      position: relative;
      overflow: hidden;
    }
    /* Gold left accent bar */
    .message-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #E8A33D 0%, #B98A3E 100%);
      border-radius: 0 2px 2px 0;
    }
    .message-text {
      font-size: 15px;
      color: #1F2937;
      line-height: 1.78;
    }

    /* Divider */
    .divider {
      height: 1px;
      background-color: #DADCD3;
      margin: 22px 0;
    }

    /* Visit card (replaces help card) */
    .visit-card {
      display: flex;
      align-items: center;
      gap: 13px;
      background-color: rgba(232, 163, 61, 0.06);
      border: 1px solid rgba(232, 163, 61, 0.22);
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 22px;
    }
    .visit-icon-wrap {
      width: 30px;
      height: 30px;
      background-color: rgba(232, 163, 61, 0.14);
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      vertical-align: middle;
    }
    .visit-content { display: inline-block; vertical-align: middle; }
    .visit-title {
      font-size: 12px;
      font-weight: 700;
      color: #0D182C;
      margin-bottom: 2px;
      letter-spacing: 0.01em;
    }
    .visit-text {
      font-size: 12.5px;
      color: #6B7268;
      line-height: 1.5;
    }
    .visit-text a {
      color: #B98A3E;
      font-weight: 600;
      text-decoration: none;
    }

    .sign-off {
      font-size: 13.5px;
      color: #6B7268;
      line-height: 1.65;
    }
    .sign-off strong { color: #12203B; }

    /* ──────────────────────────────────────
       FOOTER (compact)
    ────────────────────────────────────── */
    .footer {
      background-color: #0D182C;
      padding: 14px 36px;
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .footer-domain {
      font-size: 11.5px;
      color: rgba(255, 255, 255, 0.45);
    }
    .footer-right {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.28);
      text-align: right;
      line-height: 1.5;
    }

    /* ── Responsive ── */
    @media only screen and (max-width: 480px) {
      body { padding: 16px 8px 32px; }
      .header-inner,
      .subject-strip,
      .body,
      .footer { padding-left: 20px; padding-right: 20px; }
      .subject-title { font-size: 17px; }
      .message-card { padding: 18px 18px 18px 22px; }
      .footer-inner { flex-direction: column; align-items: flex-start; gap: 8px; }
      .footer-right { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="card">

      <!-- ── HEADER (compact) ── -->
      <div class="header">
        <div class="header-shimmer"></div>
        <div class="header-inner">
          <div class="logo-name">Selfless CE</div>
          <div class="logo-sub">Student Self-Service Portal</div>
        </div>
      </div>

      <!-- ── SUBJECT STRIP ── -->
      <div class="subject-strip">
        <div class="subject-label">
          <span class="subject-dot"></span>
          ${senderLabel}
        </div>
        <div class="subject-title">${subject}</div>
      </div>

      <!-- ── BODY ── -->
      <div class="body">

        <div class="greeting-block">
          <div class="greeting-time">${greeting.split(',')[0]},</div>
          <div class="greeting-name">${recipientName}</div>
        </div>

        <div class="message-card">
          <p class="message-text">${messageHtml}</p>
        </div>

        <div class="visit-card">
          <div class="visit-icon-wrap">
            <!-- Globe icon inline SVG -->
            <svg width="14" height="14" viewBox="0 0 24 24"
                 fill="none" stroke="#B98A3E"
                 stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
                 aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/>
            </svg>
          </div>
          <div class="visit-content">
            <div class="visit-title">Visit our portal</div>
            <div class="visit-text">
              Access your dashboard, resources, and updates at
              <a href="${domain}">${displayDomain}</a>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <p class="sign-off">
          Thank you for being part of the <strong>Selfless CE community</strong>.<br>
          This message was sent to you by a Director via the official portal.
        </p>

      </div>

      <!-- ── FOOTER ── -->
      <div class="footer">
        <div class="footer-inner">
          <span class="footer-domain">${displayDomain}</span>
          <div class="footer-right">
            <div>© 2026 Selfless CE</div>
            <div>All rights reserved</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`.trim();
}