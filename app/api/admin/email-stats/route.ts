// app/api/admin/email-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getResendEmailStats } from '@/lib/email-stats';
import { requireAuth } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth();

    if (!user || (user.role?.name !== 'super_admin' && user.role?.name !== 'admin' && user.role?.name !== 'dev')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const stats = await getResendEmailStats();

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch Resend email stats' },
        { status: 500 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Email stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email stats' },
      { status: 500 }
    );
  }
}
