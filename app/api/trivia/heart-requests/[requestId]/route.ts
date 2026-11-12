import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { isJsonObject } from '@/lib/api-response';
import {
  HeartShareError,
  respondToHeartRequest,
} from '@/lib/trivia/heart-sharing-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const user = await requireAuth();
    const { requestId } = await params;
    const body: unknown = await request.json().catch(() => null);
    if (
      !/^[a-f\d]{24}$/i.test(requestId) ||
      !isJsonObject(body) ||
      (body.action !== 'accept' && body.action !== 'decline')
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 },
      );
    }
    const result = await respondToHeartRequest(requestId, user.id, body.action);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof HeartShareError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Trivia heart response error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
