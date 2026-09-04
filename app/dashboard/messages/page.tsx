'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  X,
  MapPin,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  Plus,
  Clock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Chat } from './components/Chat';
import Link from 'next/link';
import { useUnreadMessageCount } from '@/hooks/useMessages';

// ============================================================
// INTERFACES
// ============================================================

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
  techCenter?: {
    id: string;
    name: string;
  };
}

interface Conversation {
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

type TabType = 'chats' | 'users';

// ============================================================
// MAIN PAGE
// ============================================================

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || '';

  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Fetch users
  const { 
    data: users = [], 
    isLoading: usersLoading 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users || [];
    },
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch conversations
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      const response = await fetch('/api/messages/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      return data.conversations || [];
    },
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
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

  const handleUserClick = (user: User) => {
    // Open chat immediately - instant UI update
    setSelectedUser(user);
    
    // Check if conversation already exists
    const existing = conversations.find(
      (conv: Conversation) => conv.participants.includes(user.id)
    );
    
    if (existing) {
      setSelectedConversation(existing);
    } else {
      // Create new conversation
      createConversationMutation.mutate(user.id);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    const otherUser = users.find((u: User) => u.id === otherUserId);
    
    if (otherUser) {
      // Open chat immediately - instant UI update
      setSelectedUser(otherUser);
      setSelectedConversation(conversation);
    }
  };

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
      (conv: Conversation) => conv.participants.includes(userId)
    );
  };

  // Format time for last message
  const formatTime = (date: string) => {
    const msgDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - msgDate.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString();
    }
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

  // Show Chat component when a user is selected
  if (selectedUser && selectedConversation) {
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
                <img
                  src={selectedUser.image}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : null}
              <div>
                <h2 className="text-white font-semibold">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-white/70 text-xs">
                  {selectedUser.techCenter?.name || 'No location'}
                </p>
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
              otherUserId={selectedUser.id}
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
          // Chats Tab
          <>
            {conversationsLoading ? (
              <div className="divide-y divide-[#F7F9FC]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#F7F9FC]" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-[#F7F9FC] rounded" />
                      <div className="h-3 w-48 bg-[#F7F9FC] rounded mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare className="mx-auto w-12 h-12 text-[#A0AEC0]" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-[#4A5568]">No conversations yet</p>
                <p className="text-xs text-[#718096] mt-1">Start a new chat to connect with someone</p>
                <button
                  onClick={handleStartNewChat}
                  className="mt-4 px-4 py-2 bg-[#1A365D] text-white text-sm rounded-lg hover:bg-[#153475] transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Start New Chat
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#F7F9FC]">
                {filteredConversations.map((conversation: Conversation) => {
                  const otherUser = conversation.otherUser;
                  const fullName = otherUser?.fullName || 'Unknown User';
                  const initials = otherUser 
                    ? `${otherUser.firstName.charAt(0)}${otherUser.lastName.charAt(0)}`.toUpperCase()
                    : '??';
                  const lastMessage = conversation.lastMessage;
                  const isUnread = lastMessage && lastMessage.senderId !== currentUserId;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7FAFC] cursor-pointer transition-colors group"
                    >
                      {/* Avatar */}
                      {otherUser?.image ? (
                        <img
                          src={otherUser.image}
                          alt={fullName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-[#1A365D] rounded-full flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {initials}
                          </span>
                        </div>
                      )}

                      {/* Chat Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium truncate ${isUnread ? 'text-[#1A365D] font-semibold' : 'text-[#1A365D]'}`}>
                            {fullName}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-[#718096] flex-shrink-0">
                              {formatTime(lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#4A5568]">
                          <MapPin className="w-3 h-3 text-[#3182CE]" strokeWidth={2} />
                          <span className="truncate">
                            {otherUser?.techCenter?.name || 'No location'}
                          </span>
                        </div>
                        {lastMessage && (
                          <p className={`text-xs truncate mt-0.5 ${isUnread ? 'text-[#1A365D] font-medium' : 'text-[#718096]'}`}>
                            {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                            {lastMessage.content}
                          </p>
                        )}
                      </div>

                      {/* Unread count badge */}
                      {conversation.unreadCount && conversation.unreadCount > 0 ? (
                        <div className="min-w-[20px] h-5 px-1.5 bg-[#3182CE] rounded-full flex items-center justify-center flex-shrink-0 pointer-events-none">
                          <span className="text-white text-[10px] font-semibold">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        </div>
                      ) : isUnread && (
                        <div className="w-2.5 h-2.5 bg-[#3182CE] rounded-full flex-shrink-0 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          // All Users Tab
          <>
            {usersLoading ? (
              <div className="divide-y divide-[#F7F9FC]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#F7F9FC]" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-[#F7F9FC] rounded" />
                      <div className="h-3 w-24 bg-[#F7F9FC] rounded mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="mx-auto w-12 h-12 text-[#A0AEC0]" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-[#4A5568]">No users found</p>
                {searchQuery && (
                  <p className="text-xs text-[#718096] mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#F7F9FC]">
                {filteredUsers.map((user: User) => {
                  const fullName = `${user.firstName} ${user.lastName}`;
                  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
                  const hasConversation = getConversationForUser(user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7FAFC] cursor-pointer transition-colors group"
                    >
                      {/* Avatar */}
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={fullName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-[#1A365D] rounded-full flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {initials}
                          </span>
                        </div>
                      )}

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-[#1A365D] truncate">
                            {fullName}
                          </h3>
                          {hasConversation && (
                            <span className="text-xs text-[#2C5282] bg-[#EBF8FF] px-2 py-0.5 rounded-full">
                              Chat
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#4A5568]">
                          <MapPin className="w-3 h-3 text-[#3182CE]" strokeWidth={2} />
                          <span className="truncate">
                            {user.techCenter?.name || 'No location'}
                          </span>
                        </div>
                      </div>

                      {/* Message button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                        className="p-2 bg-[#1A365D] text-white rounded-full hover:bg-[#153475] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
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