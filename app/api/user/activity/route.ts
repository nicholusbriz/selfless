import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthUser } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    // Use the non-throwing getter so a missing session doesn't blow up.
    // requireAuth() throws Error('Unauthorized'), which was landing in the
    // catch block and logging a misleading error on every request that
    // arrived before the credentials callback finished.
    const user = await getServerAuthUser();

    if (!user) {
      // No session yet (e.g. login still in flight) — this is expected,
      // not an error. Return success so callers aren't disrupted.
      return NextResponse.json({ success: true });
    }

    // Page visits are already tracked in the middleware (proxy.ts),
    // so we don't perform any DB writes here. This endpoint is kept
    // for compatibility only.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity tracking error:', error);
    // Activity tracking is non-critical; never break the client.
    return NextResponse.json({ success: true });
  }
}