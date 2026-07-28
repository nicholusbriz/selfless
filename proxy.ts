// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(req) {
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