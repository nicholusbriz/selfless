import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { PrismaClient } from '@prisma/client';
import { generateEmbedding, chunkText } from '@/lib/services/embedding-service';
import { clearRAGCache } from '@/lib/services/rag-service';

const prisma = new PrismaClient();

/**
 * POST /api/admin/embed-knowledge
 * 
 * Generate embeddings for existing knowledge base entries (admin only)
 * This is useful for bulk embedding generation after adding the RAG system
 * 
 * Request Body:
 * - forceRegenerate: boolean (optional, default: false) - Regenerate existing embeddings
 * - chunkLargeDocuments: boolean (optional, default: true) - Chunk documents >1000 words
 * - limit: number (optional, default: 100) - Maximum entries to process
 * - category: string (optional) - Only process specific category
 * 
 * Returns:
 * - success: boolean
 * - data.processed: number - Number of entries processed
 * - data.embedded: number - Number of embeddings generated
 * - data.chunked: number - Number of documents chunked
 * - data.totalChunks: number - Total chunks created
 * - data.errors: number - Number of errors encountered
 * - data.errorDetails: array - Details of any errors
 * 
 * Authentication: Required (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || user.role?.name !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      forceRegenerate = false,
      chunkLargeDocuments = true,
      limit = 100,
      category
    } = body;

    console.log('[AdminEmbedKnowledge] Starting bulk embedding generation');
    const startTime = Date.now();

    // Build query for entries to process
    const where: any = { isActive: true };
    
    if (category) {
      where.category = category;
    }

    // Fetch entries to process
    const allEntries = await prisma.aIKnowledgeBase.findMany({
      where,
      take: limit * 2, // Fetch more to account for filtering
      select: {
        id: true,
        title: true,
        content: true,
        embedding: true,
        isChunked: true
      }
    });

    // Filter entries based on forceRegenerate flag
    const entries = forceRegenerate 
      ? allEntries.slice(0, limit)
      : allEntries.filter((entry: any) => !entry.embedding || entry.embedding.length === 0).slice(0, limit);

    console.log(`[AdminEmbedKnowledge] Found ${entries.length} entries to process`);

    let embedded = 0;
    let chunked = 0;
    let totalChunks = 0;
    let errors = 0;
    const errorDetails: Array<{ id: string; title: string; error: string }> = [];

    // Process each entry
    for (const entry of entries) {
      try {
        console.log(`[AdminEmbedKnowledge] Processing entry: ${entry.id} - ${entry.title}`);

        // Generate embedding for the full content
        const embedding = await generateEmbedding(entry.content);

        // Update with embedding
        await prisma.aIKnowledgeBase.update({
          where: { id: entry.id },
          data: {
            embedding,
            embeddingGeneratedAt: new Date()
          }
        });

        embedded++;

        // Chunk large documents if requested and not already chunked
        if (chunkLargeDocuments && !entry.isChunked) {
          const wordCount = entry.content.split(/\s+/).length;
          
          if (wordCount > 1000) {
            console.log(`[AdminEmbedKnowledge] Chunking large document (${wordCount} words): ${entry.title}`);
            
            const chunks = chunkText(entry.content, 200, 50);
            
            // Generate embeddings for chunks
            const chunkEmbeddings = await Promise.all(
              chunks.map(chunk => generateEmbedding(chunk))
            );

            // Create chunk records
            const chunkData = chunks.map((chunk, index) => ({
              knowledgeBaseId: entry.id,
              chunkIndex: index,
              content: chunk,
              title: `${entry.title} (Part ${index + 1})`,
              embedding: chunkEmbeddings[index],
              wordCount: chunk.split(/\s+/).length
            }));

            await prisma.aIKnowledgeChunk.createMany({
              data: chunkData
            });

            // Mark as chunked
            await prisma.aIKnowledgeBase.update({
              where: { id: entry.id },
              data: { isChunked: true }
            });

            chunked++;
            totalChunks += chunks.length;
          }
        }
      } catch (entryError) {
        errors++;
        errorDetails.push({
          id: entry.id,
          title: entry.title,
          error: entryError instanceof Error ? entryError.message : 'Unknown error'
        });
        console.error(`[AdminEmbedKnowledge] Failed to process entry ${entry.id}:`, entryError);
      }
    }

    // Clear RAG cache to force regeneration with new embeddings
    clearRAGCache();
    console.log('[AdminEmbedKnowledge] Cleared RAG cache after bulk embedding');

    const processingTime = Date.now() - startTime;
    console.log(`[AdminEmbedKnowledge] Completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        processed: entries.length,
        embedded,
        chunked,
        totalChunks,
        errors,
        errorDetails,
        processingTime
      }
    });
  } catch (error) {
    console.error('[AdminEmbedKnowledge] Bulk embedding failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/embed-knowledge
 * 
 * Get embedding statistics for the knowledge base
 * 
 * Query Parameters:
 * - category: string (optional) - Filter by category
 * 
 * Returns:
 * - success: boolean
 * - data.total: number - Total knowledge base entries
 * - data.withEmbeddings: number - Entries with embeddings
 * - data.withoutEmbeddings: number - Entries without embeddings
 * - data.chunked: number - Documents that are chunked
 * - data.totalChunks: number - Total chunks in database
 * - data.percentageEmbedded: number - Percentage of entries with embeddings
 * 
 * Authentication: Required (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || user.role?.name !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }

    // Get statistics
    const allEntries = await prisma.aIKnowledgeBase.findMany({
      where,
      select: { id: true, embedding: true, isChunked: true }
    });

    const total = allEntries.length;
    const withEmbeddings = allEntries.filter((e: any) => e.embedding && e.embedding.length > 0).length;
    const chunked = allEntries.filter((e: any) => e.isChunked).length;
    
    const totalChunks = await prisma.aIKnowledgeChunk.count({
      where: {
        knowledgeBase: {
          isActive: true,
          ...category ? { category } : {}
        }
      }
    });

    const withoutEmbeddings = total - withEmbeddings;
    const percentageEmbedded = total > 0 ? (withEmbeddings / total) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        total,
        withEmbeddings,
        withoutEmbeddings,
        chunked,
        totalChunks,
        percentageEmbedded: Math.round(percentageEmbedded * 100) / 100
      }
    });
  } catch (error) {
    console.error('[AdminEmbedKnowledge] Failed to get statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get embedding statistics' },
      { status: 500 }
    );
  }
}
