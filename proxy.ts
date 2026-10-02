
// proxy.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Always allow NextAuth routes
    if (path.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // If authenticated and tries to access home, let them stay
    if (path === '/' && token) {
      return NextResponse.next();
    }

    // If authenticated and tries to access login/register, redirect to dashboard
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

        if (path.startsWith('/api/auth')) return true;
        if (!path.startsWith('/dashboard')) return true;

        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|sw.js|manifest.json|freedom.png).*)',
  ],
};