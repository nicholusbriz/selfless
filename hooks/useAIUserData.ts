import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getStringProperty, isJsonObject, readJsonObject } from '@/lib/api-response';

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
      const responseData = await readJsonObject(response);
      const context = isJsonObject(responseData.data) ? responseData.data : {};
      return {
        context: getStringProperty(context, 'context') || '',
        profileRecommendations:
          getStringProperty(context, 'profileRecommendations') || '',
        learningProfile: context.learningProfile || null,
        recentTopics: Array.isArray(context.recentTopics) ? context.recentTopics : [],
        profileCompleteness: context.profileCompleteness || null,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache user data
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: false,
  });

  // The API returns context and profile recommendations
  return {
    userContext: userContextData?.context || '',
    profileRecommendations: userContextData?.profileRecommendations || '',
    learningProfile: userContextData?.learningProfile || null,
    recentTopics: userContextData?.recentTopics || [],
    profileCompleteness: userContextData?.profileCompleteness || null,
    isLoading,
    userId,
  };
}