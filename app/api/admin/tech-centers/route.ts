import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logUserAction, extractIpAddress, extractUserAgent } from '@/lib/logger';

// GET - Fetch all tech centers
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is super admin
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const techCenters = await prisma.techCenter.findMany({
      include: {
        country: true,
        users: {
          select: { id: true }
        },
        _count: {
          select: {
            users: true,
            studentCourses: true,
            weeks: true,
            cleaningDays: true,
            announcements: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(techCenters);
  } catch (error) {
    console.error('Error fetching tech centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech centers' },
      { status: 500 }
    );
  }
}

// POST - Create a new tech center
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is super admin
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, code, description, countryId, city, address, phone, email } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCenter = await prisma.techCenter.findUnique({
      where: { code }
    });

    if (existingCenter) {
      return NextResponse.json(
        { error: 'A tech center with this code already exists' },
        { status: 400 }
      );
    }

    // Create tech center
    const techCenter = await prisma.techCenter.create({
      data: {
        name,
        code,
        description,
        countryId: countryId || null,
        city: city || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        isActive: true,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
      include: {
        country: true,
      }
    });

    // Log the tech center creation activity
    await logUserAction(
      session.user.id,
      'create',
      'tech_center',
      techCenter.id,
      { name: techCenter.name, code: techCenter.code },
      techCenter.id
    );

    return NextResponse.json(techCenter, { status: 201 });
  } catch (error) {
    console.error('Error creating tech center:', error);
    return NextResponse.json(
      { error: 'Failed to create tech center' },
      { status: 500 }
    );
  }
}