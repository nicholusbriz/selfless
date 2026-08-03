import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { semanticSearch, keywordSearch, hybridSearch, type KnowledgeResult } from '@/lib/services/knowledge-retriever';

/**
 * GET /api/ai/knowledge-base/search
 * 
 * Search knowledge base with semantic and keyword search support
 * 
 * Query Parameters:
 * - q: string (required) - Search query
 * - mode: string (optional, default: 'semantic') - Search mode: 'semantic', 'keyword', or 'hybrid'
 * - limit: number (optional, default: 5) - Maximum results to return
 * - threshold: number (optional, default: 0.5) - Minimum similarity threshold for semantic search
 * - category: string (optional) - Filter by category
 * - subcategory: string (optional) - Filter by subcategory
 * - difficulty: string (optional) - Filter by difficulty
 * 
 * Returns:
 * - success: boolean
 * - data: array - Search results with similarity scores
 * - mode: string - Search mode used
 * - resultsCount: number - Number of results returned
 * 
 * Authentication: Not required (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const mode = searchParams.get('mode') || 'semantic';
    const limit = parseInt(searchParams.get('limit') || '5');
    const threshold = parseFloat(searchParams.get('threshold') || '0.5');
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[KnowledgeSearch] Searching for: "${query}" with mode: ${mode}`);

    let results: KnowledgeResult[];
    let actualMode = mode;

    try {
      // Use semantic search by default, fallback to keyword if it fails
      if (mode === 'semantic') {
        results = await semanticSearch(query, {
          limit,
          threshold,
          category,
          subcategory,
          difficulty,
          trackAccess: true
        });
        
        // Fallback to keyword search if no results
        if (results.length === 0) {
          console.log('[KnowledgeSearch] No semantic results, falling back to keyword search');
          results = await keywordSearch(query, {
            limit,
            category,
            subcategory,
            difficulty,
            trackAccess: true
          });
          actualMode = 'keyword';
        }
      } else if (mode === 'keyword') {
        results = await keywordSearch(query, {
          limit,
          category,
          subcategory,
          difficulty,
          trackAccess: true
        });
      } else if (mode === 'hybrid') {
        results = await hybridSearch(query, {
          limit,
          threshold,
          category,
          subcategory,
          difficulty,
          trackAccess: true
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid search mode. Use: semantic, keyword, or hybrid' },
          { status: 400 }
        );
      }
    } catch (searchError) {
      console.error('[KnowledgeSearch] Primary search failed, trying keyword fallback:', searchError);
      
      // Fallback to keyword search if semantic/hybrid fails
      try {
        results = await keywordSearch(query, {
          limit,
          category,
          subcategory,
          difficulty,
          trackAccess: true
        });
        actualMode = 'keyword';
      } catch (fallbackError) {
        console.error('[KnowledgeSearch] Keyword fallback also failed:', fallbackError);
        return NextResponse.json(
          { error: 'All search methods failed' },
          { status: 500 }
        );
      }
    }

    // Format results for response
    const formattedResults = results.map(result => ({
      id: result.id,
      category: result.category,
      subcategory: result.subcategory,
      title: result.title,
      content: result.content,
      summary: result.summary,
      tags: result.tags,
      difficulty: result.difficulty,
      priority: result.priority,
      similarity: result.similarity,
      source: result.source,
      chunkIndex: result.chunkIndex
    }));

    return NextResponse.json({
      success: true,
      data: formattedResults,
      mode: actualMode,
      resultsCount: formattedResults.length
    });
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}