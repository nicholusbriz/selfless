# OAuth Setup Guide (Google & GitHub)

This guide will walk you through setting up Google and GitHub OAuth login for your application.

## Overview

The application now supports three authentication methods:
1. Email/Password (existing)
2. Google OAuth (new)
3. GitHub OAuth (new)

**Important**: OAuth login requires users to already exist in your database. The system checks if the email from Google/GitHub matches an existing user account. If the user doesn't exist or isn't approved, login will be denied.

---

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top
3. Click "NEW PROJECT" to create a new project
4. Enter a project name (e.g., "Selfless Auth")
5. Click "CREATE"
6. Wait for the project to be created, then select it

### 1.2 Configure OAuth Consent Screen

1. In the left sidebar, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (for any Google account) and click "CREATE"
3. Fill in the required information:
   - **App name**: "Selfless" (or your app name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click "SAVE AND CONTINUE"
5. Skip the "Scopes" section (click "SAVE AND CONTINUE")
6. Add test users (your email) in the "Test users" section
7. Click "SAVE AND CONTINUE" then "BACK TO DASHBOARD"

### 1.3 Enable Google+ API

1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API" (or "Google Identity")
3. Click on it and click "ENABLE"

### 1.4 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. Select application type: "Web application"
4. Name: "Selfless Web Client"
5. **Authorized redirect URIs** (add these):
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Click "CREATE"

### 1.5 Get Your Credentials

After creating the OAuth client, you'll see a popup with:
- **Client ID**: A long string (e.g., `123456789-abc...apps.googleusercontent.com`)
- **Client Secret**: A random string
- **Copy both of these** - you'll need them for your .env file

---

## Step 2: GitHub OAuth Setup

### 2.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: "Selfless Auth" (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)
   - **Application description**: Optional description
   - **Authorization callback URL**:
     - `http://localhost:3000/api/auth/callback/github` (for development)
     - `https://yourdomain.com/api/auth/callback/github` (for production)

### 2.2 Get Your Credentials

After creating the OAuth app, you'll receive:
- **Client ID**: A 20-character string (e.g., `Iv1a1b2c3d4e5f6g7h`)
- **Client Secret**: Click "Generate a new client secret" to get this (40-character string)

---

## Step 3: Add Environment Variables

Create or update your `.env` file in the project root with the following variables:

```env
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_CLIENT_ID=Iv1a1b2c3d4e5f6g7h
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# NextAuth (should already exist)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Where to Find Your Credentials

**Google Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID
5. Click the eye icon to reveal the Client Secret
6. Copy both values

**GitHub Credentials:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. The Client ID is visible on the page
4. Click "Generate a new client secret" to get the Client Secret
5. Copy it immediately (you won't see it again!)

### Generate NEXTAUTH_SECRET

If you don't have a NEXTAUTH_SECRET, generate one using:

```bash
openssl rand -base64 32
```

Or use an online generator like [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

---

## Step 4: Update Production Environment Variables

When deploying to production, update your environment variables with:

```env
# Production URLs
NEXTAUTH_URL=https://yourdomain.com

# Production OAuth Callback URLs
# Google callback should be: https://yourdomain.com/api/auth/callback/google
# GitHub callback should be: https://yourdomain.com/api/auth/callback/github
```

---

## Step 5: Test the OAuth Flow

### 5.1 Test Google Login

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with Google"
4. You'll be redirected to Google's sign-in page
5. Sign in with your Google account
6. If your Google email matches an existing approved user in your database, you'll be logged in
7. If the email doesn't exist or the user isn't approved, login will fail

### 5.2 Test GitHub Login

1. Click "Continue with GitHub"
2. You'll be redirected to GitHub's authorization page
3. Authorize the application
4. If your GitHub email matches an existing approved user in your database, you'll be logged in
5. If the email doesn't exist or the user isn't approved, login will fail

---

## Important Notes

### User Registration Flow

OAuth login is designed for existing users only. New users must:

1. Register through the standard registration form
2. Get approved by an admin (if approval is required)
3. Then they can use OAuth login with the same email

### Email Matching

The system matches users by email address. Ensure that:
- Users register with the same email they use on Google/GitHub
- The email is verified and approved in your database

### Profile Images

When users log in via OAuth:
- Google: The profile picture from Google will be used if available
- GitHub: The avatar from GitHub will be used if available
- These will update the user's `profileImageUrl` in the database

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different OAuth apps** for development and production
3. **Rotate secrets** periodically
4. **Monitor OAuth activity** in your Google Cloud Console and GitHub settings
5. **Restrict OAuth app permissions** to only what's needed

---

## Troubleshooting

### "Access Denied" Error

This occurs when:
- The user's email doesn't exist in the database
- The user exists but isn't verified/approved
- The OAuth credentials are incorrect

**Solution**: Ensure the user is registered and approved with the same email as their OAuth account.

### "Invalid Client" Error

This occurs when:
- Client ID or Client Secret is incorrect
- OAuth app is not configured with the correct redirect URIs

**Solution**: Double-check your environment variables and OAuth app settings.

### Redirect Loop

This occurs when:
- NEXTAUTH_URL is not set correctly
- Callback URLs don't match what's configured in OAuth apps

**Solution**: Ensure NEXTAUTH_URL matches your current domain and callback URLs are exactly as configured.

---

## Next Steps

After setup:

1. Test both Google and GitHub login thoroughly
2. Update your documentation to inform users about OAuth login
3. Consider adding OAuth registration flow (if you want new users to sign up via OAuth)
4. Monitor OAuth usage in your analytics

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
