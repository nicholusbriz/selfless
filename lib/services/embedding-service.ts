/**
 * Optimized Embedding Service
 * 
 * This service handles generating text embeddings using @xenova/transformers
 * for local, on-device semantic search. It uses the all-MiniLM-L6-v2 model
 * which produces 384-dimensional embeddings optimized for semantic similarity.
 * 
 * Key Performance Optimizations:
 * - Model loaded once and cached
 * - Reduced logging frequency
 * - Simple embedding cache
 * - Progress updates every 10% instead of every line
 * 
 * @module embedding-service
 */

import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use local cache
env.allowLocalModels = true;
env.allowRemoteModels = true;

// Cache for the embedding pipeline to avoid reloading
let embeddingPipeline: any = null;
let pipelineInitPromise: Promise<any> | null = null;
let isPipelineInitialized = false;

// Cache for generated embeddings to avoid regeneration
const embeddingCache = new Map<string, number[]>();

/**
 * Initialize the embedding pipeline
 * Loads the all-MiniLM-L6-v2 model for generating 384-dimensional embeddings
 * 
 * @returns Promise that resolves to the embedding pipeline
 * @throws Error if model loading fails
 */
async function getEmbeddingPipeline(): Promise<any> {
  // Return cached pipeline if available
  if (embeddingPipeline && isPipelineInitialized) {
    return embeddingPipeline;
  }

  // Return existing initialization promise if in progress
  if (pipelineInitPromise) {
    return pipelineInitPromise;
  }

  // Initialize pipeline with optimized progress logging
  console.log('[EmbeddingService] Initializing embedding pipeline...');
  const startTime = Date.now();
  let lastLoggedProgress = 0;
  
  pipelineInitPromise = pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      progress_callback: (progress: any) => {
        if (progress.status === 'progress') {
          const currentProgress = Math.round(progress.progress * 100);
          // Only log every 10% to reduce log spam
          if (currentProgress - lastLoggedProgress >= 10 || currentProgress === 100) {
            console.log(`[EmbeddingService] Model loading: ${currentProgress}%`);
            lastLoggedProgress = currentProgress;
          }
        }
      }
    }
  );

  try {
    embeddingPipeline = await pipelineInitPromise;
    isPipelineInitialized = true;
    const loadTime = Date.now() - startTime;
    console.log(`[EmbeddingService] Pipeline initialized in ${loadTime}ms`);
    return embeddingPipeline;
  } catch (error) {
    console.error('[EmbeddingService] Failed to initialize pipeline:', error);
    pipelineInitPromise = null;
    isPipelineInitialized = false;
    throw new Error(`Failed to initialize embedding pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embedding for a single text
 * 
 * @param text - The text to generate embedding for
 * @param useCache - Whether to use cached embeddings (default: true)
 * @returns Promise that resolves to a 384-dimensional embedding array
 * @throws Error if embedding generation fails
 */
export async function generateEmbedding(text: string, useCache: boolean = true): Promise<number[]> {
  // Check cache first
  if (useCache && embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }

  try {
    const pipeline = await getEmbeddingPipeline();
    const embedding = await pipeline(text, { pooling: 'mean', normalize: true });

    // Extract array data from complex object or convert Float32Array
    let embeddingArray: number[];
    if (embedding && typeof embedding === 'object' && 'data' in embedding) {
      // Handle complex object with data property
      embeddingArray = Array.from((embedding as any).data);
    } else if (embedding instanceof Float32Array) {
      // Handle Float32Array
      embeddingArray = Array.from(embedding);
    } else if (Array.isArray(embedding)) {
      // Handle regular array
      embeddingArray = embedding as number[];
    } else {
      // Fallback: try to convert to array
      embeddingArray = Array.from(embedding as any);
    }

    if (useCache) {
      embeddingCache.set(text, embeddingArray);
    }

    return embeddingArray;
  } catch (error) {
    console.error('[EmbeddingService] Failed to generate embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error' }`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * 
 * @param texts - Array of texts to generate embeddings for
 * @param useCache - Whether to use cached embeddings (default: true)
 * @returns Promise that resolves to an array of embedding arrays
 * @throws Error if embedding generation fails
 */
export async function generateBatchEmbeddings(texts: string[], useCache: boolean = true): Promise<number[][]> {
  if (texts.length === 0) return [];

  const pipeline = await getEmbeddingPipeline();
  const embeddings: number[][] = [];

  for (const text of texts) {
    try {
      if (useCache && embeddingCache.has(text)) {
        embeddings.push(embeddingCache.get(text)!);
      } else {
        const embedding = await pipeline(text);
        
        // Extract array data from complex object or convert Float32Array
        let embeddingArray: number[];
        if (embedding && typeof embedding === 'object' && 'data' in embedding) {
          embeddingArray = Array.from((embedding as any).data);
        } else if (embedding instanceof Float32Array) {
          embeddingArray = Array.from(embedding);
        } else if (Array.isArray(embedding)) {
          embeddingArray = embedding as number[];
        } else {
          embeddingArray = Array.from(embedding as any);
        }
        
        embeddings.push(embeddingArray);
        if (useCache) {
          embeddingCache.set(text, embeddingArray);
        }
      }
    } catch (error) {
      console.error(`[EmbeddingService] Failed to generate embedding for text: ${text.substring(0, 50)}...`);
      // Continue with next text instead of failing entire batch
      embeddings.push(new Array(384).fill(0)); // Fallback zero embedding
    }
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two embeddings
 * 
 * @param embedding1 - First embedding array
 * @param embedding2 - Second embedding array
 * @returns Similarity score between 0 and 1
 */
export function calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
    return 0;
  }

  if (embedding1.length !== embedding2.length) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    const val1 = Number(embedding1[i]);
    const val2 = Number(embedding2[i]);
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  }

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Find most similar embeddings from a list of candidates
 * 
 * @param queryEmbedding - Query embedding to compare against
 * @param candidateEmbeddings - Array of candidate embeddings
 * @param topK - Number of top results to return (default: 5)
 * @param threshold - Minimum similarity threshold (default: 0.5)
 * @returns Array of objects with index and similarity score, sorted by similarity descending
 */
export function findMostSimilar(
  queryEmbedding: number[],
  candidateEmbeddings: number[][],
  topK: number = 5,
  threshold: number = 0.5
): Array<{ index: number; similarity: number }> {
  if (!Array.isArray(candidateEmbeddings) || candidateEmbeddings.length === 0) {
    return [];
  }

  const similarities = candidateEmbeddings.map((embedding, index) => ({
    index,
    similarity: calculateCosineSimilarity(queryEmbedding, embedding)
  }));

  // Filter by threshold and sort by similarity (descending)
  const filtered = similarities.filter(result => result.similarity >= threshold);
  const sorted = filtered.sort((a, b) => b.similarity - a.similarity);

  // Return top-k results
  return sorted.slice(0, topK);
}

/**
 * Chunk text into smaller pieces for better embedding generation
 * 
 * @param text - Text to chunk
 * @param maxLength - Maximum chunk length in characters (default: 1000)
 * @param overlap - Overlap between chunks in characters (default: 200)
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxLength: number = 1000, overlap: number = 200): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxLength, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }

  return chunks;
}

/**
 * Clear the embedding cache
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  console.log('[EmbeddingService] Embedding cache cleared');
}

/**
 * Get cache statistics
 * @returns Object with cache size and pipeline status
 */
export function getCacheStats() {
  return {
    cacheSize: embeddingCache.size,
    pipelineInitialized: isPipelineInitialized,
    pipelineLoading: pipelineInitPromise !== null
  };
}
