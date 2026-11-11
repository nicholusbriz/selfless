import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client'; // Added for stricter typing (optional but recommended)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> } // ✅ 1. Changed to Promise
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId } = await params; // ✅ 2. Added await

    const body: unknown = await request.json();

    if (!isJsonObject(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { question, options, correctAnswer, category, difficulty, explanation, isActive } = body;

    // Build update data with only provided fields
    // (Replaced `any` with Prisma's type for better safety)
    const updateData: Prisma.TriviaQuestionUpdateInput = {};

    if (typeof question === 'string') {
      updateData.question = question;
    }
    if (Array.isArray(options) && options.length === 4) {
      updateData.options = options;
    }
    if (typeof correctAnswer === 'number' && correctAnswer >= 0 && correctAnswer <= 3) {
      updateData.correctAnswer = correctAnswer;
    }
    if (typeof category === 'string') {
      const validCategories = ['grammar', 'vocabulary', 'reading', 'idioms', 'common-mistakes'];
      if (validCategories.includes(category)) {
        updateData.category = category;
      }
    }
    if (typeof difficulty === 'string') {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (validDifficulties.includes(difficulty)) {
        updateData.difficulty = difficulty;
      }
    }
    if (typeof explanation === 'string' || explanation === null) {
      updateData.explanation = explanation;
    }
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update question
    const updatedQuestion = await prisma.triviaQuestion.update({
      where: { id: questionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating trivia question:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to update trivia question'),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> } // ✅ 1. Changed to Promise
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId } = await params; // ✅ 2. Added await

    // Soft delete by setting isActive to false
    const deletedQuestion = await prisma.triviaQuestion.update({
      where: { id: questionId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      question: deletedQuestion,
    });
  } catch (error) {
    console.error('Error deleting trivia question:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to delete trivia question'),
      },
      { status: 500 }
    );
  }
}