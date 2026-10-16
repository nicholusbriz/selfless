# Email Providers with Free Tiers

## Current Setup
- **Provider:** Resend
- **Free Tier:** 100 emails/day, 3,000 emails/month
- **Upgrade:** Pro plan at $20/month for 50,000 emails/month

## Alternative Email Providers

### 1. SendGrid (Twilio)
- **Free Tier:** 100 emails/day forever
- **Paid Plans:** Starting at $15/month for up to 40,000 emails
- **Pros:** Reliable, good deliverability, detailed analytics
- **Cons:** Lower daily limit on free tier
- **Website:** https://sendgrid.com/

### 2. Mailgun
- **Free Tier:** 5,000 emails/month for 3 months (trial)
- **Paid Plans:** Starting at $35/month for "Foundation" plan
- **Pros:** Powerful API, good documentation
- **Cons:** Free tier is time-limited
- **Website:** https://www.mailgun.com/

### 3. Amazon SES (Simple Email Service)
- **Free Tier:** 62,000 emails/month (12 months for new AWS accounts)
- **Paid Plans:** $0.10 per 1,000 emails after free tier
- **Pros:** Very cheap at scale, highly reliable
- **Cons:** Higher learning curve, requires AWS account
- **Website:** https://aws.amazon.com/ses/

### 4. Brevo (formerly Sendinblue)
- **Free Tier:** 300 emails/day forever
- **Paid Plans:** Starting at $25/month for 20,000 emails/month
- **Pros:** Higher daily limit, good UI
- **Cons:** Paid plans are expensive
- **Website:** https://www.brevo.com/

### 5. Mailjet
- **Free Tier:** 200 emails/day forever
- **Paid Plans:** Starting at $15/month for 15,000 emails/month
- **Pros:** Easy to use, good free tier
- **Cons:** Analytics limited on free tier
- **Website:** https://www.mailjet.com/

### 6. Postmark
- **No Free Tier** - $10/month for 10,000 emails
- **Pros:** Excellent deliverability, transactional email focus
- **Cons:** No free option
- **Website:** https://postmarkapp.com/

### 7. SparkPost
- **Free Tier:** 500 emails/day for 30 days (trial)
- **Paid Plans:** Starting at $20/month for 10,000 emails/month
- **Pros:** Good analytics
- **Cons:** Free tier is trial only
- **Website:** https://www.sparkpost.com/

## Recommendations

### For Low Volume (< 100 emails/day)
- **Resend** (current) - 100/day, modern API
- **Brevo** - 300/day, better free tier
- **Mailjet** - 200/day, easy setup

### For Medium Volume (100-500 emails/day)
- **Brevo** - 300/day on free tier
- **Amazon SES** - Very cheap after free tier
- **SendGrid** - Upgrade to paid plan

### For High Volume (500+ emails/day)
- **Amazon SES** - Best price at scale
- **SendGrid** - Good deliverability
- **Mailgun** - Powerful features

## How to Switch Providers

1. Create account with new provider
2. Get API key
3. Update environment variables:
   - `EMAIL_PROVIDER` (e.g., "sendgrid", "mailgun", "ses")
   - `SENDGRID_API_KEY` or `MAILGUN_API_KEY` etc.
4. Update `lib/email.ts` to support multiple providers
5. Test with sample emails
6. Deploy to production

## Configuration Example

```bash
# In .env
EMAIL_PROVIDER="resend" # or "sendgrid", "mailgun", "ses", "brevo"

# Resend
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="info@selflessstudentportal.org"

# SendGrid (if switching)
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="info@selflessstudentportal.org"

# Brevo (if switching)
BREVO_API_KEY="xkeysib-xxx"
BREVO_FROM_EMAIL="info@selflessstudentportal.org"
```

## Cost Comparison (per month)

| Provider | Free Tier | Paid Tier (entry) | Cost |
|----------|-----------|-------------------|------|
| Resend | 3,000/month | 50,000/month | $20 |
| SendGrid | 3,000/month | 40,000/month | $15 |
| Brevo | 9,000/month | 20,000/month | $25 |
| Mailjet | 6,000/month | 15,000/month | $15 |
| Amazon SES | 62,000/month (12mo) | Pay as you go | $0.10/1k |
| Mailgun | 5,000/month (3mo) | 5,000/month | $35 |
