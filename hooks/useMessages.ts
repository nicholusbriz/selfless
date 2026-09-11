import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { Message } from '@/types/messaging';
import { createPartySocket } from '@/lib/partykit';

const activeConversationIds = new Set<string>();
const processedUnreadMessageIds = new Set<string>();

interface UseMessagesProps {
  conversationId: string;
  currentUserId: string;
}

export function useMessages({ conversationId, currentUserId }: UseMessagesProps) {
  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof createPartySocket>>(null);
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

      const socket = socketRef.current;
      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify({
          type: 'message:new',
          conversationId,
          recipientIds: data.recipientIds || [],
          message: data.message,
        }));
      }
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

  const sendRealtimeEvent = useCallback((event: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (socket?.readyState === 1) {
      socket.send(JSON.stringify(event));
    }
  }, []);

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
          queryClient.setQueryData<number>(
            ['messages', 'unread-count', currentUserId],
            (count) => Math.max(0, (count ?? 0) - markedCount)
          );
        }

        return markedCount;
      })
      .finally(() => {
        markReadRequestRef.current = null;
      });

    markReadRequestRef.current = request;
    return request;
  }, [conversationId, currentUserId, queryClient]);

  useEffect(() => {
    if (!conversationId) return;

    activeConversationIds.add(conversationId);
    const socket = createPartySocket(`conversation:${conversationId}`);
    socketRef.current = socket;
    if (!socket) return;

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.conversationId !== conversationId) return;

        if (payload.type === 'message:deleted') {
          queryClient.setQueryData<Message[]>(['messages', conversationId], (oldMessages = []) =>
            oldMessages.filter((message) => message.id !== payload.messageId)
          );
          queryClient.setQueryData(['conversations', currentUserId], (oldConversations: Array<Record<string, unknown>> = []) =>
            oldConversations.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, lastMessage: payload.lastMessage || null }
                : conversation
            )
          );
          return;
        }

        if (payload.type !== 'message:new') return;

        queryClient.setQueryData<Message[]>(['messages', conversationId], (oldMessages = []) => {
          if (oldMessages.some((message) => message.id === payload.message?.id)) return oldMessages;
          return [...oldMessages, payload.message];
        });

        queryClient.setQueryData(['conversations', currentUserId], (oldConversations: Array<Record<string, unknown>> = []) =>
          oldConversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, lastMessage: payload.message, unreadCount: 0 }
              : conversation
          )
        );

        if (payload.message?.senderId !== currentUserId) {
          void markMessagesAsRead().catch((error) => {
            console.error('Failed to mark incoming message as read:', error);
          });
        }
      } catch (error) {
        console.error('Failed to process message event:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.close();
      socketRef.current = null;
      activeConversationIds.delete(conversationId);
    };
  }, [conversationId, currentUserId, markMessagesAsRead, queryClient]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendRealtimeEvent,
    markMessagesAsRead,
    isSending: sendMessageMutation.isPending,
    refetch,
  };
}

// Hook to fetch total unread message count for the current user
export function useUnreadMessageCount() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || '';

  const unreadCountQuery = useQuery({
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
    staleTime: Infinity,
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false,
  });

  useEffect(() => {
    if (!currentUserId) return;

    const socket = createPartySocket(`user:${currentUserId}`);
    if (!socket) return;

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.recipientId !== currentUserId) return;

        if (payload.type === 'message:deleted') {
          if (payload.wasUnread) {
            queryClient.setQueryData<number>(
              ['messages', 'unread-count', currentUserId],
              (count = 0) => Math.max(0, count - 1)
            );
          }
          queryClient.setQueryData(['conversations', currentUserId], (oldConversations: Array<Record<string, unknown>> = []) =>
            oldConversations.map((conversation) =>
              conversation.id === payload.conversationId
                ? {
                    ...conversation,
                    lastMessage: payload.lastMessage || null,
                    unreadCount: payload.wasUnread
                      ? Math.max(0, Number(conversation.unreadCount || 0) - 1)
                      : conversation.unreadCount,
                  }
                : conversation
            )
          );
          return;
        }

        if (payload.type !== 'message:unread') return;

        if (payload.messageId && processedUnreadMessageIds.has(payload.messageId)) return;
        if (payload.messageId) {
          processedUnreadMessageIds.add(payload.messageId);
          if (processedUnreadMessageIds.size > 1000) {
            processedUnreadMessageIds.delete(processedUnreadMessageIds.values().next().value as string);
          }
        }

        const isOpen = activeConversationIds.has(payload.conversationId);
        if (!isOpen) {
          queryClient.setQueryData<number>(
            ['messages', 'unread-count', currentUserId],
            (count = 0) => count + 1
          );
        }

        queryClient.setQueryData(['conversations', currentUserId], (oldConversations: Array<Record<string, unknown>> = []) =>
          oldConversations.map((conversation) =>
            conversation.id === payload.conversationId
              ? {
                  ...conversation,
                  lastMessage: payload.message,
                  unreadCount: isOpen ? 0 : Number(conversation.unreadCount || 0) + 1,
                }
              : conversation
          )
        );
      } catch (error) {
        console.error('Failed to process unread message event:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.close();
  }, [currentUserId, queryClient]);

  return unreadCountQuery;
}