'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  X,
  AlertCircle,
  ArrowLeft,
  Plus,
  MoreVertical,
  Check,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Chat } from './components/Chat';
import { ChatsList } from './components/ChatsList';
import { AllUsersList } from './components/AllUsersList';
import Link from 'next/link';
import Image from 'next/image';
import type { User, Conversation, Message, TabType } from '@/types/messaging';
import { useOnlineUsers } from '@/lib/hooks/useOnlineUsers';
import { getDisplayName } from '@/lib/messaging/displayName';
import {
  CHAT_THEMES,
  getChatTheme,
  isChatTheme,
  type ChatTheme,
} from '@/lib/messaging/chatThemes';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';

function isMessagingUser(value: unknown): value is User {
  if (
    !isJsonObject(value) ||
    typeof value.id !== 'string' ||
    typeof value.firstName !== 'string' ||
    typeof value.lastName !== 'string'
  ) {
    return false;
  }

  return (
    (value.fullName === undefined || typeof value.fullName === 'string') &&
    (value.email === undefined || typeof value.email === 'string') &&
    (value.image === undefined ||
      value.image === null ||
      typeof value.image === 'string') &&
    (value.roleName === undefined || typeof value.roleName === 'string') &&
    (value.roleDisplayName === undefined ||
      typeof value.roleDisplayName === 'string') &&
    (value.techCenter === undefined ||
      value.techCenter === null ||
      (isJsonObject(value.techCenter) &&
        typeof value.techCenter.id === 'string' &&
        typeof value.techCenter.name === 'string'))
  );
}

function isConversation(value: unknown): value is Conversation {
  if (
    !isJsonObject(value) ||
    typeof value.id !== 'string' ||
    !Array.isArray(value.participants) ||
    !value.participants.every(
      (participant: unknown) => typeof participant === 'string',
    ) ||
    (value.lastMessage !== null &&
      (!isJsonObject(value.lastMessage) ||
        typeof value.lastMessage.content !== 'string' ||
        typeof value.lastMessage.senderId !== 'string' ||
        typeof value.lastMessage.createdAt !== 'string')) ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    return false;
  }

  return (
    (value.unreadCount === undefined ||
      typeof value.unreadCount === 'number') &&
    (value.otherUser === undefined ||
      value.otherUser === null ||
      (isJsonObject(value.otherUser) &&
        typeof value.otherUser.id === 'string' &&
        typeof value.otherUser.firstName === 'string' &&
        typeof value.otherUser.lastName === 'string' &&
        typeof value.otherUser.fullName === 'string' &&
        (value.otherUser.image === undefined ||
          value.otherUser.image === null ||
          typeof value.otherUser.image === 'string') &&
        (value.otherUser.techCenter === undefined ||
          value.otherUser.techCenter === null ||
          (isJsonObject(value.otherUser.techCenter) &&
            typeof value.otherUser.techCenter.id === 'string' &&
            typeof value.otherUser.techCenter.name === 'string'))))
  );
}

function isMessage(value: unknown): value is Message {
  return (
    isJsonObject(value) &&
    typeof value.id === 'string' &&
    typeof value.conversationId === 'string' &&
    typeof value.senderId === 'string' &&
    typeof value.content === 'string' &&
    typeof value.isRead === 'boolean' &&
    (value.readAt === null || typeof value.readAt === 'string') &&
    Array.isArray(value.attachments) &&
    value.attachments.every(
      (attachment: unknown) => typeof attachment === 'string',
    ) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const currentUserId = session?.user?.id || '';
  const { users: onlineUsers } = useOnlineUsers(session?.user);
  const requestedUserId = searchParams.get('userId');
  const openedRequestedUserRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const profileImageUrl = session?.user?.profileImageUrl ?? null;

  useEffect(() => {
    if (!isChatMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !chatMenuRef.current?.contains(event.target)
      ) {
        setIsChatMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsChatMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatMenuOpen]);

  const {
    data: chatTheme = 'classic',
  } = useQuery<ChatTheme>({
    queryKey: ['user', currentUserId, 'chatTheme'],
    queryFn: async () => {
      const response = await fetch('/api/user/chat-theme');
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to load chat theme'));
      }
      if (!isJsonObject(data) || !isChatTheme(data.theme)) {
        throw new Error('Invalid chat theme response');
      }
      return data.theme;
    },
    enabled: Boolean(currentUserId),
    staleTime: Infinity,
  });

  const updateChatThemeMutation = useMutation({
    mutationFn: async (theme: ChatTheme) => {
      const response = await fetch('/api/user/chat-theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to save chat theme'));
      }
      if (!isJsonObject(data) || !isChatTheme(data.theme)) {
        throw new Error('Invalid chat theme response');
      }
      return data.theme;
    },
    onMutate: async (theme) => {
      await queryClient.cancelQueries({
        queryKey: ['user', currentUserId, 'chatTheme'],
      });
      const previousTheme = queryClient.getQueryData<ChatTheme>([
        'user',
        currentUserId,
        'chatTheme',
      ]);
      queryClient.setQueryData(['user', currentUserId, 'chatTheme'], theme);
      return { previousTheme };
    },
    onError: (_error, _theme, context) => {
      if (context?.previousTheme) {
        queryClient.setQueryData(
          ['user', currentUserId, 'chatTheme'],
          context.previousTheme,
        );
      }
    },
    onSuccess: (theme) => {
      queryClient.setQueryData(['user', currentUserId, 'chatTheme'], theme);
    },
  });

  // Fetch users
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(errorData, 'Failed to fetch users'));
      }
      const data: unknown = await response.json();
      if (!isJsonObject(data) || !Array.isArray(data.users) || !data.users.every(isMessagingUser)) {
        throw new Error('Invalid users response');
      }
      return data.users;
    },
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch conversations
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading,
    error: conversationsError
  } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      const response = await fetch('/api/messages/conversations');
      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(errorData, 'Failed to fetch conversations'));
      }
      const data: unknown = await response.json();
      if (
        !isJsonObject(data) ||
        !Array.isArray(data.conversations) ||
        !data.conversations.every(isConversation)
      ) {
        throw new Error('Invalid conversations response');
      }
      return data.conversations;
    },
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity,
    retry: 1,
  });

  const supportContact = users.find((user) => user.roleName === 'dev');


  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(result, 'Failed to create conversation'));
      }
      if (!isJsonObject(result) || !isConversation(result.conversation)) {
        throw new Error('Invalid conversation response');
      }
      return { conversation: result.conversation };
    },
    onSuccess: (data) => {
      setSelectedConversation(data.conversation);
      setActiveTab('chats');
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
    },
  });

  // Client-side search - filters cached data
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter((user: User) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const techCenter = user.techCenter?.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      
      return fullName.includes(query) || 
             techCenter.includes(query) || 
             email.includes(query);
    });
  }, [users, searchQuery]);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((conv: Conversation) => {
      const fullName = conv.otherUser?.fullName?.toLowerCase() || '';
      return fullName.includes(query);
    });
  }, [conversations, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleUserClick = useCallback((user: User) => {
    const participantId = user.id?.trim();
    if (!participantId || participantId === currentUserId) return;

    // Open chat immediately - instant UI update
    setSelectedUser({ ...user, id: participantId });
    
    // Check if conversation already exists with this specific user
    // For one-to-one conversations, we need both participants to match
    const existing = conversations.find(
      (conv: Conversation) => 
        conv.participants.includes(currentUserId) && 
        conv.participants.includes(participantId) &&
        conv.participants.length === 2 // Ensure it's a one-to-one conversation
    );
    
    if (existing) {
      setSelectedConversation(existing);
    } else {
      // Create new conversation
      createConversationMutation.mutate(participantId);
    }
  }, [conversations, createConversationMutation, currentUserId]);

  useEffect(() => {
    if (
      !requestedUserId ||
      !currentUserId ||
      usersLoading ||
      conversationsLoading ||
      openedRequestedUserRef.current === `${currentUserId}:${requestedUserId}`
    ) return;

    const requestedUser = users.find(
      (user: User) => user.id === requestedUserId
    );

    if (requestedUser) {
      openedRequestedUserRef.current = `${currentUserId}:${requestedUserId}`;
      void Promise.resolve().then(() => handleUserClick(requestedUser));
    }
  }, [
    requestedUserId,
    currentUserId,
    users,
    usersLoading,
    conversationsLoading,
    handleUserClick,
  ]);

  const prefetchConversationMessages = useCallback((conversationId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['messages', conversationId],
      queryFn: async () => {
        const response = await fetch(`/api/messages/${conversationId}`);
        if (!response.ok) {
          const errorData: unknown = await response.json().catch(() => null);
          throw new Error(getApiErrorMessage(errorData, 'Failed to fetch messages'));
        }
        const data: unknown = await response.json();
        if (
          !isJsonObject(data) ||
          !Array.isArray(data.messages) ||
          !data.messages.every(isMessage)
        ) {
          throw new Error('Invalid messages response');
        }
        return data.messages;
      },
      staleTime: Infinity,
    });
  }, [queryClient]);

  const handleConversationClick = useCallback((conversation: Conversation) => {
    // Use the otherUser data from the conversation directly
    // The API already populates this with the correct user info
    const otherUser = conversation.otherUser;
    
    if (otherUser) {
      // Open chat immediately - instant UI update
      setSelectedUser(otherUser);
      setSelectedConversation(conversation);
    } else {
      // Fallback: try to find in users array if otherUser is not available
      const otherUserId = conversation.participants.find(id => id !== currentUserId);
      const fallbackUser = users.find((u: User) => u.id === otherUserId);
      
      if (fallbackUser) {
        setSelectedUser(fallbackUser);
        setSelectedConversation(conversation);
      }
    }
  }, [users, currentUserId]);

  // Prefetch messages for conversations with unread messages or recent activity
  useEffect(() => {
    if (conversations.length > 0 && currentUserId) {
      // Only prefetch conversations that have unread messages or recent activity
      const conversationsToPrefetch = conversations.filter((conv: Conversation) => {
        const hasUnread = (conv.unreadCount ?? 0) > 0;
        const hasRecentActivity = conv.lastMessage ? 
          new Date(conv.lastMessage.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 : false; // Last 24 hours
        return hasUnread || hasRecentActivity;
      });

      conversationsToPrefetch.forEach((conversation: Conversation) => {
        prefetchConversationMessages(conversation.id);
      });
    }
  }, [conversations, currentUserId, prefetchConversationMessages]);

  const handleBackToList = () => {
    setSelectedUser(null);
    setSelectedConversation(null);
  };

  const handleStartNewChat = () => {
    setActiveTab('users');
    setSearchQuery('');
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto w-8 h-8 text-[#3182CE]" />
          <p className="mt-2 text-[13px] text-[#4A5568]">Please sign in to view messages</p>
        </div>
      </div>
    );
  }

  if (usersError || conversationsError) {
    const errorMessage = usersError instanceof Error ? usersError.message : 
                        conversationsError instanceof Error ? conversationsError.message : 
                        'Failed to load data';
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto w-8 h-8 text-[#E53E3E]" />
          <p className="mt-2 text-[13px] text-[#4A5568]">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-[#1A365D] text-white text-sm rounded-lg hover:bg-[#153475] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedUserIsOnline = selectedUser
    ? onlineUsers.some((onlineUser) => onlineUser.userId === selectedUser.id)
    : false;
  const selectedUserName = selectedUser ? getDisplayName(selectedUser) : '';
  const isConversationOpen = Boolean(selectedUser);

  return (
    <div className="mx-auto h-[calc(100dvh-96px)] min-h-[420px] max-w-7xl overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_12px_35px_rgba(26,43,76,0.08)]">
      <div className="flex h-full min-h-0">
        <aside
          className={`${
            isConversationOpen ? 'hidden' : 'flex'
          } h-full min-h-0 w-full flex-col bg-white lg:flex lg:w-[340px] lg:shrink-0 lg:border-r lg:border-[#E8ECF2] xl:w-[370px]`}
        >
        {/* Tabs */}
        <div className="flex shrink-0 gap-6 border-b border-[#E8ECF2] bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chats');
              setSearchQuery('');
            }}
            className={`relative py-3 text-sm font-semibold transition-colors ${
              activeTab === 'chats'
                ? 'text-[#1A2B4C]'
                : 'text-[#8791A1] hover:text-[#1A2B4C]'
            }`}
          >
            Chats
            {activeTab === 'chats' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#B98A3E]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              setSearchQuery('');
            }}
            className={`relative py-3 text-sm font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-[#1A2B4C]'
                : 'text-[#8791A1] hover:text-[#1A2B4C]'
            }`}
          >
            All Users
            {activeTab === 'users' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#B98A3E]" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="shrink-0 border-b border-[#E8ECF2] bg-white px-4 py-3 sm:px-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8791A1]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Search users...'}
              aria-label={activeTab === 'chats' ? 'Search conversations' : 'Search users'}
              className="h-11 w-full rounded-xl border border-[#E2E7EE] bg-[#F8F9FB] pl-10 pr-10 text-sm text-[#1A2B4C] placeholder:text-[#9AA3B1] outline-none transition focus:border-[#B98A3E] focus:bg-white focus:ring-2 focus:ring-[#B98A3E]/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#8791A1] hover:bg-[#EEF1F5] hover:text-[#1A2B4C]"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {createConversationMutation.error && (
          <div
            role="alert"
            className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {createConversationMutation.error.message}
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          {activeTab === 'chats' ? (
            <ChatsList
              conversations={filteredConversations}
              isLoading={conversationsLoading}
              currentUserId={currentUserId}
              onlineUserIds={new Set(onlineUsers.map((onlineUser) => onlineUser.userId))}
              onConversationClick={handleConversationClick}
              onStartNewChat={handleStartNewChat}
              supportContact={supportContact?.id !== currentUserId ? supportContact : undefined}
              onSupportClick={() => {
                if (supportContact?.id && supportContact.id !== currentUserId) {
                  handleUserClick(supportContact);
                }
              }}
            />
          ) : (
            <AllUsersList
              users={filteredUsers}
              isLoading={usersLoading}
              onlineUserIds={new Set(onlineUsers.map((onlineUser) => onlineUser.userId))}
              onUserClick={handleUserClick}
              searchQuery={searchQuery}
            />
          )}
        </div>

        {/* Footer */}
        {(filteredConversations.length > 0 || filteredUsers.length > 0) && (
          <div className="flex shrink-0 items-center justify-between border-t border-[#E8ECF2] bg-white px-4 py-2.5 sm:px-6">
            <span className="text-xs text-[#8791A1]">
              {activeTab === 'chats' 
                ? `${filteredConversations.length} conversations`
                : `${filteredUsers.length} contacts`
              }
            </span>
            {activeTab === 'chats' && filteredConversations.length === 0 && !searchQuery && (
              <button
                onClick={handleStartNewChat}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A2B4C] transition-colors hover:text-[#9A7436]"
              >
                <Plus className="w-3 h-3" />
                Start New Chat
              </button>
            )}
            {activeTab === 'users' && searchQuery && (
              <span className="text-xs text-[#8791A1]">
                {filteredUsers.length} of {users.length} users
              </span>
            )}
          </div>
        )}
        </aside>

        <section
          className={`${
            isConversationOpen ? 'flex' : 'hidden'
          } min-h-0 min-w-0 flex-1 flex-col bg-[#F7F8FA] lg:flex`}
        >
          {selectedUser && (
            <>
              <div className="relative flex shrink-0 items-center justify-between border-b border-[#E8ECF2] bg-white px-3 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#52617A] transition-colors hover:bg-[#F3F5F8] hover:text-[#1A2B4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  {selectedUser.image ? (
                    <Image
                      src={selectedUser.image}
                      alt={selectedUserName}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#F0F2F5]"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A2B4C] text-sm font-bold text-white">
                      {selectedUserName
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part.charAt(0))
                        .join('')
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-[#1A2B4C] sm:text-base">
                      {selectedUserName}
                    </h2>
                    <div className="mt-0.5 flex items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1.5 ${selectedUserIsOnline ? 'text-[#3F8F5B]' : 'text-[#8791A1]'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedUserIsOnline ? 'bg-[#3F8F5B]' : 'bg-[#AAB2BF]'}`} />
                        {selectedUserIsOnline ? 'Online' : 'Offline'}
                      </span>
                      {selectedUser.techCenter?.name && (
                        <>
                          <span className="text-[#C4CAD3]">·</span>
                          <span className="truncate text-[#788397]">{selectedUser.techCenter.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div ref={chatMenuRef} className="relative ml-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsChatMenuOpen((isOpen) => !isOpen)}
                    aria-label="Chat options"
                    aria-haspopup="menu"
                    aria-expanded={isChatMenuOpen}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#52617A] transition-colors hover:bg-[#F3F5F8] hover:text-[#1A2B4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {isChatMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Chat options"
                      className="absolute right-0 top-11 z-20 w-64 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-xl"
                    >
                      <Link
                        href={`/dashboard/students/${selectedUser.id}`}
                        role="menuitem"
                        onClick={() => setIsChatMenuOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#26354D] transition-colors hover:bg-[#F5F6F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]"
                      >
                        View profile
                      </Link>
                      <div className="my-1 border-t border-[#EEF1F5]" />
                      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8791A1]">
                        Chat background
                      </p>
                      {CHAT_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={chatTheme === theme.id}
                          onClick={() => {
                            setIsChatMenuOpen(false);
                            updateChatThemeMutation.mutate(theme.id);
                          }}
                          disabled={
                            updateChatThemeMutation.isPending ||
                            (theme.id === 'profile-image' && !profileImageUrl)
                          }
                          title={
                            theme.id === 'profile-image' && !profileImageUrl
                              ? 'Add a profile image to use this background'
                              : undefined
                          }
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#26354D] transition-colors hover:bg-[#F5F6F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] disabled:cursor-wait disabled:opacity-60"
                        >
                          <span
                            aria-hidden="true"
                            className="relative flex h-7 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/10"
                            style={{ backgroundColor: theme.canvasColor }}
                          >
                            {theme.id === 'profile-image' && profileImageUrl && (
                              <Image
                                src={profileImageUrl}
                                alt=""
                                fill
                                sizes="36px"
                                unoptimized
                                className="object-cover"
                              />
                            )}
                            {theme.id !== 'profile-image' && (
                              <>
                                <span className="absolute left-1 top-1 h-1.5 w-3 rounded-full bg-white" />
                                <span
                                  className="absolute bottom-1 right-1 h-1.5 w-4 rounded-full"
                                  style={{ backgroundColor: theme.preview }}
                                />
                              </>
                            )}
                            {chatTheme === theme.id && (
                              <Check className="relative z-10 h-3 w-3 text-white drop-shadow" />
                            )}
                          </span>
                          <span className="flex-1">
                            {theme.label}
                            {theme.id === 'profile-image' && !profileImageUrl && (
                              <span className="mt-0.5 block text-[10px] text-[#8791A1]">
                                Add a profile image first
                              </span>
                            )}
                          </span>
                          {chatTheme === theme.id && (
                            <span className="text-[10px] font-medium text-[#8791A1]">Selected</span>
                          )}
                        </button>
                      ))}
                      {updateChatThemeMutation.error && (
                        <p role="alert" className="px-3 py-2 text-xs text-[#A4462F]">
                          {updateChatThemeMutation.error.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                {selectedConversation ? (
                  <Chat
                    conversationId={selectedConversation.id}
                    currentUserId={currentUserId}
                    theme={chatTheme}
                    profileImageUrl={profileImageUrl}
                  />
                ) : (
                  <div
                    className="relative flex h-full items-center justify-center overflow-hidden px-6 text-center"
                    style={{
                      backgroundColor: getChatTheme(chatTheme).canvasColor,
                    }}
                  >
                    {chatTheme === 'profile-image' && profileImageUrl && (
                      <>
                        <Image
                          src={profileImageUrl}
                          alt=""
                          fill
                          sizes="100vw"
                          unoptimized
                          className="object-cover"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-white/25"
                        />
                      </>
                    )}
                    <p className="relative z-10 text-sm font-medium text-[#788397]">
                      Conversation is ready. Send a message to begin.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          {!selectedUser && (
            <div className="hidden h-full flex-col items-center justify-center px-8 text-center lg:flex">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#1A2B4C] shadow-sm">
                <Search className="h-7 w-7" strokeWidth={1.6} />
              </div>
              <h2 className="mt-5 text-base font-semibold text-[#26354D]">
                Select a conversation
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#8791A1]">
                Choose a chat from the list or start a conversation with someone.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}