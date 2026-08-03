import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateEmbedding, chunkText } from '@/lib/services/embedding-service';
import { clearRAGCache } from '@/lib/services/rag-service';

const prisma = new PrismaClient();

/**
 * GET /api/ai/knowledge-base
 * 
 * Fetch all knowledge base entries or filter by category/subcategory
 * 
 * Query Parameters:
 * - category: string (optional) - Filter by category
 * - subcategory: string (optional) - Filter by subcategory
 * - limit: number (optional, default: 50) - Maximum results to return
 * - skip: number (optional, default: 0) - Number of results to skip
 * 
 * Returns:
 * - success: boolean
 * - data: array - Knowledge base entries
 * - total: number - Total matching entries
 * - hasMore: boolean - Whether more results are available
 * 
 * Authentication: Not required (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const where: any = { isActive: true };
    
    if (category) {
      where.category = { contains: category };
    }
    
    if (subcategory) {
      where.subcategory = { contains: subcategory };
    }

    const [knowledge, total] = await Promise.all([
      prisma.aIKnowledgeBase.findMany({
        where,
        select: {
          id: true,
          category: true,
          subcategory: true,
          title: true,
          content: true,
          summary: true,
          tags: true,
          difficulty: true,
          priority: true,
          isActive: true,
          // Exclude embedding from list to avoid memory issues
          // embedding: true,
          embeddingGeneratedAt: true,
          isChunked: true,
          createdAt: true,
          lastUpdated: true,
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip
      }),
      prisma.aIKnowledgeBase.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: knowledge,
      total,
      hasMore: skip + limit < total
    });
  } catch (error) {
    console.error('Knowledge Base GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knowledge base' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/knowledge-base
 * 
 * Create new knowledge base entry with automatic embedding generation
 * 
 * Request Body:
 * - category: string (required) - Knowledge category
 * - subcategory: string (optional) - Knowledge subcategory
 * - title: string (required) - Entry title
 * - content: string (required) - Main content
 * - summary: string (optional) - Brief summary
 * - tags: array (optional) - Searchable tags
 * - difficulty: string (optional) - Difficulty level
 * - priority: number (optional, default: 0) - Priority for sorting
 * - relatedIds: array (optional) - IDs of related entries
 * - generateEmbedding: boolean (optional, default: true) - Whether to generate embeddings
 * 
 * Returns:
 * - success: boolean
 * - data: object - Created knowledge base entry
 * - embeddingGenerated: boolean - Whether embedding was generated
 * - chunksCreated: number - Number of chunks created (if applicable)
 * 
 * Authentication: Not required (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      category,
      subcategory,
      title,
      content,
      summary,
      tags,
      difficulty,
      priority,
      relatedIds,
      generateEmbedding: shouldGenerateEmbedding = true
    } = body;

    if (!category || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Category, title, and content are required' },
        { status: 400 }
      );
    }

    // Create the knowledge base entry
    const knowledge = await prisma.aIKnowledgeBase.create({
      data: {
        category,
        subcategory,
        title,
        content,
        summary,
        tags: tags || [],
        difficulty,
        priority: priority || 0,
        relatedIds: relatedIds || []
      }
    });

    let embeddingGenerated = false;
    let chunksCreated = 0;

    // Generate embedding if requested
    if (shouldGenerateEmbedding) {
      try {
        console.log(`[KnowledgeBase] Generating embedding for entry: ${knowledge.id}`);

        // Generate embedding for the full content
        const embedding = await generateEmbedding(content);
        
        // Update with embedding
        await prisma.aIKnowledgeBase.update({
          where: { id: knowledge.id },
          data: {
            embedding,
            embeddingGeneratedAt: new Date()
          }
        });

        embeddingGenerated = true;

        // Chunk large documents (>1000 words)
        const wordCount = content.split(/\s+/).length;
        if (wordCount > 1000) {
          console.log(`[KnowledgeBase] Chunking large document (${wordCount} words)`);
          
          const chunks = chunkText(content, 200, 50);
          
          // Generate embeddings for chunks
          const chunkEmbeddings = await Promise.all(
            chunks.map(chunk => generateEmbedding(chunk))
          );

          // Create chunk records
          const chunkData = chunks.map((chunk, index) => ({
            knowledgeBaseId: knowledge.id,
            chunkIndex: index,
            content: chunk,
            title: `${title} (Part ${index + 1})`,
            embedding: chunkEmbeddings[index],
            wordCount: chunk.split(/\s+/).length
          }));

          await prisma.aIKnowledgeChunk.createMany({
            data: chunkData
          });

          // Mark as chunked
          await prisma.aIKnowledgeBase.update({
            where: { id: knowledge.id },
            data: { isChunked: true }
          });

          chunksCreated = chunks.length;
          console.log(`[KnowledgeBase] Created ${chunksCreated} chunks for entry: ${knowledge.id}`);
        }

        // Clear RAG cache to force regeneration with new knowledge
        clearRAGCache();
        console.log('[KnowledgeBase] Cleared RAG cache after creating new entry');
      } catch (embeddingError) {
        console.error('[KnowledgeBase] Failed to generate embedding:', embeddingError);
        // Continue without embedding - entry is still usable for keyword search
      }
    }

    return NextResponse.json({
      success: true,
      data: knowledge,
      embeddingGenerated,
      chunksCreated
    });
  } catch (error) {
    console.error('Knowledge Base POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge base entry' },
      { status: 500 }
    );
  }
}