import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const questionFile = new URL('./trivia-questions-2026.json', import.meta.url);
const questions = JSON.parse(await readFile(questionFile, 'utf8'));

function getDifficulty(level) {
  if (level <= 4) return 'beginner';
  if (level <= 7) return 'intermediate';
  return 'advanced';
}

function getCategory(question) {
  const text = question.toLowerCase();
  if (text.includes('idiom') || text.includes('phrase')) return 'idioms';
  if (text.includes('literary device') || text.includes('literary technique')) return 'reading';
  if (text.includes('spelling')) return 'common-mistakes';
  if (/\b(synonym|antonym|opposite|meaning of|mean\s+“|means\s+“|closest in meaning|closest in meaning)\b/.test(text)) {
    return 'vocabulary';
  }
  return 'grammar';
}

async function replaceTriviaQuestions() {
  if (
    questions.length !== 100 ||
    questions.some((item, index) =>
      item.number !== index + 1 ||
      item.level !== Math.floor(index / 10) + 1 ||
      item.options?.length !== 4 ||
      !Number.isInteger(item.correctAnswer) ||
      item.correctAnswer < 0 ||
      item.correctAnswer > 3
    )
  ) {
    throw new Error('Trivia input validation failed; expected 100 numbered questions with four options and valid answers.');
  }

  const newReferenceIds = questions.map((item) => `attached-2026-${item.number}`);

  for (const item of questions) {
    const referenceId = `attached-2026-${item.number}`;
    const data = {
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer,
      category: getCategory(item.question),
      difficulty: getDifficulty(item.level),
      isActive: true,
    };

    await prisma.triviaQuestion.upsert({
      where: { referenceId },
      create: {
        ...data,
        referenceId,
        timesAsked: 0,
        timesCorrect: 0,
        difficultyRating: 0,
      },
      // Keep analytics and historical answers when this script is rerun.
      update: data,
    });
  }

  const allQuestions = await prisma.triviaQuestion.findMany({
    select: { id: true, referenceId: true },
  });
  const newReferenceIdSet = new Set(newReferenceIds);
  const oldQuestionIds = allQuestions
    .filter(({ referenceId }) => !newReferenceIdSet.has(referenceId ?? ''))
    .map(({ id }) => id);
  if (oldQuestionIds.length > 0) {
    await prisma.triviaQuestion.updateMany({
      where: { id: { in: oldQuestionIds } },
      data: { isActive: false },
    });
  }

  const activeCount = await prisma.triviaQuestion.count({ where: { isActive: true } });
  console.log(`Trivia replacement complete: 100 new questions active; ${oldQuestionIds.length} older questions archived; ${activeCount} active questions total.`);
}

replaceTriviaQuestions()
  .catch((error) => {
    console.error('Failed to replace trivia questions:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
