import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

const MAX_ROWS = 500;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 'super_admin' && session.user.role !== 'dev')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSelect = {
      id: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
    } as const;

    const [purchases, sent] = await Promise.all([
      prisma.giftPurchase.findMany({
        orderBy: { purchasedAt: 'desc' },
        take: MAX_ROWS,
        include: {
          user: { select: userSelect },
          gift: { select: { cost: true } },
        },
      }),
      prisma.giftSent.findMany({
        orderBy: { sentAt: 'desc' },
        take: MAX_ROWS,
        include: {
          sender: { select: userSelect },
          recipient: { select: { firstName: true, lastName: true } },
          gift: { select: { id: true } },
        },
      }),
    ]);

    // Aggregate per user — no duplicate names
    const byUser = new Map<
      string,
      {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          profileImageUrl: string | null;
        };
        purchases: number;
        creditsSpent: number;
        sentCount: number;
        recipients: string[];
        lastActivity: string;
      }
    >();

    const ensure = (u: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    }) => {
      let entry = byUser.get(u.id);
      if (!entry) {
        entry = {
          user: u,
          purchases: 0,
          creditsSpent: 0,
          sentCount: 0,
          recipients: [],
          lastActivity: '',
        };
        byUser.set(u.id, entry);
      }
      return entry;
    };

    for (const p of purchases) {
      const e = ensure(p.user);
      e.purchases += p.quantity;
      e.creditsSpent += p.gift.cost * p.quantity;
      const d = p.purchasedAt.toISOString();
      if (d > e.lastActivity) e.lastActivity = d;
    }
    for (const g of sent) {
      const e = ensure(g.sender);
      e.sentCount += 1;
      const name = `${g.recipient.firstName} ${g.recipient.lastName}`.trim();
      if (name && !e.recipients.includes(name)) e.recipients.push(name);
      const d = g.sentAt.toISOString();
      if (d > e.lastActivity) e.lastActivity = d;
    }

    const activity = Array.from(byUser.values()).sort((a, b) =>
      b.lastActivity.localeCompare(a.lastActivity),
    );

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Gift activity failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load gift activity' },
      { status: 500 },
    );
  }
}
