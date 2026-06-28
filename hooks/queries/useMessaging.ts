import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { Conversation, Message } from '@/types/messaging';

// Query Keys
const messagingKeys = {
  all: ['messaging'] as const,
  conversations: () => [...messagingKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...messagingKeys.conversations(), id] as const,
  messages: () => [...messagingKeys.all, 'messages'] as const,
  messagesByConversation: (conversationId: string) => 
    [...messagingKeys.messages(), conversationId] as const,
  searchUsers: (query: string) => [...messagingKeys.all, 'search', query] as const,
  userStatus: (userId: string) => [...messagingKeys.all, 'status', userId] as const,
};

export const messagingQueryKeys = messagingKeys;

// ============================================
// QUERIES
// ============================================

/**
 * Fetch all conversations for current user
 */
export const useConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: messagingKeys.conversations(),
    queryFn: async () => {
      const { data } = await axios.get('/api/conversations');
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

/**
 * Fetch messages for a specific conversation (paginated)
 */
export const useMessages = (
  conversationId: string | null,
  page: number = 1,
  limit: number = 30
) => {
  return useQuery<Message[]>({
    queryKey: messagingKeys.messagesByConversation(conversationId || ''),
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/conversations/${conversationId}/messages`,
        { params: { page, limit } }
      );
      return data;
    },
    enabled: !!conversationId,
    staleTime: 0, // Always refetch (real-time messages)
  });
};

/**
 * Search for users to start a conversation
 */
export const useSearchUsers = (query: string) => {
  return useQuery<any[]>({
    queryKey: messagingKeys.searchUsers(query),
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data } = await axios.get('/api/users/search', {
        params: { q: query },
      });
      return data;
    },
    enabled: query.trim().length >= 2,
  });
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new conversation with a user
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (participantId: string) => {
      const { data } = await axios.post('/api/conversations', {
        participantId,
      });
      return data as Conversation;
    },
    onSuccess: (newConversation) => {
      // Add to conversations list
      queryClient.setQueryData(
        messagingKeys.conversations(),
        (oldConversations: Conversation[] | undefined) => {
          if (!oldConversations) return [newConversation];
          if (oldConversations.some((conversation) => conversation.id === newConversation.id)) {
            return oldConversations;
          }
          return [newConversation, ...oldConversations];
        }
      );
    },
  });
};

/**
 * Send a message in a conversation
 */
export const useSendMessage = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content, receiverId }: { content: string; receiverId: string }) => {
      if (!conversationId) throw new Error('Conversation ID required');
      
      const { data } = await axios.post(
        `/api/conversations/${conversationId}/messages`,
        { content, receiverId }
      );
      return data as Message;
    },
    onSuccess: (newMessage) => {
      if (!conversationId) return;
      
      // Update messages list
      queryClient.setQueryData(
        messagingKeys.messagesByConversation(conversationId),
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return [newMessage];
          return [...oldMessages, newMessage];
        }
      );

      // Update conversation's last message
      queryClient.setQueryData(
        messagingKeys.conversations(),
        (oldConversations: Conversation[] | undefined) => {
          if (!oldConversations) return oldConversations;
          return oldConversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
              : conv
          );
        }
      );
    },
  });
};

/**
 * Mark a single message as read
 */
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data } = await axios.put(`/api/messages/${messageId}`, {
        isRead: true,
      });
      return data as Message;
    },
    onSuccess: (updatedMessage) => {
      // Update message in all conversations
      queryClient.setQueriesData(
        { queryKey: messagingKeys.messages() },
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return oldMessages;
          return oldMessages.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          );
        }
      );
    },
  });
};

/**
 * Mark all messages in a conversation as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data } = await axios.put(
        `/api/conversations/${conversationId}/read`
      );
      return data;
    },
    onSuccess: (_, conversationId) => {
      // Update all messages in conversation to read
      queryClient.setQueryData(
        messagingKeys.messagesByConversation(conversationId),
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return oldMessages;
          return oldMessages.map((msg) => ({
            ...msg,
            isRead: true,
            readAt: msg.readAt || new Date(),
          }));
        }
      );

      // Update conversation unread count
      queryClient.setQueryData(
        messagingKeys.conversations(),
        (oldConversations: Conversation[] | undefined) => {
          if (!oldConversations) return oldConversations;
          return oldConversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          );
        }
      );
    },
  });
};

/**
 * Delete a message
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      await axios.delete(
        `/api/messages/${messageId}`
      );
    },
    onSuccess: (_, { conversationId, messageId }) => {
      // Remove from messages list
      queryClient.setQueryData(
        messagingKeys.messagesByConversation(conversationId),
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return oldMessages;
          return oldMessages.filter((msg) => msg.id !== messageId);
        }
      );
    },
  });
};

// ============================================
// CACHE MANAGEMENT
// ============================================

/**
 * Invalidate conversations cache
 */
export const useInvalidateConversations = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({
    queryKey: messagingKeys.conversations(),
  });
};

/**
 * Invalidate messages for a conversation
 */
export const useInvalidateMessages = () => {
  const queryClient = useQueryClient();
  return (conversationId: string) =>
    queryClient.invalidateQueries({
      queryKey: messagingKeys.messagesByConversation(conversationId),
    });
};
