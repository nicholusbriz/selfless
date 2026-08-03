import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

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
    isLoading,
    userId,
  };
}