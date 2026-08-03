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
}

export function useAIKnowledgeBase() {
  // Fetch all knowledge base with caching
  const { data: knowledgeBase, isLoading } = useQuery({
    queryKey: ['ai-knowledge-base'],
    queryFn: async () => {
      const response = await fetch('/api/ai/knowledge-base');
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
    isLoading,
  };
}