// app/api/user/heartbeat/route.ts
/**
 * Lightweight heartbeat endpoint.
 *
 * Fired periodically by useActivityTracker() and on tab-visibility changes.
 * Just updates the user's lastActiveAt timestamp — no page-visit logging.
 *
 * Hardened against Prisma P2034 (write conflict) by:
 *   1. In-memory per-user throttle (dedupes multi-tab spam within one process)
 *   2. updateMany instead of update (avoids the row-return write-conflict path)
 *   3. Silently swallowing P2034 / P2025 (both are expected under load)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

// ---------------------------------------------------------------------------
// In-process throttle — one write per user per interval
// ---------------------------------------------------------------------------

const MIN_INTERVAL_MS = 20_000; // 20 seconds
const lastWriteByUser = new Map<string, number>();

// Prune stale entries so the map doesn't grow forever (runs occasionally)
function pruneThrottleMap(now: number) {
  if (lastWriteByUser.size < 5000) return;
  for (const [id, ts] of lastWriteByUser) {
    if (now - ts > MIN_INTERVAL_MS * 10) {
      lastWriteByUser.delete(id);
    }
  }
}

// ---------------------------------------------------------------------------

export async function POST() {
  try {
    const user = await getServerAuthUser();

    if (!user) {
      // Not logged in — silently succeed
      return NextResponse.json({ success: true });
    }

    const now = Date.now();
    const last = lastWriteByUser.get(user.id) ?? 0;

    // Throttle: skip if we wrote recently for this user
    if (now - last < MIN_INTERVAL_MS) {
      return NextResponse.json({ success: true, skipped: true });
    }

    lastWriteByUser.set(user.id, now);
    pruneThrottleMap(now);

    // Fire-and-forget. Don't make the client wait for this.
    // updateMany avoids the write-conflict path that `update` hits.
    void prisma.user
      .updateMany({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      })
      .catch((err) => {
        // P2034 = write conflict / deadlock — expected under load, safe to ignore
        // P2025 = record not found — user was deleted mid-flight, also fine
        if (err?.code !== 'P2034' && err?.code !== 'P2025') {
          console.warn('[heartbeat] update failed:', err);
        }
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    // Never break the client
    return NextResponse.json({ success: true });
  }
}