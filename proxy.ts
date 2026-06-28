import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/jwt-edge';

const protectedRoutes = {
  '/dashboard/overview': ['student', 'teacher', 'admin'],
  '/dashboard/profile': ['student', 'teacher', 'admin'],
  '/dashboard/settings': ['student', 'teacher', 'admin'],
  '/dashboard/student': ['student', 'teacher', 'admin'],
  '/dashboard/teachers': ['teacher', 'admin'],
  '/dashboard/admin': ['admin'],
};

// Define protected API routes and their required roles
const protectedApiRoutes = {
  '/api/admin/students': ['student', 'teacher', 'admin'],
  '/api/admin/teachers': ['student', 'teacher', 'admin'],
  '/api/admin': ['admin'],
  '/api/teacher/assignments': ['student', 'teacher', 'admin'],
  '/api/teacher': ['teacher', 'admin'],
  '/api/student': ['student', 'teacher', 'admin'],
  '/api/cleaning': ['student', 'teacher', 'admin'],
};

const publicRoutes = ['/login', '/register'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/contact', '/api/debug', '/api/youtube'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Allow home page immediately (NO redirects)
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

    // Verify token using edge-compatible function
    try {
      const decoded = await verifyTokenEdge(token);
      if (!decoded || !decoded.userId) {
        const response = NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid token' },
          { status: 401 }
        );
        response.cookies.delete('token');
        return response;
      }

      // Get role from token
      const userRole = decoded.role || null;
      
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      if (userRole) {
        requestHeaders.set('x-user-role', userRole);
      }

      // Check role-based access for API routes
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
      const response = NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid token' },
        { status: 401 }
      );
      response.cookies.delete('token');
      return response;
    }
  }

  // Handle public routes (login/register)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    // ✅ Don't redirect authenticated users from login/register
    // Just allow access and let the client handle it
    return NextResponse.next();
  }

  // Check for protected routes (dashboard pages)
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  if (protectedRoute) {
    if (!token) {
      // ✅ Don't redirect to login, show the page with a message instead
      // Or better, let the client handle it
      return NextResponse.next();
    }

    // Verify token is valid
    try {
      const decoded = await verifyTokenEdge(token);
      if (!decoded || !decoded.userId) {
        // ❌ Don't redirect, just invalidate token and let client handle it
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }

      const userRole = decoded.role || null;
      const allowedRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
      
      if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // ✅ Don't redirect, just show forbidden message on client
        return NextResponse.next();
      }
      
      // Valid token, allow access
      return NextResponse.next();
    } catch (error) {
      // Error verifying token, clear it but don't redirect
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};