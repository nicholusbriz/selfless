import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { imageUrl } = (await request.json()) as {
      imageUrl?: string;
    };

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

    // Check if URL exists in the gallery
    if (!existingUrls.includes(imageUrl)) {
      return NextResponse.json(
        { error: 'Image not found in profile gallery' },
        { status: 400 }
      );
    }

    // Set as current profile image
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: imageUrl },
    });

    return NextResponse.json({
      success: true,
      profileImageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Set profile image error:', error);
    return NextResponse.json(
      { error: 'Failed to set profile image' },
      { status: 500 }
    );
  }
}
