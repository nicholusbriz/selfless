import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';
import { createNotificationForUser } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = (await request.json().catch(() => null)) as {
      recipientId?: unknown;
      giftId?: unknown;
      message?: unknown;
    } | null;
    const recipientId = typeof body?.recipientId === 'string' ? body.recipientId : null;
    const giftId = typeof body?.giftId === 'string' ? body.giftId : null;
    const message = typeof body?.message === 'string' ? body.message : undefined;

    if (!recipientId || !giftId) {
      return NextResponse.json(
        { success: false, error: 'Recipient ID and Gift ID are required' },
        { status: 400 }
      );
    }

    if (recipientId === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot send a gift to yourself' },
        { status: 400 }
      );
    }

    // Read-only checks outside the transaction to keep it short
    const giftPurchase = await prisma.giftPurchase.findFirst({
      where: {
        userId: user.id,
        giftId,
        quantity: {
          gt: 0,
        },
      },
      include: {
        gift: true,
      },
    });

    if (!giftPurchase) {
      return NextResponse.json(
        { success: false, error: 'You do not own this gift' },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Check if sender follows recipient OR recipient follows sender (allow mutual connections)
    const [senderFollowsRecipient, recipientFollowsSender] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: recipientId,
          },
        },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: recipientId,
            followingId: user.id,
          },
        },
      }),
    ]);

    if (!senderFollowsRecipient && !recipientFollowsSender) {
      return NextResponse.json(
        { success: false, error: 'You can only send gifts to people you follow or who follow you' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from gift quantity
      if (giftPurchase.quantity === 1) {
        // Delete the purchase record if quantity will be 0
        await tx.giftPurchase.delete({
          where: { id: giftPurchase.id },
        });
      } else {
        // Decrement quantity
        await tx.giftPurchase.update({
          where: { id: giftPurchase.id },
          data: {
            quantity: {
              decrement: 1,
            },
          },
        });
      }

      // Create GiftSent record
      await tx.giftSent.create({
        data: {
          senderId: user.id,
          recipientId,
          giftId,
          message: message || null,
        },
      });

      // Create GiftReceived record
      await tx.giftReceived.create({
        data: {
          recipientId,
          senderId: user.id,
          giftId,
          message: message || null,
        },
      });

      // Credit the recipient's inventory so they can re-send/forward the gift
      const recipientPurchase = await tx.giftPurchase.findFirst({
        where: { userId: recipientId, giftId },
      });
      if (recipientPurchase) {
        await tx.giftPurchase.update({
          where: { id: recipientPurchase.id },
          data: { quantity: { increment: 1 } },
        });
      } else {
        await tx.giftPurchase.create({
          data: { userId: recipientId, giftId, quantity: 1 },
        });
      }

      // Create notification for recipient
      try {
        await createNotificationForUser({
          userId: recipientId,
          title: 'Gift received!',
          message: `Someone sent you a ${giftPurchase.gift.emoji} ${giftPurchase.gift.name}!`,
          type: 'gift_received',
          link: '/dashboard',
          generatedBy: user.id,
          entityType: 'gift',
          entityId: giftId,
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Don't fail the transaction if notification fails
      }

      return { success: true };
    }, {
      timeout: 20000,
      maxWait: 10000,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending gift:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send gift';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}
