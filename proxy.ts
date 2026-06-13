// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register'];

// Admin-only routes
const ADMIN_ROUTES = ['/dashboard/admin', '/admin'];

// Teacher-only routes (admin can also access)
const TEACHER_ROUTES = ['/dashboard/teachers'];

// Check if a path is in a list of routes
function isRouteInList(pathname: string, routes: string[]): boolean {
  return routes.some(route => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Skip proxy for static files (images, videos, fonts, etc.)
  const staticFileExtensions = ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  if (staticFileExtensions.some(ext => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  const isPublicRoute = isRouteInList(pathname, PUBLIC_ROUTES);
  const isAdminRoute = isRouteInList(pathname, ADMIN_ROUTES);
  const isTeacherRoute = isRouteInList(pathname, TEACHER_ROUTES);

  console.log('[Proxy] Path:', pathname, 'Has token:', !!token, 'Is public:', isPublicRoute);

  // If no token and trying to access protected route, redirect to login with return URL
  if (!token && !isPublicRoute) {
    console.log('[Proxy] No token, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users to access login/register pages (no redirect)

  // Verify token and check roles for protected routes
  if (token && !isPublicRoute) {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      // Token is invalid or expired, clear cookie and redirect to login
      console.log('[Proxy] Invalid token on protected route, redirecting to login');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // ✅ Fetch user role from database for authorization
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { role: { select: { name: true } } }
      });

      if (!user) {
        // User not found, clear cookie and redirect to login
        console.log('[Proxy] User not found, redirecting to login');
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      const userRole = user.role?.name;

      // Check admin routes - only admin can access
      if (isAdminRoute && userRole !== 'admin') {
        console.log('[Proxy] Not admin, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Check teacher routes - only teacher or admin can access
      if (isTeacherRoute && userRole !== 'teacher' && userRole !== 'admin') {
        console.log('[Proxy] Not teacher or admin, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('[Proxy] Role check failed:', error);
      // On error, redirect to login for safety
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log('[Proxy] Allowing request to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (we handle auth separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
  // Skip static files by checking extensions in the proxy function itself
};