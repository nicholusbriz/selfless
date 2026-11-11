import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Fetch trivia questions
    const [questions, total] = await Promise.all([
      prisma.triviaQuestion.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.triviaQuestion.count({ where }),
    ]);

    // Calculate aggregate stats
    const stats = await prisma.triviaQuestion.aggregate({
      _count: {
        id: true,
      },
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalActiveQuestions: stats._count.id,
      },
    });
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to fetch trivia questions'),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await request.json();

    if (!isJsonObject(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { question, options, correctAnswer, category, difficulty, explanation } = body;

    // Validate required fields
    if (
      typeof question !== 'string' ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      typeof correctAnswer !== 'number' ||
      correctAnswer < 0 ||
      correctAnswer > 3 ||
      typeof category !== 'string' ||
      typeof difficulty !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['grammar', 'vocabulary', 'reading', 'idioms', 'common-mistakes'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Invalid difficulty' },
        { status: 400 }
      );
    }

    // Create new question
    const newQuestion = await prisma.triviaQuestion.create({
      data: {
        question,
        options,
        correctAnswer,
        category,
        difficulty,
        explanation: typeof explanation === 'string' ? explanation : null,
        timesAsked: 0,
        timesCorrect: 0,
        difficultyRating: 0.0,
        isActive: true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      question: newQuestion,
    });
  } catch (error) {
    console.error('Error creating trivia question:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to create trivia question'),
      },
      { status: 500 }
    );
  }
}
