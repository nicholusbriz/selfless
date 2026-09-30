// app/api/user/heartbeat/route.ts
/**
 * Lightweight heartbeat endpoint.
 *
 * Fired periodically by useActivityTracker() and on tab-visibility changes.
 * Just updates the user's lastActiveAt timestamp — no page-visit logging.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

export async function POST() {
  try {
    const user = await getServerAuthUser();

    if (!user) {
      // Not logged in — silently succeed
      return NextResponse.json({ success: true });
    }

    // Fire-and-forget. Don't make the client wait for this.
    void prisma.user
      .update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      })
      .catch((err) => {
        console.warn('[heartbeat] update failed:', err);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    // Never break the client
    return NextResponse.json({ success: true });
  }
}