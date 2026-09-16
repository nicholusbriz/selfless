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
 * - Graceful fallback for serverless environments
 * 
 * @module embedding-service
 */

// Try to import transformers, but handle serverless environments gracefully
interface TransformersEnvironment {
  allowLocalModels: boolean;
  allowRemoteModels: boolean;
}

interface ProgressUpdate {
  status?: string;
  progress?: number;
}

interface PipelineOptions {
  progress_callback?: (progress: ProgressUpdate) => void;
  quantized?: boolean;
  device?: string;
}

interface EmbeddingPipeline {
  (text: string, options?: Record<string, unknown>): Promise<unknown>;
}

interface TransformersModule {
  env?: TransformersEnvironment;
  pipeline: (
    task: string,
    model: string,
    options?: PipelineOptions
  ) => Promise<EmbeddingPipeline>;
}

let transformers: TransformersModule | null = null;
let transformersAvailable = false;
let transformersImportPromise: Promise<TransformersModule> | null = null;

// Function to initialize transformers import
async function initializeTransformers() {
  if (transformersAvailable || transformersImportPromise) {
    return transformersImportPromise;
  }
  
  transformersImportPromise = (async () => {
    try {
      const transformersModule = (await import(
        '@xenova/transformers'
      )) as unknown as TransformersModule;
      transformers = transformersModule;
      transformersAvailable = true;
      
      // Configure transformers.js to use local cache
      if (transformers.env) {
        transformers.env.allowLocalModels = true;
        transformers.env.allowRemoteModels = true;
      }
      
      console.log('[EmbeddingService] @xenova/transformers loaded successfully');
      return transformers;
    } catch (error) {
      console.warn('[EmbeddingService] @xenova/transformers not available, embedding features disabled');
      transformersAvailable = false;
      transformersImportPromise = null;
      throw error;
    }
  })();
  
  return transformersImportPromise;
}

// Cache for the embedding pipeline to avoid reloading
let embeddingPipeline: EmbeddingPipeline | null = null;
let pipelineInitPromise: Promise<EmbeddingPipeline> | null = null;
let isPipelineInitialized = false;

// Keep inference serial so multiple requests cannot multiply model memory use.
let embeddingQueue: Promise<unknown> = Promise.resolve();

// Cache for generated embeddings to avoid regeneration
const embeddingCache = new Map<string, number[]>();

function toEmbeddingArray(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is number => typeof item === 'number'
    );
  }

  if (value instanceof Float32Array) {
    return Array.from(value);
  }

  if (ArrayBuffer.isView(value)) {
    return Array.from(value as unknown as ArrayLike<number>);
  }

  if (typeof value === 'object' && value !== null && 'data' in value) {
    return toEmbeddingArray(value.data);
  }

  throw new Error('Embedding output has an unsupported format');
}

/**
 * Initialize the embedding pipeline
 * Loads the all-MiniLM-L6-v2 model for generating 384-dimensional embeddings
 * 
 * @returns Promise that resolves to the embedding pipeline
 * @throws Error if model loading fails or transformers not available
 */
async function getEmbeddingPipeline(): Promise<EmbeddingPipeline> {
  // Initialize transformers first
  await initializeTransformers();
  
  // Check if transformers is available
  if (!transformersAvailable || !transformers) {
    throw new Error('Transformers library not available in this environment');
  }

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
  
  pipelineInitPromise = transformers.pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      quantized: true,
      device: 'cpu',
      progress_callback: (progress: ProgressUpdate) => {
        if (progress.status === 'progress') {
          const progressValue = progress.progress ?? 0;
          const currentProgress = Math.round(
            progressValue > 1 ? progressValue : progressValue * 100
          );
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

  // Initialize transformers
  await initializeTransformers();

  // Check if transformers is available
  if (!transformersAvailable) {
    throw new Error('Embedding generation not available in this environment');
  }

  try {
    const pipeline = await getEmbeddingPipeline();
    const safeText = text.trim().slice(0, 6000);
    const inference = embeddingQueue.then(() =>
      pipeline(safeText, {
        pooling: 'mean',
        normalize: true,
        truncation: true,
        max_length: 256,
      }),
    );
    embeddingQueue = inference.catch(() => undefined);
    const embedding = await inference;

    const embeddingArray = toEmbeddingArray(embedding);

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
  const embeddings: number[][] = [];

  for (const text of texts) {
    try {
      embeddings.push(await generateEmbedding(text, useCache));
    } catch {
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
  if (maxLength <= 0) {
    throw new Error('Chunk maxLength must be greater than zero');
  }

  const safeOverlap = Math.max(0, Math.min(overlap, maxLength - 1));

  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxLength, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) {
      break;
    }
    start = end - safeOverlap;
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
