// proxy.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export default withAuth(
  async function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ✅ ALWAYS allow NextAuth routes to pass through
    if (path.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // ✅ If user is authenticated and tries to access home, LET THEM STAY
    if (path === '/' && token) {
      return NextResponse.next(); // ← This is the key change
    }

    // ✅ If user is authenticated and tries to access login/register, redirect to dashboard
    if ((path === '/login' || path === '/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Only protect dashboard routes
    if (path.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Activity logging - track page visits
    // Skip tracking for static assets, API routes, etc.
    if (
      !path.startsWith('/_next') &&
      !path.startsWith('/api') &&
      !path.includes('.') &&
      !path.startsWith('/favicon') &&
      !path.startsWith('/public')
    ) {
      // Get session token
      const sessionToken =
        req.cookies.get('next-auth.session-token')?.value ||
        req.cookies.get('__Secure-next-auth.session-token')?.value;

      // Get user ID from JWT token (since we're using JWT strategy)
      let userId: string | null = null;
      let techCenterId: string | null = null;

      if (token) {
        // User is authenticated via NextAuth middleware
        userId = token.sub as string;
        techCenterId = token.techCenterId as string || null;
      } else if (sessionToken) {
        // Fallback: try to decode JWT token directly
        try {
          const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
          if (decoded && decoded.userId) {
            userId = decoded.userId;
            techCenterId = decoded.techCenterId || null;
          }
        } catch (error) {
          // JWT verification failed, user is anonymous
          console.log('JWT verification failed for page:', path);
        }
      }

      try {
        // Log the page visit
        await prisma.activityLog.create({
          data: {
            action: 'page_visit',
            page: path,
            method: req.method,
            entityType: 'page',
            entityId: path,
            ipAddress:
              req.headers.get('x-forwarded-for') ||
              req.headers.get('x-real-ip') ||
              'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
            sessionId: sessionToken || 'anonymous',
            userId: userId,
            techCenterId: techCenterId,
            details: {
              referrer: req.headers.get('referer'),
              query: Object.fromEntries(req.nextUrl.searchParams),
            },
          },
        });
      } catch (error) {
        // Don't block requests if logging fails
        console.error('Activity log error:', error);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // ✅ ALWAYS allow NextAuth routes
        if (path.startsWith('/api/auth')) {
          return true;
        }

        // Allow all routes except dashboard if not authenticated
        if (!path.startsWith('/dashboard')) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // ✅ EXCLUDE /api/auth from middleware entirely
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|sw.js|manifest.json|freedom.png).*)',
  ],
};