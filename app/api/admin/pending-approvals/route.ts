// app/api/admin/pending-approvals/route.ts
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

    // Build where clause based on user role
    let whereClause: any = {
      verificationStatus: 'PENDING',
      isVerified: false,
    };

    // Regular admins can only see registrations from their tech center
    // Super admins and devs can see all registrations
    if (user.role?.name === 'admin' && user.techCenterId) {
      whereClause.techCenterId = user.techCenterId;
    }

    // Fetch users with pending verification status
    const pendingUsers = await prisma.user.findMany({
      where: whereClause,
      include: {
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
    });

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Fetch pending approvals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}