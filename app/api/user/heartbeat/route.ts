// app/api/user/heartbeat/route.ts
/**
 * Lightweight heartbeat endpoint.
 *
 * Fired periodically by useActivityTracker() and on tab-visibility changes.
 * Just updates the user's lastActiveAt timestamp — no page-visit logging.
 *
 * Uses the shared last-active updater to dedupe concurrent writes and retry
 * transient Prisma P2034 write conflicts.
 */

import { NextResponse } from 'next/server';
import { getServerAuthUser } from '@/lib/auth/server';
import { updateUserLastActiveAt } from '@/lib/user-activity';

export async function POST() {
  try {
    const user = await getServerAuthUser();

    if (!user) {
      // Not logged in — silently succeed
      return NextResponse.json({ success: true });
    }

    updateUserLastActiveAt(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    // Never break the client
    return NextResponse.json({ success: true });
  }
}