// app/api/dev/invalidate-sessions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';
import {
  invalidJsonBodyResponse,
  isString,
  nullable,
  optional,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

export async function POST(request: Request) {
  try {
    // Only allow super_admin, admin, or dev roles
    const user = await getServerAuthUser();
    if (!user || !user.role?.name || !['super_admin', 'admin', 'dev'].includes(user.role.name)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await parseJsonBody(request, {
      techCenterId: optional(nullable(isString)),
    });
    if (!body) return invalidJsonBodyResponse();
    const { techCenterId } = body;

    // Invalidate sessions by incrementing tokenVersion
    let result;
    if (techCenterId) {
      // Invalidate sessions for specific tech center
      result = await prisma.user.updateMany({
        where: {
          techCenterId,
          isActive: true,
        },
        data: {
          tokenVersion: {
            increment: 1,
          },
        },
      });
    } else {
      // Invalidate sessions for all tech centers
      result = await prisma.user.updateMany({
        where: {
          isActive: true,
        },
        data: {
          tokenVersion: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: techCenterId
        ? `Invalidated sessions for ${result.count} users in tech center`
        : `Invalidated sessions for ${result.count} users across all tech centers`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error invalidating sessions:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate sessions' },
      { status: 500 }
    );
  }
}
