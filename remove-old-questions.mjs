import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Find IDs of old questions (not starting with "e")
const oldQuestions = await prisma.triviaQuestion.findMany({
  where: {
    NOT: {
      referenceId: {
        startsWith: "e"
      }
    }
  },
  select: { id: true }
});

console.log(`Found ${oldQuestions.length} old questions to remove`);

if (oldQuestions.length > 0) {
  const oldIds = oldQuestions.map(q => q.id);
  
  // Delete related game answers first
  const deletedAnswers = await prisma.triviaGameAnswer.deleteMany({
    where: {
      questionId: { in: oldIds }
    }
  });
  console.log(`✓ Deleted ${deletedAnswers.count} related game answers`);
  
  // Now delete the questions
  const deletedQuestions = await prisma.triviaQuestion.deleteMany({
    where: {
      id: { in: oldIds }
    }
  });
  console.log(`✓ Deleted ${deletedQuestions.count} old questions`);
}

const remaining = await prisma.triviaQuestion.count();
console.log(`\n✅ Complete! Remaining questions: ${remaining}`);

const stats = await prisma.triviaQuestion.groupBy({
  by: ['difficulty'],
  _count: true
});

console.log('\nBy difficulty:');
stats.forEach(s => console.log(`  • ${s.difficulty}: ${s._count}`));

await prisma.$disconnect();
