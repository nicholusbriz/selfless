import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

/**
 * Hook for fetching AI user context with caching
 * 
 * This hook fetches user context data including:
 * - User profile and academic information
 * - Learning profile with preferences
 * - Recent conversation history
 * - Profile recommendations
 * 
 * Features:
 * - TanStack Query caching (5 minutes stale time)
 * - Automatic refetching on session changes
 * - Optimized for RAG system integration
 * 
 * @returns Object with user context data and loading state
 */
export function useAIUserData() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch user context data with caching
  const { data: userContextData, isLoading } = useQuery({
    queryKey: ['ai-user-context', userId],
    queryFn: async () => {
      if (!userId) return null;

      const response = await fetch(`/api/ai/user-context?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user context');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache user data
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: false,
  });

  // The API returns context and profile recommendations
  return {
    userContext: userContextData?.data?.context || '',
    profileRecommendations: userContextData?.data?.profileRecommendations || '',
    learningProfile: userContextData?.data?.learningProfile || null,
    recentTopics: userContextData?.data?.recentTopics || [],
    profileCompleteness: userContextData?.data?.profileCompleteness || null,
    isLoading,
    userId,
  };
}