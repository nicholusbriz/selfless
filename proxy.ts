// proxy.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. If authenticated and tries to access /register, redirect to dashboard
    if (path === '/register' && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // 2. Only protect dashboard routes
    if (path.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith('/api/auth')) return true;
        if (!path.startsWith('/dashboard')) return true;

        return !!token;
      },
    },
  },
);

export const config = {
  // Only run middleware on dashboard routes and the register page
  matcher: [
    '/dashboard/:path*',
    '/register',
  ],
};