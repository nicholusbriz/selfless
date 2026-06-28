// Messaging Types

export type UserStatusType = 'ONLINE' | 'OFFLINE' | 'AWAY';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  status?: UserStatusType;
  lastSeen?: Date | null;
  fullName?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  readAt: Date | null;
  sender: User;
  receiver?: User;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageId: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: Date;
  createdAt: Date;
  participants?: User[];
}

export interface UserStatus {
  id: string;
  userId: string;
  status: UserStatusType;
  lastSeen: Date;
  updatedAt: Date;
}

export interface MessagingState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  onlineUsers: Set<string>;
  unreadCount: number;
  searchQuery: string;
  searchResults: User[];
  isTyping: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface MessagingActions {
  // Conversations
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  createConversation: (participantId: string) => Promise<Conversation>;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  
  // Messages
  fetchMessages: (conversationId: string, page?: number, limit?: number) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<Message>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: (conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>;
  addMessage: (message: Message, conversationId: string) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  searchUsers: (query: string) => Promise<void>;
  
  // Real-time
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  
  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type MessagingStore = MessagingState & MessagingActions;

// ===== Socket Events =====

export interface ServerToClientEvents {
  'new-message': (data: { message: Message; conversationId: string }) => void;
  'user-online': (data: { userId: string; status: UserStatusType }) => void;
  'user-offline': (data: { userId: string; status: UserStatusType; lastSeen: Date }) => void;
  'user-typing': (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  'message-read': (data: { messageId: string; conversationId: string; readAt: Date }) => void;
  'all-read': (data: { conversationId: string; userId: string }) => void;
  'message-deleted': (data: { messageId: string; conversationId: string }) => void;
  'message-error': (data: { error: string }) => void;
  'announcement:created': (data: unknown) => void;
  'cleaning:attendance:updated': (data: unknown) => void;
  'assignment:updated': (data: unknown) => void;
}

export interface ClientToServerEvents {
  'join-conversation': (conversationId: string) => void;
  'leave-conversation': (conversationId: string) => void;
  'send-message': (data: { conversationId: string; content: string; receiverId: string }) => void;
  'typing-start': (data: { conversationId: string }) => void;
  'typing-stop': (data: { conversationId: string }) => void;
  'mark-read': (data: { messageId: string; conversationId: string }) => void;
  'mark-all-read': (data: { conversationId: string }) => void;
  'delete-message': (data: { messageId: string; conversationId: string }) => void;
}

// ===== API Response Types =====

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== Component Props Types =====

export interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
}

export interface ChatInputProps {
  conversationId: string;
  onSendMessage: (content: string) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
  onCall?: () => void;
  onVideo?: () => void;
}

export interface UserSearchProps {
  onSelectUser: (user: User) => void;
  excludeUserId?: string;
  placeholder?: string;
}

export interface TypingIndicatorProps {
  users: string[]; // Array of user IDs who are typing
  currentUserId: string;
}

// ===== Hook Return Types =====

export interface UseMessagingReturn {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  onlineUsers: Set<string>;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setActiveConversation: (conversationId: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  fetchMoreMessages: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  isTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
}

export interface UseSocketReturn {
  isConnected: boolean;
  socketId: string | null;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: { conversationId: string; content: string; receiverId: string }) => void;
  markAsRead: (messageId: string, conversationId: string) => void;
  markAllAsRead: (conversationId: string) => void;
  deleteMessage: (messageId: string, conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

// ===== Utility Types =====

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageWithStatus extends Message {
  status?: MessageStatus;
  tempId?: string;
}

export type ConversationSortOptions = 'newest' | 'oldest' | 'unread';

export interface MessagingFilter {
  searchQuery?: string;
  status?: UserStatusType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ===== Event Types =====

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface ReadReceiptEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  readAt: Date;
}

// ===== Store Persistence Types =====

export interface MessagingStorePersist {
  conversations: Conversation[];
  unreadCount: number;
  messages: Record<string, Message[]>;
}

// ===== Error Types =====

export interface MessagingError {
  code: string;
  message: string;
  status?: number;
  data?: unknown;
}

export type MessagingErrorCode = 
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED';
