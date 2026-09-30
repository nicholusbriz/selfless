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

    // Store aggregate counters only; don't create one activity log per visit.
    if (
      !path.startsWith('/_next') &&
      !path.startsWith('/api') &&
      !path.includes('.') &&
      !path.startsWith('/favicon') &&
      !path.startsWith('/public')
    ) {
      const sessionToken =
        req.cookies.get('next-auth.session-token')?.value ||
        req.cookies.get('__Secure-next-auth.session-token')?.value;

      let userId = token?.sub as string | undefined;
      if (!userId && sessionToken) {
        try {
          const decoded = jwt.verify(sessionToken, JWT_SECRET) as {
            userId?: string;
            sub?: string;
          };
          userId = decoded.userId || decoded.sub;
        } catch {
          userId = undefined;
        }
      }

      try {
        if (userId) {
          await Promise.all([
            prisma.pageVisitCount.upsert({
              where: { pagePath: path },
              create: { pagePath: path, count: 1 },
              update: { count: { increment: 1 } },
            }),
            prisma.userPageVisitCount.upsert({
              where: {
                userId_pagePath: { userId, pagePath: path },
              },
              create: { userId, pagePath: path, count: 1 },
              update: {
                count: { increment: 1 },
                lastVisitAt: new Date(),
              },
            }),
          ]);
        }
      } catch (error) {
        console.error('Page visit counter error:', error);
      }
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