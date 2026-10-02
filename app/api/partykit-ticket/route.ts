import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { createPartyTicket } from '@/lib/partykit-ticket';

export async function GET() {
  try {
    const user = await requireAuth();
    const secret = process.env.PARTYKIT_SYNC_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'PartyKit sync is not configured' },
        { status: 503 },
      );
    }

    const ticket = await createPartyTicket(user.id, secret);
    return NextResponse.json(ticket, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Failed to create PartyKit ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create PartyKit ticket' },
      { status: 500 },
    );
  }
}