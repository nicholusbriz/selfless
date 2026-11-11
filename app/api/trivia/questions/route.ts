import { NextRequest, NextResponse } from 'next/server';
import { getRandomQuestions } from '@/lib/trivia-questions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '10', 10);
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | undefined;

    const questions = getRandomQuestions(
      Math.min(Math.max(count, 1), 20), // Limit to 1-20 questions
      difficulty
    );

    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
    });
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trivia questions',
      },
      { status: 500 }
    );
  }
}
