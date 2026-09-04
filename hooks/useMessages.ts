import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface UseMessagesProps {
  conversationId: string;
  currentUserId: string;
}

export function useMessages({ conversationId, currentUserId }: UseMessagesProps) {
  const queryClient = useQueryClient();

  // Fetch messages
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
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!conversationId && !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments = [] }: { content: string; attachments?: string[] }) => {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, attachments }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      // Add the new message to the cache without duplicates
      queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => {
        // Check if message already exists
        const exists = old.some((msg: Message) => msg.id === data.message.id);
        if (exists) return old;
        return [...old, data.message];
      });
      
      // Invalidate conversations to update last message preview
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Send a message
  const sendMessage = useCallback(async (content: string, attachments: string[] = []) => {
    if (!content.trim() || !conversationId) return;
    await sendMessageMutation.mutateAsync({ content: content.trim(), attachments });
  }, [conversationId, sendMessageMutation]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, refetch]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    refetch,
  };
}

// Hook to fetch total unread message count for the current user
export function useUnreadMessageCount() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || '';

  return useQuery({
    queryKey: ['messages', 'unread-count', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return 0;
      try {
        const response = await fetch('/api/messages/unread-count');
        if (!response.ok) {
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
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 1000, // Poll every 10 seconds for real-time updates
  });
}