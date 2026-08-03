import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { logAIChatUsage } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, techCenterId, details } = body;

    // Verify the user is logging their own usage
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Log the AI chat usage
    await logAIChatUsage(userId, techCenterId, details || {
      messageCount: 1,
      firstMessage: 'Chat opened'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log AI usage:', error);
    return NextResponse.json(
      { error: 'Failed to log usage' },
      { status: 500 }
    );
  }
}