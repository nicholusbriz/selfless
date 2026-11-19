import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function GET() {
  try {
    const user = await requireAuth();

    const receivedGifts = await prisma.giftReceived.findMany({
      where: {
        recipientId: user.id,
      },
      include: {
        gift: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        receivedAt: 'desc',
      },
      take: 50,
    });

    const formattedGifts = receivedGifts.map((gift) => ({
      id: gift.id,
      senderId: gift.senderId,
      senderName: `${gift.sender.firstName} ${gift.sender.lastName}`,
      senderProfileImage: gift.sender.profileImageUrl,
      giftId: gift.giftId,
      giftName: gift.gift.name,
      emoji: gift.gift.emoji,
      message: gift.message,
      receivedAt: gift.receivedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      gifts: formattedGifts,
    });
  } catch (error) {
    console.error('Error fetching received gifts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch received gifts',
      },
      { status: 500 }
    );
  }
}
