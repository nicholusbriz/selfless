import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function GET() {
  try {
    const user = await requireAuth();

    const inventory = await prisma.giftPurchase.findMany({
      where: {
        userId: user.id,
        quantity: {
          gt: 0,
        },
      },
      include: {
        gift: true,
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    const formattedInventory = inventory.map((item) => ({
      id: item.id,
      giftId: item.giftId,
      giftName: item.gift.name,
      emoji: item.gift.emoji,
      quantity: item.quantity,
      cost: item.gift.cost,
      description: item.gift.description,
      purchasedAt: item.purchasedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      inventory: formattedInventory,
    });
  } catch (error) {
    console.error('Error fetching gift inventory:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gift inventory',
      },
      { status: 500 }
    );
  }
}
