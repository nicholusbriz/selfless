import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message, Conversation, ChatUser, ChatState } from '@/types';
import { useAuth } from './useAuth';

// API endpoints
const CHAT_ENDPOINTS = {
  CONVERSATIONS: '/api/chat/conversations',
  MESSAGES: '/api/chat/messages',
  SEND_MESSAGE: '/api/chat/send',
  MARK_READ: '/api/chat/mark-read',
  USERS: '/api/chat/users',
  ONLINE_USERS: '/api/chat/online-users',
};

// Helper function to make authenticated API calls
const makeAuthenticatedRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important for JWT cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// Hook for managing conversations
export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) return [];

      const response = await makeAuthenticatedRequest(`${CHAT_ENDPOINTS.CONVERSATIONS}?userId=${user.id}`);
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const markAsRead = useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      const response = await makeAuthenticatedRequest(CHAT_ENDPOINTS.MARK_READ, {
        method: 'POST',
        body: JSON.stringify({ conversationId, userId: user?.id }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });

  return {
    conversations,
    isLoading,
    error,
    markAsRead,
  };
};

// Hook for managing messages in a conversation
export const useMessages = (conversationId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId || !user?.id) return [];

      const response = await makeAuthenticatedRequest(`${CHAT_ENDPOINTS.MESSAGES}?conversationId=${conversationId}`);
      return response.json();
    },
    enabled: !!conversationId && !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, receiverId }: { content: string; receiverId: string }) => {
      const response = await makeAuthenticatedRequest(CHAT_ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        body: JSON.stringify({
          senderId: user?.id,
          receiverId,
          content,
        }),
      });
      return response.json();
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => [...old, newMessage]);
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};

// Hook for getting available users to chat with
export const useChatUsers = () => {
  const { user } = useAuth();

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-users'],
    queryFn: async (): Promise<ChatUser[]> => {
      if (!user?.id) return [];

      const response = await makeAuthenticatedRequest(`${CHAT_ENDPOINTS.USERS}?currentUserId=${user.id}`);
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    users,
    isLoading,
    error,
  };
};

// Hook for managing online users
export const useOnlineUsers = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let interval: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchOnlineUsers = async () => {
      try {
        const response = await makeAuthenticatedRequest(CHAT_ENDPOINTS.ONLINE_USERS);
        const users = await response.json();
        setOnlineUsers(users);
        retryCount = 0; // Reset retry count on success
        setIsPolling(true);
      } catch (error) {
        console.error('Failed to fetch online users:', error);
        retryCount++;

        // Stop polling after max retries on auth errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('401') || retryCount >= maxRetries) {
          console.log('Stopping online users polling due to repeated failures');
          if (interval) clearInterval(interval);
          setIsPolling(false);
        }
      }
    };

    // Initial fetch
    fetchOnlineUsers();

    // Start polling after successful initial fetch
    interval = setInterval(fetchOnlineUsers, 30000); // Poll every 30 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.id]);

  return { onlineUsers, isPolling };
};

// Main chat hook that combines all chat functionality
export const useChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { conversations, isLoading: conversationsLoading, markAsRead } = useConversations();
  const { messages, isLoading: messagesLoading, sendMessage } = useMessages(activeConversation?.id);
  const { users, isLoading: usersLoading } = useChatUsers();
  const { onlineUsers } = useOnlineUsers();

  // Delete message function
  const deleteMessage = async (messageId: string, deleteForEveryone: boolean = false) => {
    try {
      console.log('🗑️ Starting delete for message:', messageId);

      const response = await fetch('/api/chat/delete-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        body: JSON.stringify({ messageId, deleteForEveryone }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      const result = await response.json();
      console.log('✅ Server response:', result);

      // Force invalidate and refetch messages from server
      console.log('🔄 Invalidating cache for conversation:', activeConversation?.id);
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversation?.id] });

      // Also invalidate conversations cache to update the conversation list
      console.log('🔄 Invalidating conversations cache');
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });

      return result;
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const selectConversation = useCallback((conversation: Conversation | null) => {
    setActiveConversation(conversation || undefined);
    setIsChatOpen(!!conversation);

    // Mark messages as read
    if (conversation && conversation.unreadCount > 0) {
      markAsRead.mutate({ conversationId: conversation.id });
    }
  }, [markAsRead]);

  const startNewConversation = useCallback((targetUser: ChatUser) => {
    console.log('🔍 Starting conversation with:', targetUser.name, 'ID:', targetUser.id);
    console.log('🔍 Current conversations:', conversations.map(c => ({
      id: c.id,
      participants: c.participants.map(p => p.userId)
    })));

    // Find existing conversation between these two specific users
    const existing = conversations.find(conv =>
      conv.participants.some(p => p.userId === targetUser.id) &&
      conv.participants.some(p => p.userId === user?.id)
    );

    console.log('🔍 Found existing conversation:', existing ? existing.id : 'None');

    if (existing) {
      console.log('🔄 Selecting existing conversation');
      selectConversation(existing);
    } else {
      // Create new conversation with proper ID format (sorted for consistency)
      const participantIds = [user?.id || '', targetUser.id].sort();
      const newConv: Conversation = {
        id: `conv-${participantIds[0]}-${participantIds[1]}`,
        participants: [
          { userId: user?.id || '', userName: user?.fullName || `${user?.firstName} ${user?.lastName}` },
          { userId: targetUser.id, userName: targetUser.name },
        ],
        lastMessage: undefined,
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      selectConversation(newConv);
    }
  }, [conversations, selectConversation, user]);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setActiveConversation(undefined);
  }, []);

  return {
    // State
    activeConversation,
    conversations,
    messages,
    users,
    onlineUsers,
    isChatOpen,
    totalUnreadCount,

    // Loading states
    isLoading: conversationsLoading || messagesLoading || usersLoading,

    // Actions
    selectConversation,
    startNewConversation,
    closeChat,
    sendMessage,
    deleteMessage,
    markAsRead,
    setIsChatOpen,
  };
};
