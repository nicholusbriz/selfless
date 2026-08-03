/**
 * Knowledge Retriever Service
 * 
 * This service handles semantic search and retrieval from the knowledge base.
 * It performs vector similarity search using embeddings and provides fallback
 * to keyword-based search when needed.
 * 
 * Key Features:
 * - Semantic/vector search using embeddings
 * - Similarity scoring and thresholding
 * - Hybrid search (semantic + keyword)
 * - Result ranking and filtering
 * - Access count tracking
 * 
 * @module knowledge-retriever
 */

import { PrismaClient } from '@prisma/client';
import { 
  generateEmbedding, 
  calculateCosineSimilarity, 
  findMostSimilar 
} from './embedding-service';

const prisma = new PrismaClient();

/**
 * Result interface for knowledge retrieval
 */
export interface KnowledgeResult {
  id: string;
  category: string;
  subcategory: string | null;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  difficulty: string | null;
  priority: number;
  similarity: number; // Similarity score (0-1)
  source: 'semantic' | 'keyword' | 'hybrid';
  chunkIndex?: number; // If result is from a chunk
  chunkId?: string; // Chunk ID if applicable
}

/**
 * Search options for knowledge retrieval
 */
export interface SearchOptions {
  limit?: number; // Maximum results to return (default: 5)
  threshold?: number; // Minimum similarity threshold (default: 0.5)
  category?: string; // Filter by category
  subcategory?: string; // Filter by subcategory
  difficulty?: string; // Filter by difficulty
  useChunks?: boolean; // Whether to search chunks (default: true)
  hybridSearch?: boolean; // Combine semantic and keyword search (default: false)
  trackAccess?: boolean; // Increment access count (default: true)
}

/**
 * Perform semantic search on the knowledge base
 * 
 * @param query - The search query text
 * @param options - Search options
 * @returns Promise that resolves to an array of knowledge results with similarity scores
 * @throws Error if search fails
 * 
 * @example
 * const results = await semanticSearch('How do I submit assignments?', {
 *   limit: 5,
 *   threshold: 0.6,
 *   category: 'courses'
 * });
 * console.log(results[0].similarity); // 0.85
 */
export async function semanticSearch(
  query: string,
  options: SearchOptions = {}
): Promise<KnowledgeResult[]> {
  const {
    limit = 5,
    threshold = 0.5,
    category,
    subcategory,
    difficulty,
    useChunks = true,
    trackAccess = true
  } = options;

  console.log(`[KnowledgeRetriever] Performing semantic search for: "${query.substring(0, 50)}..."`);
  const startTime = Date.now();

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Build database query filters
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (difficulty) where.difficulty = difficulty;

    // Fetch entries with embeddings
    const entries = await prisma.aIKnowledgeBase.findMany({
      where: {
        ...where,
        isActive: true
      },
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
        embedding: true,
        isChunked: true
      },
      take: 100 // Fetch more to filter by similarity
    });

    // Filter entries with embeddings on the application side
    const entriesWithEmbeddings = entries.filter(entry => 
      Array.isArray(entry.embedding) && entry.embedding.length > 0
    );

    console.log(`[KnowledgeRetriever] Found ${entriesWithEmbeddings.length} entries with embeddings`);

    // Calculate similarities
    const results: KnowledgeResult[] = [];

    for (const entry of entriesWithEmbeddings) {
      if (!entry.embedding) continue;

      const similarity = calculateCosineSimilarity(queryEmbedding, entry.embedding);

      if (similarity >= threshold) {
        results.push({
          id: entry.id,
          category: entry.category,
          subcategory: entry.subcategory,
          title: entry.title,
          content: entry.content,
          summary: entry.summary,
          tags: entry.tags,
          difficulty: entry.difficulty,
          priority: entry.priority,
          similarity,
          source: 'semantic'
        });
      }
    }

    // If chunks are enabled and we want more results, search chunks
    if (useChunks && results.length < limit) {
      const chunkResults = await searchChunks(queryEmbedding, where, threshold, limit - results.length);
      results.push(...chunkResults);
    }

    // Sort by similarity (descending) and priority (descending)
    results.sort((a, b) => {
      if (Math.abs(a.similarity - b.similarity) > 0.01) {
        return b.similarity - a.similarity;
      }
      return b.priority - a.priority;
    });

    // Limit results
    const limitedResults = results.slice(0, limit);

    // Track access count
    if (trackAccess && limitedResults.length > 0) {
      const idsToUpdate = limitedResults.map(r => r.id);
      await prisma.aIKnowledgeBase.updateMany({
        where: { id: { in: idsToUpdate } },
        data: { accessCount: { increment: 1 } }
      });
    }

    const searchTime = Date.now() - startTime;
    console.log(`[KnowledgeRetriever] Semantic search completed in ${searchTime}ms, found ${limitedResults.length} results`);

    return limitedResults;
  } catch (error) {
    console.error('[KnowledgeRetriever] Semantic search failed:', error);
    throw new Error(`Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search knowledge chunks for more granular results
 * 
 * @param queryEmbedding - The query embedding
 * @param where - Database query filters
 * @param threshold - Minimum similarity threshold
 * @param limit - Maximum results to return
 * @returns Promise that resolves to chunk knowledge results
 */
async function searchChunks(
  queryEmbedding: number[],
  where: any,
  threshold: number,
  limit: number
): Promise<KnowledgeResult[]> {
  try {
    const chunks = await (prisma as any).aIKnowledgeChunk.findMany({
      where: {
        knowledgeBase: {
          isActive: true,
          ...where
        }
      },
      include: {
        knowledgeBase: {
          select: {
            id: true,
            category: true,
            subcategory: true,
            title: true,
            tags: true,
            difficulty: true,
            priority: true
          }
        }
      },
      take: 50
    });

    const results: KnowledgeResult[] = [];

    for (const chunk of chunks) {
      const similarity = calculateCosineSimilarity(queryEmbedding, chunk.embedding);

      if (similarity >= threshold) {
        results.push({
          id: chunk.knowledgeBase.id,
          category: chunk.knowledgeBase.category,
          subcategory: chunk.knowledgeBase.subcategory,
          title: chunk.knowledgeBase.title,
          content: chunk.content,
          summary: null,
          tags: chunk.knowledgeBase.tags,
          difficulty: chunk.knowledgeBase.difficulty,
          priority: chunk.knowledgeBase.priority,
          similarity,
          source: 'semantic',
          chunkIndex: chunk.chunkIndex,
          chunkId: chunk.id
        });
      }
    }

    // Sort and limit
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  } catch (error) {
    console.error('[KnowledgeRetriever] Chunk search failed:', error);
    return [];
  }
}

/**
 * Perform keyword-based search (fallback)
 * 
 * @param query - The search query text
 * @param options - Search options
 * @returns Promise that resolves to an array of knowledge results
 * 
 * @example
 * const results = await keywordSearch('assignment submission', {
 *   limit: 5,
 *   category: 'courses'
 * });
 */
export async function keywordSearch(
  query: string,
  options: SearchOptions = {}
): Promise<KnowledgeResult[]> {
  const {
    limit = 5,
    category,
    subcategory,
    difficulty,
    trackAccess = true
  } = options;

  console.log(`[KnowledgeRetriever] Performing keyword search for: "${query.substring(0, 50)}..."`);

  try {
    const searchTerms = query.toLowerCase().split(/\s+/);

    const where: any = {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: searchTerms } },
        { category: { contains: query, mode: 'insensitive' } },
        { subcategory: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (difficulty) where.difficulty = difficulty;

    const entries = await prisma.aIKnowledgeBase.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { accessCount: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        category: true,
        subcategory: true,
        title: true,
        content: true,
        summary: true,
        tags: true,
        difficulty: true,
        priority: true
      }
    });

    const results: KnowledgeResult[] = entries.map(entry => ({
      ...entry,
      similarity: 0.5, // Default similarity for keyword search
      source: 'keyword'
    }));

    // Track access count
    if (trackAccess && results.length > 0) {
      const idsToUpdate = results.map(r => r.id);
      await prisma.aIKnowledgeBase.updateMany({
        where: { id: { in: idsToUpdate } },
        data: { accessCount: { increment: 1 } }
      });
    }

    console.log(`[KnowledgeRetriever] Keyword search found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('[KnowledgeRetriever] Keyword search failed:', error);
    throw new Error(`Keyword search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Perform hybrid search combining semantic and keyword results
 * 
 * @param query - The search query text
 * @param options - Search options
 * @returns Promise that resolves to an array of knowledge results
 * 
 * @example
 * const results = await hybridSearch('How do I submit assignments?', {
 *   limit: 5,
 *   threshold: 0.5
 * });
 */
export async function hybridSearch(
  query: string,
  options: SearchOptions = {}
): Promise<KnowledgeResult[]> {
  const { limit = 5, threshold = 0.5 } = options;

  console.log(`[KnowledgeRetriever] Performing hybrid search for: "${query.substring(0, 50)}..."`);

  try {
    // Run both searches in parallel
    const [semanticResults, keywordResults] = await Promise.all([
      semanticSearch(query, { ...options, limit: limit * 2, threshold, trackAccess: false }),
      keywordSearch(query, { ...options, limit: limit * 2, trackAccess: false })
    ]);

    // Combine and deduplicate results
    const combinedMap = new Map<string, KnowledgeResult>();

    // Add semantic results first (higher priority)
    for (const result of semanticResults) {
      combinedMap.set(result.id, result);
    }

    // Add keyword results if not already present
    for (const result of keywordResults) {
      if (!combinedMap.has(result.id)) {
        combinedMap.set(result.id, result);
      } else {
        // If already present, boost similarity slightly for hybrid match
        const existing = combinedMap.get(result.id)!;
        existing.similarity = Math.min(1, existing.similarity + 0.1);
        existing.source = 'hybrid';
      }
    }

    // Convert to array and sort
    const combinedResults = Array.from(combinedMap.values());
    combinedResults.sort((a, b) => {
      // Prioritize semantic/hybrid over keyword
      if (a.source === 'keyword' && b.source !== 'keyword') return 1;
      if (b.source === 'keyword' && a.source !== 'keyword') return -1;
      
      // Then by similarity
      if (Math.abs(a.similarity - b.similarity) > 0.01) {
        return b.similarity - a.similarity;
      }
      
      // Then by priority
      return b.priority - a.priority;
    });

    // Limit results
    const limitedResults = combinedResults.slice(0, limit);

    // Track access count for final results
    if (limitedResults.length > 0) {
      const idsToUpdate = limitedResults.map(r => r.id);
      await prisma.aIKnowledgeBase.updateMany({
        where: { id: { in: idsToUpdate } },
        data: { accessCount: { increment: 1 } }
      });
    }

    console.log(`[KnowledgeRetriever] Hybrid search found ${limitedResults.length} results`);
    return limitedResults;
  } catch (error) {
    console.error('[KnowledgeRetriever] Hybrid search failed:', error);
    throw new Error(`Hybrid search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get related knowledge entries based on IDs
 * 
 * @param ids - Array of knowledge entry IDs
 * @param limit - Maximum results to return (default: 5)
 * @returns Promise that resolves to an array of related knowledge results
 * 
 * @example
 * const related = await getRelatedKnowledge(['id1', 'id2'], 3);
 */
export async function getRelatedKnowledge(ids: string[], limit: number = 5): Promise<KnowledgeResult[]> {
  try {
    const entries = await prisma.aIKnowledgeBase.findMany({
      where: {
        id: { in: ids },
        isActive: true
      },
      select: {
        id: true,
        category: true,
        subcategory: true,
        title: true,
        content: true,
        summary: true,
        tags: true,
        difficulty: true,
        priority: true
      },
      take: limit
    });

    return entries.map(entry => ({
      ...entry,
      similarity: 0.5,
      source: 'keyword'
    }));
  } catch (error) {
    console.error('[KnowledgeRetriever] Failed to get related knowledge:', error);
    return [];
  }
}

/**
 * Get knowledge by ID with full details
 * 
 * @param id - Knowledge entry ID
 * @returns Promise that resolves to the knowledge entry or null
 * 
 * @example
 * const knowledge = await getKnowledgeById('entry-id');
 */
export async function getKnowledgeById(id: string): Promise<KnowledgeResult | null> {
  try {
    const entry = await prisma.aIKnowledgeBase.findUnique({
      where: { id },
      select: {
        id: true,
        category: true,
        subcategory: true,
        title: true,
        content: true,
        summary: true,
        tags: true,
        difficulty: true,
        priority: true
      }
    });

    if (!entry) return null;

    // Increment access count
    await prisma.aIKnowledgeBase.update({
      where: { id },
      data: { accessCount: { increment: 1 } }
    });

    return {
      ...entry,
      similarity: 1.0,
      source: 'keyword'
    };
  } catch (error) {
    console.error('[KnowledgeRetriever] Failed to get knowledge by ID:', error);
    return null;
  }
}
