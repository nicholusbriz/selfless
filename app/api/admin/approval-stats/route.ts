// app/api/admin/approval-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const user = await requireAuth();
    
    if (!user || (user.role?.name !== 'admin' && user.role?.name !== 'super_admin' && user.role?.name !== 'dev')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Fetch all approved users with their approver information
    const approvedUsers = await prisma.user.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isVerified: true,
        verifiedById: {
          not: null,
        },
      },
      include: {
        verifiedByAdmin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              select: {
                name: true,
                displayName: true,
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
        verifiedAt: 'desc',
      },
    });

    // Group by approver and count approvals
    const approvalStats = new Map<string, {
      approver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: {
          name: string;
          displayName: string;
        } | null;
        techCenter: {
          id: string;
          name: string;
          code: string;
        } | null;
      };
      approvalCount: number;
      lastApprovalAt: string | null;
      approvedUsers: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        verifiedAt: string | null;
        techCenter: {
          id: string;
          name: string;
          code: string;
        } | null;
      }>;
    }>();

    approvedUsers.forEach((user) => {
      if (!user.verifiedById || !user.verifiedByAdmin) return;

      const approverId = user.verifiedById;
      const existing = approvalStats.get(approverId);

      if (existing) {
        existing.approvalCount += 1;
        if (user.verifiedAt && (!existing.lastApprovalAt || new Date(user.verifiedAt) > new Date(existing.lastApprovalAt))) {
          existing.lastApprovalAt = user.verifiedAt.toISOString();
        }
        existing.approvedUsers.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : null,
          techCenter: user.techCenter,
        });
      } else {
        approvalStats.set(approverId, {
          approver: user.verifiedByAdmin,
          approvalCount: 1,
          lastApprovalAt: user.verifiedAt ? user.verifiedAt.toISOString() : null,
          approvedUsers: [
            {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : null,
              techCenter: user.techCenter,
            },
          ],
        });
      }
    });

    // Convert to array and sort by approval count (descending)
    const statsArray = Array.from(approvalStats.values()).sort(
      (a, b) => b.approvalCount - a.approvalCount
    );

    return NextResponse.json({
      totalApprovals: approvedUsers.length,
      totalApprovers: statsArray.length,
      stats: statsArray,
    });
  } catch (error) {
    console.error('Fetch approval stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval statistics' },
      { status: 500 }
    );
  }
}
