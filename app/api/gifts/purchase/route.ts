import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = (await request.json().catch(() => null)) as { giftId?: unknown } | null;
    const giftId = typeof body?.giftId === 'string' ? body.giftId : null;

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

    // Credits = total points earned from trivia sessions minus credits already
    // spent. `user.triviaPoints` is used as the spent-credits ledger since
    // earned points are derived from TriviaGameSession records.
    const [earned, currentUser] = await Promise.all([
      prisma.triviaGameSession.aggregate({
        where: { userId: user.id },
        _sum: { points: true },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { triviaPoints: true },
      }),
    ]);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const credits = (earned._sum.points ?? 0) - Math.max(0, currentUser.triviaPoints);

    if (credits < gift.cost) {
      return NextResponse.json(
        { success: false, error: 'Not enough credits' },
        { status: 400 }
      );
    }

    // Check if user already has this gift
    const existingPurchase = await prisma.giftPurchase.findFirst({
      where: {
        userId: user.id,
        giftId,
      },
    });

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Record credits spent
      await tx.user.update({
        where: { id: user.id },
        data: {
          triviaPoints: {
            set: Math.max(0, currentUser.triviaPoints) + gift.cost,
          },
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
    }, {
      timeout: 20000,
      maxWait: 10000,
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
