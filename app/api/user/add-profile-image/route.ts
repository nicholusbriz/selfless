import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImageUrls: true },
    });

    const existingUrls = currentUser?.profileImageUrls || [];

    // Check if URL already exists
    if (existingUrls.includes(imageUrl)) {
      return NextResponse.json(
        { error: 'Image already in profile gallery' },
        { status: 400 }
      );
    }

    // Add new image to the array
    const updatedUrls = [...existingUrls, imageUrl];

    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrls: updatedUrls },
    });

    return NextResponse.json({
      success: true,
      profileImageUrls: updatedUrls,
    });
  } catch (error) {
    console.error('Add profile image error:', error);
    return NextResponse.json(
      { error: 'Failed to add profile image' },
      { status: 500 }
    );
  }
}
