'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  X,
  AlertCircle,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Chat } from './components/Chat';
import { ChatsList } from './components/ChatsList';
import { AllUsersList } from './components/AllUsersList';
import Link from 'next/link';
import Image from 'next/image';
import type { User, Conversation, TabType } from '@/types/messaging';
import { useOnlineUsers } from '@/lib/hooks/useOnlineUsers';

// ============================================================
// MAIN PAGE
// ============================================================

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const currentUserId = session?.user?.id || '';
  const onlineUsers = useOnlineUsers(session?.user);
  const requestedUserId = searchParams.get('userId');
  const openedRequestedUserRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Fetch users
  const { 
    data: users = [], 
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      return data.users || [];
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }
      const data = await response.json();
      return data.conversations || [];
    },
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity,
    retry: 1,
  });



  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
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
    // Open chat immediately - instant UI update
    setSelectedUser(user);
    
    // Check if conversation already exists with this specific user
    // For one-to-one conversations, we need both participants to match
    const existing = conversations.find(
      (conv: Conversation) => 
        conv.participants.includes(currentUserId) && 
        conv.participants.includes(user.id) &&
        conv.participants.length === 2 // Ensure it's a one-to-one conversation
    );
    
    if (existing) {
      setSelectedConversation(existing);
    } else {
      // Create new conversation
      createConversationMutation.mutate(user.id);
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch messages');
        }
        const data = await response.json();
        return data.messages || [];
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

  // Get conversation for selected user
  const getConversationForUser = (userId: string) => {
    return conversations.find(
      (conv: Conversation) => 
        conv.participants.includes(currentUserId) && 
        conv.participants.includes(userId) &&
        conv.participants.length === 2 // Ensure it's a one-to-one conversation
    );
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

  // Show Chat component when a user is selected
  if (selectedUser && selectedConversation) {
    const selectedUserIsOnline = onlineUsers.some(
      (onlineUser) => onlineUser.userId === selectedUser.id
    );

    return (
      <div className="h-screen bg-[#F7F9FC] overflow-hidden">
        <div className="max-w-4xl mx-auto bg-white h-screen flex flex-col">
          {/* Chat Header */}
          <div className="bg-[#1A365D] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="text-white hover:text-[#3182CE] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {selectedUser.image ? (
                <Image
                  src={selectedUser.image}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : null}
              <div>
                <h2 className="text-white font-semibold">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className={selectedUserIsOnline ? 'text-[#9AE6B4]' : 'text-white/60'}>
                    {selectedUserIsOnline ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-white/70">
                    {selectedUser.techCenter?.name || 'No location'}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={`/dashboard/students/${selectedUser.id}`}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              View Profile
            </Link>
          </div>

          {/* Chat Component */}
          <div className="flex-1 overflow-hidden">
            <Chat 
              conversationId={selectedConversation.id}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show main view with tabs
  return (
    <div className="h-screen bg-[#F7F9FC] overflow-hidden">
      <div className="max-w-4xl mx-auto bg-white h-screen flex flex-col">
        {/* Header */}
        <div className="bg-[#1A365D] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <h1 className="text-white text-lg font-semibold">Messages</h1>
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm">
              {activeTab === 'chats' 
                ? `${filteredConversations.length} chats`
                : `${filteredUsers.length} contacts`
              }
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E2E8F0] bg-white flex-shrink-0">
          <button
            onClick={() => {
              setActiveTab('chats');
              setSearchQuery('');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'chats'
                ? 'text-[#1A365D]'
                : 'text-[#718096] hover:text-[#1A365D]'
            }`}
          >
            Chats
            {activeTab === 'chats' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182CE]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('users');
              setSearchQuery('');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'users'
                ? 'text-[#1A365D]'
                : 'text-[#718096] hover:text-[#1A365D]'
            }`}
          >
            All Users
            {activeTab === 'users' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182CE]" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white px-3 py-2 border-b border-[#E2E8F0] flex-shrink-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096] pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Search users...'}
              className="
                w-full pl-9 pr-9 py-2
                bg-[#F7F9FC]
                border-none rounded-lg
                text-[#1A365D] text-sm
                placeholder:text-[#718096]
                focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#3182CE]
                transition-all
              "
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#718096] hover:text-[#1A365D]"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            <ChatsList
              conversations={filteredConversations}
              isLoading={conversationsLoading}
              currentUserId={currentUserId}
              onlineUserIds={new Set(onlineUsers.map((onlineUser) => onlineUser.userId))}
              onConversationClick={handleConversationClick}
              onStartNewChat={handleStartNewChat}
            />
          ) : (
            <AllUsersList
              users={filteredUsers}
              isLoading={usersLoading}
              onlineUserIds={new Set(onlineUsers.map((onlineUser) => onlineUser.userId))}
              getConversationForUser={getConversationForUser}
              onUserClick={handleUserClick}
              searchQuery={searchQuery}
            />
          )}
        </div>

        {/* Footer */}
        {(filteredConversations.length > 0 || filteredUsers.length > 0) && (
          <div className="bg-white border-t border-[#E2E8F0] px-4 py-2 flex justify-between items-center flex-shrink-0">
            <span className="text-xs text-[#718096]">
              {activeTab === 'chats' 
                ? `${filteredConversations.length} conversations`
                : `${filteredUsers.length} contacts`
              }
            </span>
            {activeTab === 'chats' && filteredConversations.length === 0 && !searchQuery && (
              <button
                onClick={handleStartNewChat}
                className="text-xs text-[#3182CE] font-medium hover:text-[#1A365D] transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Start New Chat
              </button>
            )}
            {activeTab === 'users' && searchQuery && (
              <span className="text-xs text-[#718096]">
                {filteredUsers.length} of {users.length} users
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}