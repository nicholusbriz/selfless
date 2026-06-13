import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Helper function to get authenticated user from request headers
 * Relies on proxy middleware to set x-user-id header
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  return user;
}

/**
 * Helper function to check if user has required role
 */
export function hasRole(user: any, requiredRoles: string[]): boolean {
  if (!user?.role?.name) return false;
  return requiredRoles.includes(user.role.name);
}

/**
 * Helper function to require authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return { user };
}

/**
 * Helper function to require specific role
 */
export async function requireRole(request: NextRequest, requiredRoles: string[]) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!hasRole(user, requiredRoles)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return { user };
}
