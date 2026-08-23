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
    maxSources = 5,
    similarityThreshold = 0.5,
    hybridSearch = false,
    category,
    includeUserContext = true,
    temperature = 0.7,
    maxTokens = 1000
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
    prompt += `- Use the knowledge base information above to answer the user's question\n`;
    prompt += `- Cite which source(s) you used in your answer (e.g., "According to Source 1...")\n`;
    prompt += `- If multiple sources provide relevant information, synthesize them together\n`;
    prompt += `- Be specific and reference the actual content from the sources\n`;
    prompt += `- If the knowledge base doesn't contain the answer, politely state this\n`;
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
  prompt += `- Be helpful, educational, and encouraging\n`;
  prompt += `- Provide clear, well-structured answers\n`;
  prompt += `- If using code examples, format them properly\n`;
  prompt += `- Reference yourself as "Atbriz Ai" when appropriate\n`;
  prompt += `- Adapt your response style based on the user's context if provided\n\n`;

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
  // Check which AI service to use
  const aiService = (process.env.AI_SERVICE || 'groq').toLowerCase();

  const providerOrder =
    aiService === 'groq'
      ? ['groq']
      : aiService === 'openai'
        ? ['openai']
        : aiService === 'gemini'
          ? ['gemini']
          : ['groq'];

  const providers = {
    gemini: {
      configured: () => typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.trim().length > 0,
      call: () => callGemini(prompt, temperature, maxTokens)
    },
    openai: {
      configured: () => typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.trim().length > 0,
      call: () => callOpenAI(prompt, temperature, maxTokens)
    },
    groq: {
      configured: () => typeof process.env.GROQ_API_KEY === 'string' && process.env.GROQ_API_KEY.trim().length > 0,
      call: () => callGroq(prompt, temperature, maxTokens)
    }
  };

  // Try providers in order
  for (const providerName of providerOrder) {
    const provider = providers[providerName as keyof typeof providers];
    if (provider.configured()) {
      try {
        console.log(`[RAGService] Using ${providerName} provider`);
        const response = await provider.call();
        return { text: response.text, provider: providerName, tokenUsage: response.tokenUsage };
      } catch (error) {
        console.error(`[RAGService] ${providerName} provider failed:`, error);
        // Continue to next provider
      }
    }
  }

  throw new Error('No AI providers are configured or available');
}

/**
 * Call Gemini API
 */
async function callGemini(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<{ text: string; tokenUsage?: { prompt: number; completion: number; total: number } }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('Gemini API key not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini API error');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokenUsage = data.usageMetadata ? {
    prompt: data.usageMetadata.promptTokenCount || 0,
    completion: data.usageMetadata.candidatesTokenCount || 0,
    total: data.usageMetadata.totalTokenCount || 0
  } : undefined;

  console.log(`[RAGService] Gemini token usage:`, tokenUsage);

  return { text, tokenUsage };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<{ text: string; tokenUsage?: { prompt: number; completion: number; total: number } }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens
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
 * Call Groq API
 * ✅ FIXED: Updated to use the latest supported model
 */
async function callGroq(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<{ text: string; tokenUsage?: { prompt: number; completion: number; total: number } }> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error('Groq API key not configured');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      // ✅ FIXED: Updated to use the latest supported model
      model: 'llama-3.1-70b-versatile', // Alternative: 'mixtral-8x7b-32768' or 'llama3-8b-8192'
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Groq API error');
  }

  const text = data.choices?.[0]?.message?.content || '';
  const tokenUsage = data.usage ? {
    prompt: data.usage.prompt_tokens || 0,
    completion: data.usage.completion_tokens || 0,
    total: data.usage.total_tokens || 0
  } : undefined;

  console.log(`[RAGService] Groq token usage:`, tokenUsage);

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