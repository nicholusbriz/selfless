// app/api/admin/logs/route.ts
/**
 * ACTIVITY LOGS API ROUTE
 * 
 * Fetches activity logs with filtering capabilities for super admin.
 * Supports filtering by user, tech center, action type, date range, and pagination.
 * 
 * Endpoint: GET /api/admin/logs
 * Query Params:
 *   - userId: Filter by specific user
 *   - techCenterId: Filter by tech center
 *   - action: Filter by action type (login, logout, register, etc.)
 *   - startDate: Filter logs from this date onwards
 *   - endDate: Filter logs up to this date
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 50)
 * Response: { logs: ActivityLog[], pagination: {...} }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth, hasRole } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated and is super admin
    const user = await requireAuth();
    
    if (!hasRole(user, 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const techCenterId = searchParams.get('techCenterId');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (techCenterId) {
      where.techCenterId = techCenterId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch logs with related data
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImageUrl: true,
            },
          },
          techCenter: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Fetch logs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
