import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function GET() {
  try {
    const user = await requireAuth();

    const sentGifts = await prisma.giftSent.findMany({
      where: {
        senderId: user.id,
      },
      include: {
        gift: true,
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 50,
    });

    const formattedGifts = sentGifts.map((gift) => ({
      id: gift.id,
      recipientId: gift.recipientId,
      recipientName: `${gift.recipient.firstName} ${gift.recipient.lastName}`,
      recipientProfileImage: gift.recipient.profileImageUrl,
      giftId: gift.giftId,
      giftName: gift.gift.name,
      emoji: gift.gift.emoji,
      message: gift.message,
      sentAt: gift.sentAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      gifts: formattedGifts,
    });
  } catch (error) {
    console.error('Error fetching sent gifts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sent gifts',
      },
      { status: 500 }
    );
  }
}
