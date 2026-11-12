import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { isJsonObject } from '@/lib/api-response';
import {
  createHeartRequest,
  getHeartSharingState,
  HeartShareError,
} from '@/lib/trivia/heart-sharing-server';

function errorResponse(error: unknown) {
  if (error instanceof HeartShareError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status },
    );
  }
  if (error instanceof Error && error.message === 'Unauthorized') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  console.error('Trivia heart request error:', error);
  return NextResponse.json(
    { success: false, error: 'Something went wrong. Please try again.' },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({
      success: true,
      ...(await getHeartSharingState(user.id)),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body: unknown = await request.json().catch(() => null);
    if (
      !isJsonObject(body) ||
      typeof body.donorId !== 'string' ||
      !/^[a-f\d]{24}$/i.test(body.donorId)
    ) {
      return NextResponse.json(
        { success: false, error: 'A valid player is required.' },
        { status: 400 },
      );
    }
    await createHeartRequest(user.id, body.donorId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
