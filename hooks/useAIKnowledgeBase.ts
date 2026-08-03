import { useQuery } from '@tanstack/react-query';

interface KnowledgeEntry {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  difficulty: string;
  priority: number;
  embedding?: number[];
  isChunked?: boolean;
}

/**
 * Hook for fetching AI knowledge base with caching
 * 
 * This hook fetches knowledge base entries including:
 * - All knowledge base entries
 * - Categories and subcategories
 * - Tags and metadata
 * - Embedding status
 * 
 * Features:
 * - TanStack Query caching (15 minutes stale time)
 * - Optimized for RAG system integration
 * - Long cache time since knowledge base changes infrequently
 * 
 * @param options - Optional configuration
 * @param options.category - Filter by category
 * @param options.subcategory - Filter by subcategory
 * @param options.limit - Maximum results to return
 * 
 * @returns Object with knowledge base data and loading state
 */
export function useAIKnowledgeBase(options?: {
  category?: string;
  subcategory?: string;
  limit?: number;
}) {
  const { category, subcategory, limit } = options || {};

  // Build query key based on options
  const queryKey = ['ai-knowledge-base', category, subcategory, limit].filter(Boolean);

  // Fetch knowledge base with caching
  const { data: knowledgeBase, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (subcategory) params.append('subcategory', subcategory);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/ai/knowledge-base?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge base');
      }
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - cache knowledge base longer
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false,
  });

  return {
    knowledgeBase: knowledgeBase?.data || [],
    total: knowledgeBase?.total || 0,
    hasMore: knowledgeBase?.hasMore || false,
    isLoading,
  };
}