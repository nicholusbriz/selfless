import { NextResponse } from 'next/server';
import { generateEmbedding, chunkText } from '@/lib/services/embedding-service';
import { clearRAGCache } from '@/lib/services/rag-service';
import { prisma } from '@/lib/prisma/client';
import { requireAuth, hasRole } from '@/lib/auth/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    if (!hasRole(user, 'dev')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Dev role access required.' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const entry = await prisma.aIKnowledgeBase.findUnique({ where: { id } });
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Knowledge entry not found' },
        { status: 404 },
      );
    }

    const embedding = await generateEmbedding(entry.content);
    await prisma.aIKnowledgeChunk.deleteMany({ where: { knowledgeBaseId: id } });

    let chunksCreated = 0;
    const wordCount = entry.content.split(/\s+/).length;
    if (wordCount > 1000) {
      const chunks = chunkText(entry.content, 800, 120);
      const chunkData = [];
      for (let index = 0; index < chunks.length; index += 1) {
        chunkData.push({
          knowledgeBaseId: id,
          chunkIndex: index,
          content: chunks[index],
          title: `${entry.title} (Part ${index + 1})`,
          embedding: await generateEmbedding(chunks[index]),
          wordCount: chunks[index].split(/\s+/).length,
        });
      }
      await prisma.aIKnowledgeChunk.createMany({ data: chunkData });
      chunksCreated = chunkData.length;
    }

    await prisma.aIKnowledgeBase.update({
      where: { id },
      data: {
        embedding,
        embeddingGeneratedAt: new Date(),
        isChunked: chunksCreated > 0,
      },
    });
    clearRAGCache();

    return NextResponse.json({ success: true, chunksCreated });
  } catch (error) {
    console.error('Knowledge embedding error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate embedding' },
      { status: 500 },
    );
  }
}