import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { giftId } = body;

    if (!giftId) {
      return NextResponse.json(
        { success: false, error: 'Gift ID is required' },
        { status: 400 }
      );
    }

    // Get gift details
    const gift = await prisma.gift.findUnique({
      where: { id: giftId },
    });

    if (!gift || !gift.isActive) {
      return NextResponse.json(
        { success: false, error: 'Gift not found or not available' },
        { status: 404 }
      );
    }

    // Check user's credits
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { triviaPoints: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (currentUser.triviaPoints < gift.cost) {
      return NextResponse.json(
        { success: false, error: 'Not enough credits' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credits
      await tx.user.update({
        where: { id: user.id },
        data: {
          triviaPoints: {
            decrement: gift.cost,
          },
        },
      });

      // Check if user already has this gift
      const existingPurchase = await tx.giftPurchase.findFirst({
        where: {
          userId: user.id,
          giftId,
        },
      });

      if (existingPurchase) {
        // Increment quantity
        await tx.giftPurchase.update({
          where: { id: existingPurchase.id },
          data: {
            quantity: {
              increment: 1,
            },
          },
        });
      } else {
        // Create new purchase
        await tx.giftPurchase.create({
          data: {
            userId: user.id,
            giftId,
            quantity: 1,
          },
        });
      }

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error purchasing gift:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to purchase gift',
      },
      { status: 500 }
    );
  }
}
