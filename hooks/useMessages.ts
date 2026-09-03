import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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