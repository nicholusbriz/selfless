import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, hasRole } from '@/lib/auth/server';

const prisma = new PrismaClient();

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'because', 'from', 'have', 'into',
  'more', 'that', 'their', 'this', 'with', 'your', 'you', 'will', 'what',
]);

function generateKnowledgeMetadata(content: string) {
  const lines = content.split(/\r?\n/).map((line: string) => line.trim()).filter(Boolean);
  const plainTitle = (lines[0] || 'Knowledge entry')
    .replace(/^#+\s*/, '')
    .replace(/[*_`]/g, '')
    .replace(/[.!?]+$/, '')
    .trim();
  const title = plainTitle.slice(0, 120);
  const summary = content.replace(/\s+/g, ' ').trim().slice(0, 280);
  const tags = Array.from(
    new Set(
      (content.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || [])
        .filter((word: string) => !STOP_WORDS.has(word))
        .slice(0, 12),
    ),
  );

  return { title, summary, tags };
}

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
 * Authentication: Dev role required
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is dev
    const user = await requireAuth();
    
    if (!hasRole(user, 'dev')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Dev role access required.' },
        { status: 403 }
      );
    }
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
 * Create new knowledge base entry without generating embeddings
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
 * - generateEmbedding: boolean (optional) - Legacy flag; embeddings are now manual
 * 
 * Returns:
 * - success: boolean
 * - data: object - Created knowledge base entry
 * - embeddingGenerated: boolean - Whether embedding was generated
 * - chunksCreated: number - Number of chunks created (if applicable)
 * 
 * Authentication: Dev role required
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and is dev
    const user = await requireAuth();
    
    if (!hasRole(user, 'dev')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Dev role access required.' },
        { status: 403 }
      );
    }
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
      relatedIds
    } = body;

    if (!category || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category and knowledge content are required' },
        { status: 400 }
      );
    }

    const generated = generateKnowledgeMetadata(content);

    // Create the knowledge base entry
    const knowledge = await prisma.aIKnowledgeBase.create({
      data: {
        category,
        subcategory,
        title: title?.trim() || generated.title,
        content,
        summary: summary?.trim() || generated.summary,
        tags: Array.isArray(tags) && tags.length > 0 ? tags : generated.tags,
        difficulty,
        priority: priority || 0,
        relatedIds: relatedIds || []
      }
    });

    return NextResponse.json({
      success: true,
      data: knowledge,
      embeddingGenerated: false,
      chunksCreated: 0
    });
  } catch (error) {
    console.error('Knowledge Base POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge base entry' },
      { status: 500 }
    );
  }
}