import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message, Conversation, ChatUser } from '@/types';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { CHAT_ENDPOINTS } from '@/config/constants';

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
    // Try to get more specific error information
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If response is not JSON, keep the status error
    }
    throw new Error(errorMessage);
  }

  return response;
};

// Hook for managing conversations
export const useConversations = () => {
  const { user } = useUserStatus();

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


  return {
    conversations,
    isLoading,
    error,
  };
};

// Hook for managing messages in a conversation
export const useMessages = (conversationId?: string) => {
  const { user } = useUserStatus();
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
  const { user } = useUserStatus();

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-users'],
    queryFn: async (): Promise<ChatUser[]> => {
      if (!user?.id) return [];

      const response = await makeAuthenticatedRequest(`${CHAT_ENDPOINTS.USERS}?currentUserId=${user.id}`);
      const result = await response.json();
      return result.users || [];
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


// Main chat hook that combines all chat functionality
export const useChat = () => {
  const { user } = useUserStatus();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, isLoading: messagesLoading, sendMessage } = useMessages(activeConversation?.id);
  const { users, isLoading: usersLoading } = useChatUsers();

  // Delete message function
  const deleteMessage = async (messageId: string) => {
    try {
      console.log('🗑️ Starting delete for message:', messageId);

      const response = await fetch('/api/chat/delete-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        body: JSON.stringify({ messageId }),
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

  }, []);

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
    setIsChatOpen,
  };
};
