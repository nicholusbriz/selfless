import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// POST - Create a new video request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { request: requestContent } = body;

    if (!requestContent || typeof requestContent !== 'string' || requestContent.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request content is required' },
        { status: 400 }
      );
    }

    if (requestContent.trim().length > 30) {
      return NextResponse.json(
        { success: false, error: 'Request content must be 30 characters or less' },
        { status: 400 }
      );
    }

    // Create video request with user's tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    const videoRequest = await prisma.videoRequest.create({
      data: {
        userId: session.user.id,
        request: requestContent.trim(),
        techCenterId: user?.techCenterId || null,
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: videoRequest
    });

  } catch (error) {
    console.error('Error creating video request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create video request' },
      { status: 500 }
    );
  }
}

// GET - Fetch all video requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // All users see all requests from all tech centers
    const requests = await prisma.videoRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching video requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video requests' },
      { status: 500 }
    );
  }
}