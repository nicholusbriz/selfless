import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { isJsonObject } from '@/lib/api-response';
import { recordFailedTriviaQuestion } from '@/lib/trivia/daily-hearts-server';
import { prisma } from '@/lib/prisma/client';

const MAX_WRITE_CONFLICT_ATTEMPTS = 5;

function isPrismaWriteConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2034'
  );
}

async function retryWriteConflict<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isPrismaWriteConflict(error) || attempt >= MAX_WRITE_CONFLICT_ATTEMPTS) {
        throw error;
      }

      const delayMs = 50 * 2 ** (attempt - 1) + Math.floor(Math.random() * 50);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

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

    const failureId = body.failureId;
    const result = await retryWriteConflict(() =>
      prisma.$transaction(
        (tx) => recordFailedTriviaQuestion(tx, session.user.id, failureId),
        { maxWait: 10000, timeout: 30000 },
      ),
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error recording failed trivia question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record failed trivia question' },
      { status: 500 },
    );
  }
}
