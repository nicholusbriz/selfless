import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { isJsonObject } from '@/lib/api-response';
import { recordFailedTriviaQuestion } from '@/lib/trivia/daily-hearts-server';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    if (
      !isJsonObject(body) ||
      typeof body.questionId !== 'string' ||
      !/^[a-f\d]{24}$/i.test(body.questionId) ||
      typeof body.failureId !== 'string' ||
      !/^[a-f\d-]{36}$/i.test(body.failureId)
    ) {
      return NextResponse.json(
        { success: false, error: 'A valid question ID is required' },
        { status: 400 },
      );
    }

    const questionExists = await prisma.triviaQuestion.findUnique({
      where: { id: body.questionId },
      select: { id: true },
    });
    if (!questionExists) {
      return NextResponse.json(
        { success: false, error: 'Trivia question not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      ...(await recordFailedTriviaQuestion(prisma, session.user.id, body.failureId)),
    });
  } catch (error) {
    console.error('Error recording failed trivia question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record failed trivia question' },
      { status: 500 },
    );
  }
}
