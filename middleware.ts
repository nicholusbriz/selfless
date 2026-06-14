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
  '/api/admin': ['admin'],
  '/api/teacher': ['teacher', 'admin'],
  '/api/admin/students': ['student', 'teacher', 'admin'],
  '/api/student': ['student', 'teacher', 'admin'],
};

const publicRoutes = ['/login', '/register'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/contact', '/api/debug', '/api/youtube'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow home page immediately (no checks)
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  console.log('🔍 Middleware: Token present:', !!token, 'Token length:', token?.length);

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

  // Handle page routes
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // For public routes (login/register), check if user is already authenticated
  if (isPublicRoute) {
    if (token) {
      console.log('🔒 Middleware: User on public route with token, verifying...');
      // Verify if token is still valid
      try {
        const decoded = await verifyTokenEdge(token);
        if (decoded && decoded.userId) {
          console.log('✅ Middleware: Valid token, redirecting to dashboard');
          // Valid token, redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard/overview', request.url));
        } else {
          console.log('❌ Middleware: Invalid token, clearing it');
          // Invalid token, clear it and allow access to login
          const response = NextResponse.next();
          response.cookies.delete('token');
          return response;
        }
      } catch (error) {
        console.log('❌ Middleware: Token verification error, clearing it');
        // Invalid token, clear it and allow access to login
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }
    }
    return NextResponse.next();
  }

  // Check for protected routes
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  if (protectedRoute) {
    if (!token) {
      console.log('❌ Middleware: No token on protected route, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token is valid using edge-compatible function
    try {
      console.log('🔍 Middleware: Attempting to verify token...');
      const decoded = await verifyTokenEdge(token);
      console.log('🔍 Middleware: Decoded token:', decoded);
      if (!decoded || !decoded.userId) {
        console.log('❌ Middleware: Invalid token on protected route, redirecting to login');
        // Invalid token, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      const userRole = decoded.role || null;
      const allowedRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
      
      if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        console.log('❌ Middleware: User role', userRole, 'not allowed for', protectedRoute);
        // User doesn't have permission, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('🔍 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes (length: ' + process.env.JWT_SECRET.length + ')' : 'NO!');
      
      console.log('✅ Middleware: Valid token for protected route, allowing access');
      // Valid token, allow access
      return NextResponse.next();
    } catch (error) {
      console.log('❌ Middleware: Token verification error on protected route:', error);
      // Error verifying token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
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