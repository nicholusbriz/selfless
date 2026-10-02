import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { Message } from '@/types/messaging';
import { createPartySocket } from '@/lib/partykit';

interface UseMessagesProps {
  conversationId: string;
  currentUserId: string;
}

export function useMessages({ conversationId, currentUserId }: UseMessagesProps) {
  const queryClient = useQueryClient();
  const markReadRequestRef = useRef<Promise<number> | null>(null);

  // Fetch messages with cache-first strategy
  const { 
    data: messages = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await fetch(`/api/messages/${conversationId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!conversationId && !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: 1,
    retryDelay: 1000,
    // Cache-first: Use cached data immediately, then refetch in background
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments = [] }: { content: string; attachments?: string[] }) => {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, attachments }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['conversations', currentUserId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['messages', 'unread-count', currentUserId],
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Send a message
  const sendMessage = useCallback(async (content: string, attachments: string[] = []) => {
    if (!content.trim() || !conversationId) return;
    await sendMessageMutation.mutateAsync({ content: content.trim(), attachments });
  }, [conversationId, sendMessageMutation]);

  const markMessagesAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return 0;
    if (markReadRequestRef.current) return markReadRequestRef.current;

    const request = fetch(`/api/messages/${conversationId}/mark-read`, {
      method: 'POST',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to mark messages as read');
        const data = await response.json();
        const markedCount = data.markedCount || 0;

        if (markedCount > 0) {
          void queryClient.invalidateQueries({
            queryKey: ['messages', 'unread-count', currentUserId],
          });
          void queryClient.invalidateQueries({
            queryKey: ['conversations', currentUserId],
          });
        }

        return markedCount;
      })
      .finally(() => {
        markReadRequestRef.current = null;
      });

    markReadRequestRef.current = request;
    return request;
  }, [conversationId, currentUserId, queryClient]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markMessagesAsRead,
    isSending: sendMessageMutation.isPending,
    refetch,
  };
}

// Hook to fetch total unread message count for the current user
export function useUnreadMessageCount() {
  const queryClient = useQueryClient();
  const { data: session, update } = useSession();
  const currentUserId = session?.user?.id || '';

  const unreadCountQuery = useQuery({
    queryKey: ['messages', 'unread-count', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return 0;
      try {
        const response = await fetch('/api/messages/unread-count');
        if (!response.ok) {
          // Don't throw error for unauthorized requests, just return 0
          if (response.status === 401 || response.status === 403) {
            return 0;
          }
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch unread count');
        }
        const data = await response.json();
        return data.unreadCount || 0;
      } catch (error) {
        console.error('Error fetching unread message count:', error);
        return 0;
      }
    },
    enabled: !!currentUserId,
    staleTime: Infinity,
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false,
  });

  useEffect(() => {
    if (!currentUserId) return;

    let socket: Awaited<ReturnType<typeof createPartySocket>> = null;
    let disposed = false;

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type !== 'invalidate') return;

        if (payload.resource === 'messages') {
          void queryClient.invalidateQueries({
            queryKey: ['messages', 'unread-count', currentUserId],
          });
          void queryClient.invalidateQueries({
            queryKey: ['conversations', currentUserId],
          });
          if (typeof payload.conversationId === 'string') {
            void queryClient.invalidateQueries({
              queryKey: ['messages', payload.conversationId],
            });
          }
          return;
        }

        if (
          payload.resource === 'social' &&
          payload.userId === currentUserId
        ) {
          void queryClient.invalidateQueries({ queryKey: ['students'] });
          void queryClient.invalidateQueries({ queryKey: ['social'] });
          void queryClient.invalidateQueries({ queryKey: ['connections'] });
          void queryClient.invalidateQueries({
            queryKey: ['currentUserStats', currentUserId],
          });
          return;
        }

        if (
          payload.resource === 'profile' &&
          payload.userId === currentUserId
        ) {
          void update();
          void queryClient.invalidateQueries({ queryKey: ['users'] });
          void queryClient.invalidateQueries({ queryKey: ['students'] });
          void queryClient.invalidateQueries({ queryKey: ['social'] });
        }
      } catch (error) {
        console.error('Failed to process unread message event:', error);
      }
    };

    const handleOpen = () => {
      void queryClient.invalidateQueries({
        queryKey: ['messages', 'unread-count', currentUserId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['conversations', currentUserId],
      });
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    };

    void createPartySocket(`user:${currentUserId}`).then((connectedSocket) => {
      if (!connectedSocket || disposed) {
        connectedSocket?.close();
        return;
      }

      socket = connectedSocket;
      socket.addEventListener('message', handleMessage);
      socket.addEventListener('open', handleOpen);
    });

    return () => {
      disposed = true;
      socket?.removeEventListener('message', handleMessage);
      socket?.removeEventListener('open', handleOpen);
      socket?.close();
    };
  }, [currentUserId, queryClient, update]);

  return unreadCountQuery;
}