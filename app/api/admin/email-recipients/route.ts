// app/api/admin/email-recipients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch users for email recipient selection
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin privileges
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const techCenterId = searchParams.get('techCenterId') || '';
    const role = searchParams.get('role') || '';

    // Build where clause
    const where: any = {
      status: 'ACTIVE', // Only active users
    };

    // Role-based filtering
    if (session.user.role === 'admin') {
      // Admins can only see users in their tech center
      const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { techCenterId: true },
      });

      if (adminUser?.techCenterId) {
        where.techCenterId = adminUser.techCenterId;
      }
    } else if (session.user.role === 'super_admin') {
      // Super admins cannot see dev users
      const devRole = await prisma.role.findUnique({
        where: { name: 'dev' },
        select: { id: true },
      });
      if (devRole) {
        where.roleId = { not: devRole.id };
      }
    }

    // Search across name and email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by tech center
    if (techCenterId) {
      where.techCenterId = techCenterId;
    }

    // Filter by role
    if (role) {
      where.role = { name: role };
    }

    // Fetch users with minimal data for recipient selection
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            name: true,
            displayName: true,
          }
        },
        techCenter: {
          select: {
            name: true,
            code: true,
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    // Filter out users without email addresses
    const filteredUsers = users.filter(user => user.email && user.email.trim() !== '');

    return NextResponse.json({
      users: filteredUsers,
      total: filteredUsers.length,
    });
  } catch (error) {
    console.error('Error fetching email recipients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email recipients' },
      { status: 500 }
    );
  }
}
