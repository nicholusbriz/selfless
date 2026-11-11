// check-answers.js — run from prisma/ folder: node check-answers.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  TRIVIA ANSWER AUDIT');
  console.log('════════════════════════════════════════════════════════\n');

  const sessions = await prisma.triviaGameSession.findMany({
    orderBy: { playedAt: 'desc' },
    include: {
      answers: {
        include: {
          question: {
            select: {
              id: true,
              correctAnswer: true,
              question: true,
              difficulty: true,
            },
          },
        },
      },
    },
  });

  if (sessions.length === 0) {
    console.log('No sessions found.\n');
    return;
  }

  let totalChecked = 0;
  let mismatches = 0;
  let duplicates = 0;
  let invalidUserAnswers = 0;

  for (const s of sessions) {
    console.log(`SESSION ${s.id}`);
    console.log(`  level=${s.level}  correct=${s.correct}/${s.total}  points=${s.points}  accuracy=${s.accuracy.toFixed(1)}%`);
    console.log(`  answers: ${s.answers.length}`);
    console.log('  ─────────────────────────────────────────────────────');

    const seenQuestionIds = new Set();
    let serverCorrect = 0;

    for (const a of s.answers) {
      totalChecked++;

      // Duplicate check
      if (seenQuestionIds.has(a.questionId)) {
        console.log(`  ⚠️  DUPLICATE questionId ${a.questionId} in session`);
        duplicates++;
      }
      seenQuestionIds.add(a.questionId);

      // Valid userAnswer check
      if (!Number.isInteger(a.userAnswer) || a.userAnswer < -1 || a.userAnswer > 3) {
        console.log(`  ⚠️  INVALID userAnswer ${a.userAnswer} for question ${a.questionId}`);
        invalidUserAnswers++;
      }

      // Recompute correctness from DB
      const expectedIsCorrect =
        a.userAnswer !== -1 && a.userAnswer === a.question.correctAnswer;
      if (expectedIsCorrect) serverCorrect++;

      if (a.isCorrect !== expectedIsCorrect) {
        console.log(
          `  ⚠️  MISMATCH  q=${a.questionId}  userAnswer=${a.userAnswer}  dbCorrect=${a.question.correctAnswer}  stored.isCorrect=${a.isCorrect}  expected=${expectedIsCorrect}`
        );
        mismatches++;
      }
    }

    // Compare stored session.correct to recomputed
    const sessionCorrectOk = serverCorrect === s.correct;
    console.log(
      `  recomputed correct = ${serverCorrect}   stored correct = ${s.correct}   ${
        sessionCorrectOk ? '✅' : '⚠️ MISMATCH'
      }`
    );
    console.log('');
  }

  // ─── Question analytics check ───────────────────────────────
  console.log('════════════════════════════════════════════════════════');
  console.log('  QUESTION ANALYTICS');
  console.log('════════════════════════════════════════════════════════\n');

  const questions = await prisma.triviaQuestion.findMany({
    select: {
      id: true,
      question: true,
      timesAsked: true,
      timesCorrect: true,
      difficultyRating: true,
    },
  });

  let sumAsked = 0;
  let sumCorrect = 0;
  for (const q of questions) {
    sumAsked += q.timesAsked;
    sumCorrect += q.timesCorrect;
  }

  const answeredRows = await prisma.triviaGameAnswer.count();
  const correctRows = await prisma.triviaGameAnswer.count({
    where: { isCorrect: true },
  });

  console.log(`  Total question rows:        ${questions.length}`);
  console.log(`  Σ timesAsked across all:    ${sumAsked}`);
  console.log(`  Σ timesCorrect across all:  ${sumCorrect}`);
  console.log('');
  console.log(`  TriviaGameAnswer rows:      ${answeredRows}`);
  console.log(`  of which isCorrect=true:    ${correctRows}`);
  console.log('');

  if (sumAsked < answeredRows) {
    console.log('  ⚠️  timesAsked sum < answer rows — questionsAnswered not fully tracked.');
  } else if (sumAsked > answeredRows) {
    console.log(`  ℹ️  timesAsked sum (${sumAsked}) > answer rows (${answeredRows}) — expected if some fetches never got submitted.`);
  } else {
    console.log('  ✅ timesAsked matches answer rows exactly.');
  }

  if (sumCorrect === correctRows) {
    console.log('  ✅ timesCorrect matches isCorrect=true rows exactly.');
  } else {
    console.log(`  ⚠️  timesCorrect sum (${sumCorrect}) ≠ isCorrect=true rows (${correctRows}).`);
  }

  // Difficulty rating sanity
  const outOfRange = questions.filter(
    (q) => q.difficultyRating !== null && (q.difficultyRating < 0 || q.difficultyRating > 1)
  );
  if (outOfRange.length > 0) {
    console.log(`  ⚠️  ${outOfRange.length} question(s) have difficultyRating outside [0,1].`);
  } else {
    console.log('  ✅ All difficultyRating values are within [0,1].');
  }

  // ─── Summary ────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════════════════\n');
  console.log(`  Sessions checked:      ${sessions.length}`);
  console.log(`  Answer rows checked:   ${totalChecked}`);
  console.log(`  Correctness mismatches: ${mismatches}`);
  console.log(`  Duplicate questionIds:  ${duplicates}`);
  console.log(`  Invalid userAnswers:    ${invalidUserAnswers}`);
  console.log('');

  if (mismatches === 0 && duplicates === 0 && invalidUserAnswers === 0) {
    console.log('  ✅ All answer rows are consistent with the question bank.\n');
  } else {
    console.log('  ⚠️  See warnings above.\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });