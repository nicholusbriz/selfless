import { NextRequest, NextResponse } from 'next/server';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isJsonObject(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // ✅ No cast — destructure straight from Record<string, unknown>
    const { correct, total, points, streak } = body;

    if (
      typeof correct !== 'number' ||
      typeof total !== 'number' ||
      typeof points !== 'number' ||
      typeof streak !== 'number'
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // ✅ Basic sanity checks so a hacked client can't send points: 999999
    if (
      correct < 0 ||
      total <= 0 ||
      correct > total ||
      points < 0 ||
      points > total * 20 || // hard ceiling: max ~20 pts/question
      streak < 0 ||
      streak > total ||
      !Number.isInteger(correct) ||
      !Number.isInteger(total) ||
      !Number.isInteger(points) ||
      !Number.isInteger(streak)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Get the session to identify the user
    const sessionResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/session`,
      {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const session: unknown = await sessionResponse.json();

    // ✅ Type-safe session access instead of `session?.user?.id`
    if (
      !isJsonObject(session) ||
      !isJsonObject(session.user) ||
      typeof session.user.id !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Update user's trivia points in database
    await prisma.user.update({
      where: { id: userId },
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