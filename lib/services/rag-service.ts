/**
 * RAG (Retrieval-Augmented Generation) Service
 * 
 * This service orchestrates the complete RAG pipeline:
 * 1. Retrieves relevant knowledge from the knowledge base
 * 2. Builds context-aware prompts with retrieved information
 * 3. Calls AI providers with the augmented prompt
 * 4. Returns responses with source attribution
 * 5. Handles caching and strict mode
 * 
 * Key Features:
 * - Semantic knowledge retrieval
 * - Context-aware prompt building
 * - Query caching (1 hour TTL)
 * - Strict mode (refuse answers not in knowledge base)
 * - Source attribution with relevance scores
 * - Token usage tracking
 * - Provider fallback
 * 
 * @module rag-service
 */

import { PrismaClient } from '@prisma/client';
import { semanticSearch, hybridSearch as hybridSearchFn, type KnowledgeResult } from './knowledge-retriever';

const prisma = new PrismaClient();

/**
 * Cache for RAG query results
 * Key: query text, Value: { response, sources, timestamp }
 */
const ragCache = new Map<string, {
  response: string;
  sources: KnowledgeResult[];
  timestamp: number;
  provider: string;
}>();

const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

/**
 * RAG configuration options
 */
export interface RAGOptions {
  strictMode?: boolean; // Refuse answers not in knowledge base (default: false)
  useCache?: boolean; // Use query cache (default: true)
  maxSources?: number; // Maximum sources to include (default: 5)
  similarityThreshold?: number; // Minimum similarity for sources (default: 0.5)
  hybridSearch?: boolean; // Use hybrid search (default: false)
  category?: string; // Filter by category
  includeUserContext?: boolean; // Include user context in prompt (default: true)
  temperature?: number; // AI temperature (default: 0.7)
  maxTokens?: number; // Maximum tokens in response (default: 1000)
}

/**
 * RAG response with metadata
 */
export interface RAGResponse {
  response: string;
  sources: KnowledgeResult[];
  fromCache: boolean;
  provider: string;
  strictModeActive: boolean;
  sourcesFound: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  processingTime: number;
}

/**
 * Main RAG function - retrieves knowledge and generates response
 * 
 * @param query - The user's query
 * @param userContext - Optional user context string
 * @param options - RAG configuration options
 * @returns Promise that resolves to RAG response with sources
 * @throws Error if RAG generation fails
 * 
 * @example
 * const result = await generateRAGResponse(
 *   'How do I submit assignments?',
 *   'User is a student in CS 101',
 *   { strictMode: true, maxSources: 3 }
 * );
 * console.log(result.response);
 * console.log(result.sources); // Array of sources with similarity scores
 */
export async function generateRAGResponse(
  query: string,
  userContext: string = '',
  options: RAGOptions = {}
): Promise<RAGResponse> {
  const {
    strictMode = false,
    useCache = true,
    maxSources = 3,
    similarityThreshold = 0.5,
    hybridSearch = false,
    category,
    includeUserContext = true,
    temperature = 0.7,
    maxTokens = 350
  } = options;

  console.log(`[RAGService] Generating RAG response for: "${query.substring(0, 50)}..."`);
  const startTime = Date.now();

  // Check cache first
  if (useCache) {
    const cached = ragCache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[RAGService] Cache hit for query');
      return {
        response: cached.response,
        sources: cached.sources,
        fromCache: true,
        provider: cached.provider,
        strictModeActive: strictMode,
        sourcesFound: cached.sources.length,
        processingTime: Date.now() - startTime
      };
    }
  }

  try {
    // Retrieve relevant knowledge
    console.log('[RAGService] Retrieving relevant knowledge...');
    const searchStartTime = Date.now();

    let sources: KnowledgeResult[];
    try {
      if (hybridSearch) {
        sources = await hybridSearchFn(query, {
          limit: maxSources,
          threshold: similarityThreshold,
          category
        });
      } else {
        sources = await semanticSearch(query, {
          limit: maxSources,
          threshold: similarityThreshold,
          category
        });
      }
    } catch (searchError) {
      console.warn('[RAGService] Semantic search failed, falling back to keyword search:', searchError);
      // Fall back to keyword search if semantic search fails
      const { keywordSearch } = await import('./knowledge-retriever');
      sources = await keywordSearch(query, {
        limit: maxSources,
        category
      });
    }

    // A document and its chunks can match the same question. Keep only the
    // strongest result per knowledge entry so the answer stays focused.
    const uniqueSources = new Map<string, KnowledgeResult>();
    for (const source of sources) {
      const existing = uniqueSources.get(source.id);
      if (!existing || source.similarity > existing.similarity) {
        uniqueSources.set(source.id, source);
      }
    }
    sources = Array.from(uniqueSources.values())
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, maxSources);

    const searchTime = Date.now() - searchStartTime;
    console.log(`[RAGService] Knowledge retrieval completed in ${searchTime}ms, found ${sources.length} sources`);

    // Check if we have enough sources for strict mode
    if (strictMode && sources.length === 0) {
      const strictResponse = buildStrictModeRefusal(query);
      return {
        response: strictResponse,
        sources: [],
        fromCache: false,
        provider: 'none',
        strictModeActive: true,
        sourcesFound: 0,
        processingTime: Date.now() - startTime
      };
    }

    // Build the augmented prompt
    const prompt = buildRAGPrompt(query, sources, userContext, includeUserContext, strictMode);

    // Call AI provider
    console.log('[RAGService] Calling AI provider...');
    const aiStartTime = Date.now();

    const aiResponse = await callAIProvider(prompt, temperature, maxTokens);

    const aiTime = Date.now() - aiStartTime;
    console.log(`[RAGService] AI response generated in ${aiTime}ms`);

    // Cache the result
    if (useCache) {
      ragCache.set(query, {
        response: aiResponse.text,
        sources,
        timestamp: Date.now(),
        provider: aiResponse.provider
      });

      // Clean up old cache entries
      cleanCache();
    }

    const processingTime = Date.now() - startTime;
    console.log(`[RAGService] RAG response completed in ${processingTime}ms`);

    return {
      response: aiResponse.text,
      sources,
      fromCache: false,
      provider: aiResponse.provider,
      strictModeActive: strictMode,
      sourcesFound: sources.length,
      tokenUsage: aiResponse.tokenUsage,
      processingTime
    };
  } catch (error) {
    console.error('[RAGService] RAG generation failed:', error);
    throw new Error(`RAG generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build the RAG-augmented prompt with retrieved knowledge
 * 
 * @param query - The user's query
 * @param sources - Retrieved knowledge sources
 * @param userContext - User context string
 * @param includeUserContext - Whether to include user context
 * @param strictMode - Whether strict mode is active
 * @returns The augmented prompt string
 */
function buildRAGPrompt(
  query: string,
  sources: KnowledgeResult[],
  userContext: string,
  includeUserContext: boolean,
  strictMode: boolean
): string {
  let prompt = '';

  // AI identity
  prompt += `You are Atbriz Ai, an intelligent learning assistant designed to help students succeed.\n\n`;

  // Add user context if provided
  if (includeUserContext && userContext) {
    prompt += `${userContext}\n\n`;
  }

  // Add strict mode instructions
  if (strictMode) {
    prompt += `STRICT MODE: You must ONLY answer questions using the information provided in the knowledge base below. ` +
      `If the information is not present in the knowledge base, politely state that you don't have that information ` +
      `in your knowledge base and suggest where the user might find help. Do not use outside knowledge or make assumptions.\n\n`;
  }

  // Add knowledge base context
  if (sources.length > 0) {
    prompt += `RELEVANT KNOWLEDGE BASE:\n`;
    prompt += `The following information from the knowledge base is relevant to the user's question:\n\n`;

    sources.forEach((source, index) => {
      prompt += `## Source ${index + 1} (Relevance: ${(source.similarity * 100).toFixed(1)}%)\n`;
      prompt += `**Title:** ${source.title}\n`;
      prompt += `**Category:** ${source.category}${source.subcategory ? ` > ${source.subcategory}` : ''}\n`;
      if (source.difficulty) {
        prompt += `**Difficulty:** ${source.difficulty}\n`;
      }
      prompt += `**Content:** ${source.content}\n`;
      if (source.summary) {
        prompt += `**Summary:** ${source.summary}\n`;
      }
      if (source.tags.length > 0) {
        prompt += `**Tags:** ${source.tags.join(', ')}\n`;
      }
      prompt += `\n`;
    });

    prompt += `---\n\n`;
    prompt += `INSTRUCTIONS:\n`;
    prompt += `- Answer only what the user asked, using the knowledge base above\n`;
    prompt += `- Give a concise answer in 2 to 5 short sentences\n`;
    prompt += `- Use at most 3 short bullet points when a list is necessary\n`;
    prompt += `- Do not repeat the question, add an introduction, or provide a long guide\n`;
    prompt += `- Do not mention source numbers or print a references section\n`;
    prompt += `- If the knowledge base doesn't contain the answer, say so in one sentence\n`;
    if (strictMode) {
      prompt += `- In strict mode, do NOT use any outside knowledge or information not in the sources\n`;
    }
    prompt += `\n`;
  } else {
    prompt += `NO RELEVANT KNOWLEDGE FOUND\n\n`;
    if (strictMode) {
      prompt += `Since no relevant information was found in the knowledge base, you must state that you ` +
        `cannot answer this question based on the available knowledge base.\n\n`;
    } else {
      prompt += `No specific information was found in the knowledge base for this question. ` +
        `You may provide general guidance based on your training, but should clearly indicate ` +
        `that this is not from the knowledge base.\n\n`;
    }
  }

  // Add the user's question
  prompt += `USER QUESTION:\n${query}\n\n`;

  // Add response guidelines
  prompt += `RESPONSE GUIDELINES:\n`;
  prompt += `- Keep the response short and direct\n`;
  prompt += `- Never expose passwords, tuition, grades, tokens, or private database fields\n`;
  prompt += `- Do not invent details that are not in the supplied data\n\n`;

  return prompt;
}

/**
 * Build a strict mode refusal message
 * 
 * @param query - The user's query
 * @returns Refusal message
 */
function buildStrictModeRefusal(query: string): string {
  return `I'm sorry, but I don't have information about "${query}" in my knowledge base. ` +
    `In strict mode, I can only answer questions using information from the knowledge base. ` +
    `Please try rephrasing your question or contact support for assistance with this topic.`;
}

/**
 * Call the appropriate AI provider
 * 
 * @param prompt - The augmented prompt
 * @param temperature - AI temperature
 * @param maxTokens - Maximum tokens
 * @returns Promise that resolves to AI response with metadata
 */
async function callAIProvider(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<{ text: string; provider: string; tokenUsage?: { prompt: number; completion: number; total: number } }> {
  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    throw new Error('OpenRouter API key not configured');
  }

  try {
    console.log('[RAGService] Using openrouter provider');
    const response = await callOpenAI(prompt, temperature, maxTokens);
    return { text: response.text, provider: 'openrouter', tokenUsage: response.tokenUsage };
  } catch (error) {
    console.error('[RAGService] openrouter provider failed:', error);
    throw error;
  }
}

/**
 * Call OpenRouter API
 */
async function callOpenAI(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<{ text: string; tokenUsage?: { prompt: number; completion: number; total: number } }> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error('OpenRouter API key not configured');
  const model = process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4.1-mini';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Selfless CE'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_completion_tokens: maxTokens
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI API error');
  }

  const text = data.choices?.[0]?.message?.content || '';
  const tokenUsage = data.usage ? {
    prompt: data.usage.prompt_tokens || 0,
    completion: data.usage.completion_tokens || 0,
    total: data.usage.total_tokens || 0
  } : undefined;

  console.log(`[RAGService] OpenAI token usage:`, tokenUsage);

  return { text, tokenUsage };
}

/**
 * Clean up old cache entries
 */
function cleanCache(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of ragCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      ragCache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[RAGService] Cleaned ${cleaned} expired cache entries`);
  }
}

/**
 * Clear the RAG cache
 * Useful for forcing regeneration or freeing memory
 * 
 * @example
 * clearRAGCache();
 */
export function clearRAGCache(): void {
  const cacheSize = ragCache.size;
  ragCache.clear();
  console.log(`[RAGService] Cleared RAG cache (${cacheSize} entries)`);
}

/**
 * Get cache statistics
 * 
 * @returns Object with cache size and memory usage estimate
 * 
 * @example
 * const stats = getRAGCacheStats();
 * console.log(stats); // {size: 50, estimatedMemoryBytes: 5120000}
 */
export function getRAGCacheStats(): { size: number; estimatedMemoryBytes: number } {
  // Estimate memory: assume average 500 chars per response, 100KB per entry
  const estimatedMemory = ragCache.size * 100 * 1024;

  return {
    size: ragCache.size,
    estimatedMemoryBytes: estimatedMemory
  };
}

/**
 * Check if RAG is available (has embeddings in knowledge base)
 * 
 * @returns Promise that resolves to true if RAG is available
 */
export async function isRAGAvailable(): Promise<boolean> {
  try {
    // For MongoDB, we need to check if embedding exists and has elements
    const entries = await prisma.aIKnowledgeBase.findMany({
      where: {
        isActive: true
      },
      select: {
        embedding: true
      },
      take: 1
    });

    // Check if any entry has a non-empty embedding
    const hasEmbeddings = entries.some(entry => 
      Array.isArray(entry.embedding) && entry.embedding.length > 0
    );

    return hasEmbeddings;
  } catch (error) {
    console.error('[RAGService] Failed to check RAG availability:', error);
    return false;
  }
}