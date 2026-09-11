// ============================================================
// MESSAGING TYPES
// ============================================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  image?: string | null;
  techCenter?: {
    id: string;
    name: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  otherUser?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    image?: string | null;
    techCenter?: {
      id: string;
      name: string;
    };
  } | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
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

export type TabType = 'chats' | 'users';

export interface ConversationCacheItem {
  id: string;
  unreadCount?: number;
  [key: string]: unknown;
}

export interface CreateConversationResponse {
  conversation: Conversation;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface SendMessageRequest {
  content: string;
  attachments?: string[];
}

export interface CreateConversationRequest {
  participantId: string;
}
