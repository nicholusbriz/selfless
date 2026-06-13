// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['student', 'teacher', 'admin'],
  '/dashboard/overview': ['student', 'teacher', 'admin'],
  '/dashboard/profile': ['student', 'teacher', 'admin'],
  '/dashboard/settings': ['student', 'teacher', 'admin'],
  '/dashboard/student': ['student', 'teacher', 'admin'],
  '/dashboard/teachers': ['teacher', 'admin'],
  '/dashboard/admin': ['admin'],
};

// Define protected API routes and their required roles
const protectedApiRoutes = {
  '/api/admin': ['admin'],
  '/api/teacher': ['teacher', 'admin'],
  '/api/admin/students': ['student', 'teacher', 'admin'],
  '/api/student': ['student', 'teacher', 'admin'],
  '/api/auth/me': ['student', 'teacher', 'admin'],
};

const publicRoutes = ['/login', '/register'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Allow home page immediately (no checks)
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Check if it's a public API route
    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
    if (isPublicApi) {
      return NextResponse.next();
    }

    // For protected API routes, verify authentication
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    try {
      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid token' },
          { status: 401 }
        );
      }

      // Get role from token (no database call needed!)
      const userRole = decoded.role || null;
      
      // Add user info to headers for API routes to use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      if (userRole) {
        requestHeaders.set('x-user-role', userRole);
      }

      // Check role-based access at proxy level for API routes
      for (const [route, allowedRoles] of Object.entries(protectedApiRoutes)) {
        if (pathname.startsWith(route)) {
          if (!userRole || !allowedRoles.includes(userRole)) {
            return NextResponse.json(
              { error: 'Forbidden', message: `Requires one of these roles: ${allowedRoles.join(', ')}` },
              { status: 403 }
            );
          }
          break;
        }
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  // Handle page routes (excluding home page which is already handled)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard/overview', request.url));
    }
    return NextResponse.next();
  }

  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  if (protectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token is valid and check role for page routes
    try {
      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Get role from token for page access check
      const userRole = decoded.role || null;
      const allowedRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
      
      if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // User doesn't have permission for this page
        return NextResponse.redirect(new URL('/dashboard/overview', request.url));
      }
    } catch (error) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};