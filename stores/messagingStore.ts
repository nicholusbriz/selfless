import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  MessagingStore, 
  Conversation, 
  Message, 
  User,
  MessagingState,
  MessagingActions
} from '@/types/messaging';
import { useAuthStore } from '@/stores/authStore';

const initialState: MessagingState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  onlineUsers: new Set<string>(),
  unreadCount: 0,
  searchQuery: '',
  searchResults: [],
  isTyping: {},
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const useMessagingStore = create<MessagingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===== Conversations =====
      
      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/conversations', {
            headers: {
              'x-user-id': getUserId(),
            },
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch conversations');
          }
          
          const conversations: Conversation[] = await response.json();
          
          const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
          
          set({ 
            conversations, 
            unreadCount,
            isLoading: false,
            isInitialized: true
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch conversations',
            isLoading: false 
          });
        }
      },

      setActiveConversation: (conversationId: string | null) => {
        set({ activeConversationId: conversationId });
        
        if (conversationId) {
          const state = get();
          if (!state.messages[conversationId]) {
            state.fetchMessages(conversationId);
          }
          state.markAllAsRead(conversationId);
        }
      },

      createConversation: async (participantId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Check if conversation already exists with this participant
          const state = get();
          const existingConversation = state.conversations.find(conv => 
            conv.participants?.some(p => p.id === participantId)
          );
          
          if (existingConversation) {
            set({ 
              activeConversationId: existingConversation.id,
              isLoading: false 
            });
            return existingConversation;
          }

          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': getUserId(),
            },
            body: JSON.stringify({ participantId }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create conversation');
          }
          
          const conversation: Conversation = await response.json();
          
          set((state) => ({
            conversations: [conversation, ...state.conversations],
            isLoading: false,
            activeConversationId: conversation.id
          }));
          
          return conversation;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create conversation',
            isLoading: false 
          });
          throw error;
        }
      },

      // ===== Messages =====
      
      fetchMessages: async (conversationId: string, page = 1, limit = 30) => {
        const state = get();
        if (state.isLoading) return;
        
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
            {
              headers: {
                'x-user-id': getUserId(),
              },
            }
          );
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch messages');
          }
          
          const messages: Message[] = await response.json();
          
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: page === 1 
                ? messages 
                : [...messages, ...(state.messages[conversationId] || [])]
            },
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch messages',
            isLoading: false 
          });
        }
      },

      sendMessage: async (conversationId: string, content: string) => {
        set({ isLoading: true, error: null });
        try {
          const currentUserId = getUserId();

          const response = await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': currentUserId,
            },
            body: JSON.stringify({
              content
              // receiverId will be auto-determined by the API from conversation participants
            }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send message');
          }
          
          const message: Message = await response.json();
          
          set((state) => {
            const existingMessages = state.messages[conversationId] || [];
            return {
              messages: {
                ...state.messages,
                [conversationId]: [...existingMessages, message]
              },
              isLoading: false,
              conversations: state.conversations.map(conv => 
                conv.id === conversationId 
                  ? { ...conv, lastMessage: message, updatedAt: new Date() }
                  : conv
              )
            };
          });
          
          return message;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false 
          });
          throw error;
        }
      },

      markAsRead: async (messageId: string) => {
        try {
          const response = await fetch(`/api/messages/${messageId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': getUserId(),
            },
            body: JSON.stringify({ isRead: true }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to mark message as read');
          }
          
          set((state) => {
            const updatedMessages: Record<string, Message[]> = {};
            let updated = false;
            
            Object.entries(state.messages).forEach(([convId, messages]) => {
              updatedMessages[convId] = messages.map(msg => {
                if (msg.id === messageId && !msg.isRead) {
                  updated = true;
                  return { ...msg, isRead: true, readAt: new Date() };
                }
                return msg;
              });
            });
            
            const updatedConversations = state.conversations.map(conv => {
              if (conv.lastMessage?.id === messageId && conv.unreadCount > 0) {
                return { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) };
              }
              return conv;
            });
            
            const newUnreadCount = updatedConversations.reduce(
              (sum, conv) => sum + conv.unreadCount, 0
            );
            
            return {
              messages: updatedMessages,
              conversations: updatedConversations,
              unreadCount: newUnreadCount,
            };
          });
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      },

      markAllAsRead: async (conversationId: string) => {
        try {
          const response = await fetch(`/api/conversations/${conversationId}/read`, {
            method: 'PUT',
            headers: {
              'x-user-id': getUserId(),
            },
          });

          if (!response.ok) {
            throw new Error('Failed to mark all messages as read');
          }

          set((state) => {
            const messages = state.messages[conversationId] || [];
            const updatedMessages = messages.map(msg => ({
              ...msg,
              isRead: true,
              readAt: msg.isRead ? msg.readAt : new Date()
            }));

            const conversations = state.conversations.map(conv =>
              conv.id === conversationId
                ? { ...conv, unreadCount: 0 }
                : conv
            );

            const newUnreadCount = conversations.reduce(
              (sum, conv) => sum + conv.unreadCount, 0
            );

            return {
              messages: {
                ...state.messages,
                [conversationId]: updatedMessages
              },
              conversations,
              unreadCount: newUnreadCount,
            };
          });
        } catch (error) {
          console.error('Failed to mark all as read:', error);
        }
      },

      deleteMessage: async (messageId: string, conversationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/messages?messageId=${messageId}&conversationId=${conversationId}`, {
            method: 'DELETE',
            headers: {
              'x-user-id': getUserId(),
            },
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete message');
          }

          set((state) => {
            const updatedMessages = { ...state.messages };
            if (updatedMessages[conversationId]) {
              updatedMessages[conversationId] = updatedMessages[conversationId].filter(
                msg => msg.id !== messageId
              );
            }
            return {
              messages: updatedMessages,
              isLoading: false
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete message',
            isLoading: false
          });
          throw error;
        }
      },

      // ===== Search =====
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        if (query.trim()) {
          get().searchUsers(query);
        } else {
          set({ searchResults: [] });
        }
      },

      searchUsers: async (query: string) => {
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/users/search?q=${encodeURIComponent(query)}`,
            {
              headers: {
                'x-user-id': getUserId(),
              },
            }
          );
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to search users');
          }
          
          const users: User[] = await response.json();
          set({ searchResults: users, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search users',
            isLoading: false 
          });
        }
      },

      // ===== Real-time Updates =====
      
      addOnlineUser: (userId: string) => {
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, userId])
        }));
      },

      removeOnlineUser: (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      },

      setTyping: (conversationId: string, isTyping: boolean) => {
        set((state) => ({
          isTyping: {
            ...state.isTyping,
            [conversationId]: isTyping
          }
        }));
      },

      // ===== Message Actions =====
      
      addConversation: (conversation: Conversation) => {
        set((state) => ({
          conversations: [conversation, ...state.conversations]
        }));
      },

      updateConversation: (conversation: Conversation) => {
        set((state) => ({
          conversations: state.conversations.map(conv => 
            conv.id === conversation.id ? conversation : conv
          )
        }));
      },

      addMessage: (message: Message, conversationId: string) => {
        set((state) => {
          const existingMessages = state.messages[conversationId] || [];

          if (existingMessages.some(msg => msg.id === message.id)) {
            return state;
          }

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...existingMessages, message]
            },
            conversations: state.conversations.map(conv =>
              conv.id === conversationId
                ? { ...conv, lastMessage: message, updatedAt: new Date() }
                : conv
            )
          };
        });
      },

      // ===== State Management =====
      
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'messaging-store',
      partialize: (state) => ({
        conversations: state.conversations,
        unreadCount: state.unreadCount,
        messages: state.messages,
      }),
    }
  )
);

// Helper function to get user ID from auth store
function getUserId(): string {
  // Get user ID from auth store
  const authStore = useAuthStore.getState();
  return authStore.user?.id || '';
}

// Selectors for better performance
export const useConversations = () => 
  useMessagingStore((state) => state.conversations);

export const useActiveConversation = () => 
  useMessagingStore((state) => state.activeConversationId);

export const useMessages = (conversationId: string) => 
  useMessagingStore((state) => state.messages[conversationId] || []);

export const useUnreadCount = () => 
  useMessagingStore((state) => state.unreadCount);

export const useOnlineUsers = () => 
  useMessagingStore((state) => state.onlineUsers);

export const useIsTyping = (conversationId: string) => 
  useMessagingStore((state) => state.isTyping[conversationId] || false);