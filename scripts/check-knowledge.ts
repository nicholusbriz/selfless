const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkKnowledgeBase() {
  try {
    console.log('Checking AIKnowledgeBase...\n');

    const total = await prisma.aIKnowledgeBase.count();
    console.log(`Total entries: ${total}`);

    const active = await prisma.aIKnowledgeBase.count({ where: { isActive: true } });
    console.log(`Active entries: ${active}`);

    const withEmbeddings = await prisma.aIKnowledgeBase.count({ 
      where: { isActive: true, embedding: { isEmpty: false } } 
    });
    console.log(`Entries with embeddings: ${withEmbeddings}`);

    const withoutEmbeddings = await prisma.aIKnowledgeBase.count({ 
      where: { isActive: true, embedding: { isEmpty: true } } 
    });
    console.log(`Entries without embeddings: ${withoutEmbeddings}`);

    // Get a sample of entries
    const sample = await prisma.aIKnowledgeBase.findMany({
      where: { isActive: true },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        embedding: true
      }
    });

    console.log('\nSample entries:');
    sample.forEach((entry: any) => {
      console.log(`- ${entry.title} (${entry.category})`);
      console.log(`  Has embedding: ${entry.embedding && entry.embedding.length > 0 ? 'Yes' : 'No'}`);
      console.log(`  Embedding length: ${entry.embedding?.length || 0}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKnowledgeBase();
