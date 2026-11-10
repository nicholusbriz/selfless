import { NextRequest, NextResponse } from 'next/server';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';

interface SubmitTriviaRequest {
  correct: number;
  total: number;
  points: number;
  streak: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isJsonObject(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const { correct, total, points, streak } = body as SubmitTriviaRequest;

    if (typeof correct !== 'number' || typeof total !== 'number' || typeof points !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
        },
        { status: 400 }
      );
    }

    // Get the session to identify the user
    const sessionResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!sessionResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const session = await sessionResponse.json();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not authenticated',
        },
        { status: 401 }
      );
    }

    // Update user's trivia points in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        triviaPoints: {
          increment: points,
        },
      },
    });

    return NextResponse.json({
      success: true,
      points,
      correct,
      total,
      streak,
      message: `You earned ${points} points!`,
    });
  } catch (error) {
    console.error('Error submitting trivia results:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to submit trivia results'),
      },
      { status: 500 }
    );
  }
}
