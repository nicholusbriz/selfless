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
  MessageSquare,
  Users,
  Settings,
  RefreshCw,
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

/* ─────────────────────────────────────────────────────────────────────────────
   Guards
   ───────────────────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────────────────────────── */

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
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const profileImageUrl = session?.user?.profileImageUrl ?? null;

  /* Close chat menu on outside click / escape */
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

  /* ── Chat theme query ── */
  const { data: chatTheme = 'classic' } = useQuery<ChatTheme>({
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

  /* ── Users query ── */
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(errorData, 'Failed to fetch users'));
      }
      const data: unknown = await response.json();
      if (
        !isJsonObject(data) ||
        !Array.isArray(data.users) ||
        !data.users.every(isMessagingUser)
      ) {
        throw new Error('Invalid users response');
      }
      return data.users;
    },
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  /* ── Conversations query ── */
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      const response = await fetch('/api/messages/conversations');
      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        throw new Error(
          getApiErrorMessage(errorData, 'Failed to fetch conversations'),
        );
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

  /* ── Create conversation ── */
  const createConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(result, 'Failed to create conversation'),
        );
      }
      if (!isJsonObject(result) || !isConversation(result.conversation)) {
        throw new Error('Invalid conversation response');
      }
      return { conversation: result.conversation };
    },
    onSuccess: (data) => {
      setSelectedConversation(data.conversation);
      setActiveTab('chats');
      queryClient.invalidateQueries({
        queryKey: ['conversations', currentUserId],
      });
    },
  });

  /* ── Search filtering ── */
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter((user: User) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const techCenter = user.techCenter?.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      return (
        fullName.includes(query) ||
        techCenter.includes(query) ||
        email.includes(query)
      );
    });
  }, [users, searchQuery]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((conv: Conversation) => {
      const fullName = conv.otherUser?.fullName?.toLowerCase() || '';
      return fullName.includes(query);
    });
  }, [conversations, searchQuery]);

  const handleClearSearch = () => setSearchQuery('');

  const handleUserClick = useCallback(
    (user: User) => {
      const participantId = user.id?.trim();
      if (!participantId || participantId === currentUserId) return;

      setSelectedUser({ ...user, id: participantId });

      const existing = conversations.find(
        (conv: Conversation) =>
          conv.participants.includes(currentUserId) &&
          conv.participants.includes(participantId) &&
          conv.participants.length === 2,
      );

      if (existing) {
        setSelectedConversation(existing);
      } else {
        createConversationMutation.mutate(participantId);
      }
    },
    [conversations, createConversationMutation, currentUserId],
  );

  useEffect(() => {
    if (
      !requestedUserId ||
      !currentUserId ||
      usersLoading ||
      conversationsLoading ||
      openedRequestedUserRef.current === `${currentUserId}:${requestedUserId}`
    )
      return;

    const requestedUser = users.find(
      (user: User) => user.id === requestedUserId,
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

  const prefetchConversationMessages = useCallback(
    (conversationId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
          const response = await fetch(`/api/messages/${conversationId}`);
          if (!response.ok) {
            const errorData: unknown = await response.json().catch(() => null);
            throw new Error(
              getApiErrorMessage(errorData, 'Failed to fetch messages'),
            );
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
    },
    [queryClient],
  );

  const handleConversationClick = useCallback(
    (conversation: Conversation) => {
      const otherUser = conversation.otherUser;
      if (otherUser) {
        setSelectedUser(otherUser);
        setSelectedConversation(conversation);
      } else {
        const otherUserId = conversation.participants.find(
          (id) => id !== currentUserId,
        );
        const fallbackUser = users.find((u: User) => u.id === otherUserId);
        if (fallbackUser) {
          setSelectedUser(fallbackUser);
          setSelectedConversation(conversation);
        }
      }
    },
    [users, currentUserId],
  );

  useEffect(() => {
    if (conversations.length > 0 && currentUserId) {
      const conversationsToPrefetch = conversations.filter(
        (conv: Conversation) => {
          const hasUnread = (conv.unreadCount ?? 0) > 0;
          const hasRecentActivity = conv.lastMessage
            ? new Date(conv.lastMessage.createdAt).getTime() >
              Date.now() - 24 * 60 * 60 * 1000
            : false;
          return hasUnread || hasRecentActivity;
        },
      );

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

  /* ── Gate: no auth ── */
  if (!currentUserId) {
    return (
      <div className="flex min-h-[calc(100dvh-96px)] items-center justify-center bg-[#f8fafc] px-4">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2f8] text-[#1a365d]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-[#0f172a]">
            Please sign in to view messages
          </p>
        </div>
      </div>
    );
  }

  /* ── Gate: load error ── */
  if (usersError || conversationsError) {
    const errorMessage =
      usersError instanceof Error
        ? usersError.message
        : conversationsError instanceof Error
          ? conversationsError.message
          : 'Failed to load data';

    return (
      <div className="flex min-h-[calc(100dvh-96px)] items-center justify-center bg-[#f8fafc] px-4">
        <div className="max-w-sm rounded-xl border border-red-100 bg-white p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-[#0f172a]">
            Unable to load messages
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#64748b]">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white transition hover:bg-[#14294a]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedUserIsOnline = selectedUser
    ? onlineUsers.some((u) => u.userId === selectedUser.id)
    : false;
  const selectedUserName = selectedUser ? getDisplayName(selectedUser) : '';
  const isConversationOpen = Boolean(selectedUser);
  const onlineUserIds = new Set(onlineUsers.map((u) => u.userId));

  return (
    <div className="flex h-[calc(100dvh-96px)] min-h-[520px] w-full bg-[#f8fafc]">
      <div className="mx-auto flex h-full w-full max-w-[1400px] gap-0 overflow-hidden rounded-none border-0 bg-white sm:m-3 sm:h-[calc(100dvh-120px)] sm:rounded-2xl sm:border sm:border-[#e2e8f0]">
        {/* ── Sidebar ── */}
        <aside
          className={`${
            isConversationOpen ? 'hidden' : 'flex'
          } h-full min-h-0 w-full flex-col border-r-0 bg-white lg:flex lg:w-[340px] lg:shrink-0 lg:border-r lg:border-[#e2e8f0] xl:w-[380px]`}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#e2e8f0] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a365d] text-white">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <h1 className="text-sm font-bold text-[#0f172a]">Messages</h1>
            </div>
            <button
              type="button"
              onClick={handleStartNewChat}
              aria-label="Start new chat"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#1a365d]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 border-b border-[#e2e8f0] bg-white px-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('chats');
                setSearchQuery('');
              }}
              aria-current={activeTab === 'chats' ? 'page' : undefined}
              className={`relative flex-1 px-3 py-2.5 text-xs font-semibold transition ${
                activeTab === 'chats'
                  ? 'text-[#1a365d]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Chats
                {conversations.length > 0 && (
                  <span className="rounded-full bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#64748b]">
                    {conversations.length}
                  </span>
                )}
              </span>
              {activeTab === 'chats' && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#b98a3e]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('users');
                setSearchQuery('');
              }}
              aria-current={activeTab === 'users' ? 'page' : undefined}
              className={`relative flex-1 px-3 py-2.5 text-xs font-semibold transition ${
                activeTab === 'users'
                  ? 'text-[#1a365d]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                People
              </span>
              {activeTab === 'users' && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#b98a3e]" />
              )}
            </button>
          </div>

          {/* Search */}
          <div className="shrink-0 border-b border-[#e2e8f0] bg-white px-3 py-2.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]"
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'chats'
                    ? 'Search conversations…'
                    : 'Search people…'
                }
                aria-label={
                  activeTab === 'chats'
                    ? 'Search conversations'
                    : 'Search people'
                }
                className="h-9 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-9 pr-9 text-xs text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition focus:border-[#1a365d] focus:bg-white focus:ring-2 focus:ring-[#1a365d]/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* Create conversation error */}
          {createConversationMutation.error && (
            <div
              role="alert"
              aria-live="polite"
              className="mx-3 mt-2 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700"
            >
              {createConversationMutation.error.message}
            </div>
          )}

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeTab === 'chats' ? (
              <ChatsList
                conversations={filteredConversations}
                isLoading={conversationsLoading}
                currentUserId={currentUserId}
                onlineUserIds={onlineUserIds}
                onConversationClick={handleConversationClick}
                onStartNewChat={handleStartNewChat}
                supportContact={
                  supportContact?.id !== currentUserId
                    ? supportContact
                    : undefined
                }
                onSupportClick={() => {
                  if (
                    supportContact?.id &&
                    supportContact.id !== currentUserId
                  ) {
                    handleUserClick(supportContact);
                  }
                }}
              />
            ) : (
              <AllUsersList
                users={filteredUsers}
                isLoading={usersLoading}
                onlineUserIds={onlineUserIds}
                onUserClick={handleUserClick}
                searchQuery={searchQuery}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-[#e2e8f0] bg-white px-3 py-2">
            <span className="text-[10px] font-medium text-[#94a3b8]">
              {activeTab === 'chats'
                ? `${filteredConversations.length} ${
                    filteredConversations.length === 1
                      ? 'conversation'
                      : 'conversations'
                  }`
                : `${filteredUsers.length} ${
                    filteredUsers.length === 1 ? 'person' : 'people'
                  }`}
            </span>
            {activeTab === 'chats' &&
              filteredConversations.length === 0 &&
              !searchQuery && (
                <button
                  onClick={handleStartNewChat}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1a365d] transition hover:text-[#b98a3e]"
                >
                  <Plus className="h-3 w-3" />
                  New chat
                </button>
              )}
            {activeTab === 'users' && searchQuery && (
              <span className="text-[10px] font-medium text-[#94a3b8]">
                {filteredUsers.length} of {users.length}
              </span>
            )}
          </div>
        </aside>

        {/* ── Chat pane ── */}
        <section
          className={`${
            isConversationOpen ? 'flex' : 'hidden'
          } min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc] lg:flex`}
        >
          {selectedUser && (
            <>
              {/* Chat header */}
              <div className="relative flex shrink-0 items-center border-b border-[#e2e8f0] bg-white px-3 py-2.5 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30 lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="relative shrink-0">
                    {selectedUser.image ? (
                      <Image
                        src={selectedUser.image}
                        alt={selectedUserName}
                        width={36}
                        height={36}
                        unoptimized
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-[#f1f5f9]"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a365d] text-xs font-bold text-white">
                        {initialsOf(selectedUserName)}
                      </div>
                    )}
                    {selectedUserIsOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>

                  <div className="flex min-w-0 items-center gap-1">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-[#0f172a]">
                        {selectedUserName}
                      </h2>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span
                          className={`font-medium ${
                            selectedUserIsOnline
                              ? 'text-emerald-600'
                              : 'text-[#94a3b8]'
                          }`}
                        >
                          {selectedUserIsOnline ? 'Online' : 'Offline'}
                        </span>
                        {selectedUser.techCenter?.name && (
                          <>
                            <span className="text-[#cbd5e1]">·</span>
                            <span className="truncate text-[#64748b]">
                              {selectedUser.techCenter.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div ref={chatMenuRef} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsChatMenuOpen((o) => !o)}
                        aria-label="Chat options"
                        aria-haspopup="menu"
                        aria-expanded={isChatMenuOpen}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {isChatMenuOpen && (
                        <div
                          role="menu"
                          aria-label="Chat options"
                          className="absolute right-0 top-7 z-20 w-60 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-xl"
                        >
                      <Link
                        href={`/dashboard/students/${selectedUser.id}`}
                        role="menuitem"
                        onClick={() => setIsChatMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-[#0f172a] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
                      >
                        <Users className="h-3.5 w-3.5 text-[#64748b]" />
                        View profile
                      </Link>

                      <div className="my-1 border-t border-[#f1f5f9]" />

                      <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Chat theme
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
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-[#0f172a] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30 disabled:cursor-wait disabled:opacity-60"
                        >
                          <span
                            aria-hidden="true"
                            className="relative flex h-6 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-black/10"
                            style={{ backgroundColor: theme.canvasColor }}
                          >
                            {theme.id === 'profile-image' && profileImageUrl && (
                              <Image
                                src={profileImageUrl}
                                alt=""
                                fill
                                sizes="32px"
                                unoptimized
                                className="object-cover"
                              />
                            )}
                            {theme.id !== 'profile-image' && (
                              <>
                                <span className="absolute left-1 top-1 h-1 w-2.5 rounded-full bg-white" />
                                <span
                                  className="absolute bottom-1 right-1 h-1 w-3 rounded-full"
                                  style={{ backgroundColor: theme.preview }}
                                />
                              </>
                            )}
                            {chatTheme === theme.id && (
                              <Check className="relative z-10 h-2.5 w-2.5 text-white drop-shadow" />
                            )}
                          </span>
                          <span className="flex-1 truncate">
                            {theme.label}
                          </span>
                          {chatTheme === theme.id && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#b98a3e]">
                              On
                            </span>
                          )}
                        </button>
                      ))}

                      {updateChatThemeMutation.error && (
                        <p
                          role="alert"
                          className="px-2.5 py-1.5 text-[10px] text-red-600"
                        >
                          {updateChatThemeMutation.error.message}
                        </p>
                      )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat body */}
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
                        <div className="absolute inset-0 bg-white/25" />
                      </>
                    )}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1a365d] shadow-sm">
                        <Settings className="h-4 w-4" />
                      </div>
                      <p className="mt-2 text-xs font-medium text-[#64748b]">
                        Conversation is ready. Send a message to begin.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Empty state (desktop) */}
          {!selectedUser && (
            <div className="hidden h-full flex-col items-center justify-center px-8 text-center lg:flex">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a365d] shadow-sm">
                <MessageSquare className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <h2 className="mt-4 text-sm font-bold text-[#0f172a]">
                Select a conversation
              </h2>
              <p className="mt-1 max-w-xs text-xs leading-5 text-[#64748b]">
                Choose a chat from the list or start a new conversation with
                someone.
              </p>
              <button
                type="button"
                onClick={handleStartNewChat}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white transition hover:bg-[#14294a]"
              >
                <Plus className="h-3.5 w-3.5" />
                Start new chat
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}