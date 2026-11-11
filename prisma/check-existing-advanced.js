const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MAX_LEVEL = 10;
const EXPECTED_PER_LEVEL = 10; // your modal requests count=10

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = [
  'grammar',
  'vocabulary',
  'reading',
  'idioms',
  'common-mistakes',
];

// Mirrors getDifficultyForLevel() in your questions API
function getDifficultyForLevel(level) {
  if (level <= 3) return 'beginner';
  if (level <= 6) return 'intermediate';
  return 'advanced';
}

function bar(n, max) {
  const width = 20;
  const filled = Math.round((n / Math.max(max, 1)) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

async function checkDatabase() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  TRIVIA DB DIAGNOSTIC');
  console.log('════════════════════════════════════════════════════════\n');

  // ─── 1. Totals per difficulty ────────────────────────────────
  console.log('1) QUESTIONS PER DIFFICULTY (isActive: true)');
  console.log('────────────────────────────────────────────────────────\n');

  const byDifficulty = {};
  for (const d of DIFFICULTIES) {
    byDifficulty[d] = await prisma.triviaQuestion.count({
      where: { difficulty: d, isActive: true },
    });
  }
  const maxDiffCount = Math.max(...Object.values(byDifficulty), 1);

  for (const d of DIFFICULTIES) {
    const n = byDifficulty[d];
    const flag = n < EXPECTED_PER_LEVEL ? '  ⚠️  TOO FEW' : '  ✅';
    console.log(
      `  ${d.padEnd(13)} ${String(n).padStart(3)}  ${bar(n, maxDiffCount)}${flag}`,
    );
  }

  const totalActive = await prisma.triviaQuestion.count({
    where: { isActive: true },
  });
  const totalAll = await prisma.triviaQuestion.count();
  console.log(`\n  Active total: ${totalActive}`);
  console.log(`  All (incl. inactive): ${totalAll}`);

  if (Object.values(byDifficulty).some((n) => n < EXPECTED_PER_LEVEL)) {
    console.log(
      '\n  ⚠️  One or more difficulty buckets has fewer than 10 questions.',
    );
    console.log(
      '     This is why your modal shows "Finish" on question 1 — the fetch returns <10 and the modal thinks it\'s the last question.',
    );
  }

  // ─── 2. Difficulty × category grid ──────────────────────────
  console.log('\n2) QUESTIONS BY DIFFICULTY × CATEGORY (isActive: true)');
  console.log('────────────────────────────────────────────────────────\n');

  const header = 'category'.padEnd(18) + DIFFICULTIES.map((d) => d.padStart(14)).join('');
  console.log('  ' + header);
  console.log('  ' + '─'.repeat(header.length));

  for (const cat of CATEGORIES) {
    const row = [cat.padEnd(18)];
    for (const d of DIFFICULTIES) {
      const n = await prisma.triviaQuestion.count({
        where: { category: cat, difficulty: d, isActive: true },
      });
      row.push(String(n).padStart(14));
    }
    console.log('  ' + row.join(''));
  }

  // ─── 3. Simulate the questions API for each level ───────────
  console.log('\n3) SIMULATED FETCH PER LEVEL (what your API returns today)');
  console.log('────────────────────────────────────────────────────────\n');
  console.log('  Your modal requests count=10 for each level.');
  console.log('  If "returned" < 10, the modal will show Finish early.\n');
  console.log('  level   difficulty      available   returned   status');
  console.log('  ' + '─'.repeat(60));

  const levelProblems = [];

  for (let level = 1; level <= MAX_LEVEL; level++) {
    const difficulty = getDifficultyForLevel(level);

    const available = await prisma.triviaQuestion.count({
      where: { difficulty, isActive: true },
    });
    const returned = Math.min(EXPECTED_PER_LEVEL, available);

    let status = '✅';
    if (returned === 0) {
      status = '❌ EMPTY — modal cannot open';
      levelProblems.push({ level, reason: 'no questions at all' });
    } else if (returned < EXPECTED_PER_LEVEL) {
      status = `⚠️  only ${returned} question${returned === 1 ? '' : 's'} — Finish appears early`;
      levelProblems.push({ level, reason: `only ${returned} question(s)` });
    }

    console.log(
      `  ${String(level).padStart(3)}     ${difficulty.padEnd(15)} ${String(available).padStart(6)}      ${String(returned).padStart(6)}   ${status}`,
    );
  }

  // ─── 4. User.currentLevel field sanity ──────────────────────
  console.log('\n4) USERS — currentLevel FIELD');
  console.log('────────────────────────────────────────────────────────\n');

  let users = [];
  try {
    users = await prisma.user.findMany({
      select: { id: true, email: true, currentLevel: true },
      take: 10,
    });
  } catch (err) {
    console.log('  ❌ Could not read `User.currentLevel`.');
    console.log('     Error:', err.message);
    console.log(
      '\n     → Add `currentLevel Int @default(1)` to your User model, then run:',
    );
    console.log('         npx prisma generate');
    console.log('         npx prisma db push\n');
  }

  if (users.length === 0) {
    console.log('  (no users found)');
  } else {
    console.log('  id                          email                        currentLevel');
    console.log('  ' + '─'.repeat(74));
    for (const u of users) {
      const lvl = typeof u.currentLevel === 'number' ? u.currentLevel : '(missing)';
      console.log(
        `  ${String(u.id).padEnd(28)} ${String(u.email ?? '').padEnd(28)} ${String(lvl).padStart(4)}`,
      );
    }
  }

  // ─── 5. Sessions / answers counts ───────────────────────────
  console.log('\n5) PLAY HISTORY');
  console.log('────────────────────────────────────────────────────────\n');

  const sessionCount = await prisma.triviaGameSession.count();
  const answerCount = await prisma.triviaGameAnswer.count();

  console.log(`  TriviaGameSession rows: ${sessionCount}`);
  console.log(`  TriviaGameAnswer rows : ${answerCount}`);

  if (sessionCount > 0) {
    const recent = await prisma.triviaGameSession.findMany({
      orderBy: { playedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        userId: true,
        level: true,
        correct: true,
        total: true,
        points: true,
        accuracy: true,
        playedAt: true,
      },
    });
    console.log('\n  Last 5 sessions:');
    console.log('  ' + '─'.repeat(74));
    for (const s of recent) {
      console.log(
        `  L${String(s.level).padStart(2)}  ${String(s.correct).padStart(2)}/${String(s.total).padEnd(2)}  ${String(s.points).padStart(4)} pts  ${s.accuracy.toFixed(0).padStart(3)}%  ${s.playedAt.toISOString()}`,
      );
    }
  }

  // ─── 6. Summary ─────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════════════════\n');

  if (levelProblems.length === 0) {
    console.log('  ✅ All 10 levels have enough questions to serve 10 per session.');
  } else {
    console.log('  ⚠️  Problems that will break the "play all levels" flow:\n');
    for (const p of levelProblems) {
      console.log(`     • Level ${p.level}: ${p.reason}`);
    }
    console.log('\n  Fix by either:');
    console.log('     a) Seeding more questions into the thin difficulty buckets, or');
    console.log(
      '     b) Making /api/trivia/questions fall back to other difficulties when the target bucket has < 10.',
    );
  }

  console.log('\nDone.\n');
}

checkDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });