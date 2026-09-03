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

// ============================================================
// INTERFACES
// ============================================================

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
    techCenter?: {
      id: string;
      name: string;
    };
  } | null;
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
      <div className="min-h-screen bg-[#F1F1EC] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto w-8 h-8 text-[#B98A3E]" />
          <p className="mt-2 text-[13px] text-[#6B7268]">Please sign in to view messages</p>
        </div>
      </div>
    );
  }

  // Show Chat component when a user is selected
  if (selectedUser && selectedConversation) {
    return (
      <div className="min-h-screen bg-[#F1F1EC]">
        <div className="max-w-4xl mx-auto bg-white min-h-screen">
          {/* Chat Header */}
          <div className="bg-[#12203B] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
            <button
              onClick={handleBackToList}
              className="text-white hover:text-[#B98A3E] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-white font-semibold">
                {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <p className="text-white/70 text-xs">
                {selectedUser.techCenter?.name || 'No location'}
              </p>
            </div>
          </div>

          {/* Chat Component */}
          <Chat 
            conversationId={selectedConversation.id}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    );
  }

  // Show main view with tabs
  return (
    <div className="min-h-screen bg-[#F1F1EC]">
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-[#12203B] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
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
        <div className="flex border-b border-[#DADCD3] bg-white">
          <button
            onClick={() => {
              setActiveTab('chats');
              setSearchQuery('');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'chats'
                ? 'text-[#12203B]'
                : 'text-[#8A9088] hover:text-[#12203B]'
            }`}
          >
            Chats
            {activeTab === 'chats' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B98A3E]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('users');
              setSearchQuery('');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'users'
                ? 'text-[#12203B]'
                : 'text-[#8A9088] hover:text-[#12203B]'
            }`}
          >
            All Users
            {activeTab === 'users' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B98A3E]" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white px-3 py-2 border-b border-[#DADCD3]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9088] pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Search users...'}
              className="
                w-full pl-9 pr-9 py-2
                bg-[#F1F1EC]
                border-none rounded-lg
                text-[#12203B] text-sm
                placeholder:text-[#8A9088]
                focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B98A3E]
                transition-all
              "
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#8A9088] hover:text-[#12203B]"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'chats' ? (
          // Chats Tab
          <>
            {conversationsLoading ? (
              <div className="divide-y divide-[#F1F1EC]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#F1F1EC]" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-[#F1F1EC] rounded" />
                      <div className="h-3 w-48 bg-[#F1F1EC] rounded mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare className="mx-auto w-12 h-12 text-[#B9BEB2]" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-[#6B7268]">No conversations yet</p>
                <p className="text-xs text-[#8A9088] mt-1">Start a new chat to connect with someone</p>
                <button
                  onClick={handleStartNewChat}
                  className="mt-4 px-4 py-2 bg-[#12203B] text-white text-sm rounded-lg hover:bg-[#1C2E4E] transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Start New Chat
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F1EC]">
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
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F2] cursor-pointer transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 flex items-center justify-center bg-[#12203B] rounded-full flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {initials}
                        </span>
                      </div>

                      {/* Chat Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium truncate ${isUnread ? 'text-[#12203B] font-semibold' : 'text-[#12203B]'}`}>
                            {fullName}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-[#8A9088] flex-shrink-0">
                              {formatTime(lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#6B7268]">
                          <MapPin className="w-3 h-3 text-[#B98A3E]" strokeWidth={2} />
                          <span className="truncate">
                            {otherUser?.techCenter?.name || 'No location'}
                          </span>
                        </div>
                        {lastMessage && (
                          <p className={`text-xs truncate mt-0.5 ${isUnread ? 'text-[#12203B] font-medium' : 'text-[#8A9088]'}`}>
                            {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                            {lastMessage.content}
                          </p>
                        )}
                      </div>

                      {/* Unread indicator */}
                      {isUnread && (
                        <div className="w-2.5 h-2.5 bg-[#B98A3E] rounded-full flex-shrink-0" />
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
              <div className="divide-y divide-[#F1F1EC]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#F1F1EC]" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-[#F1F1EC] rounded" />
                      <div className="h-3 w-24 bg-[#F1F1EC] rounded mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="mx-auto w-12 h-12 text-[#B9BEB2]" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-[#6B7268]">No users found</p>
                {searchQuery && (
                  <p className="text-xs text-[#8A9088] mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#F1F1EC]">
                {filteredUsers.map((user: User) => {
                  const fullName = `${user.firstName} ${user.lastName}`;
                  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
                  const hasConversation = getConversationForUser(user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F2] cursor-pointer transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 flex items-center justify-center bg-[#12203B] rounded-full flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {initials}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-[#12203B] truncate">
                            {fullName}
                          </h3>
                          {hasConversation && (
                            <span className="text-xs text-[#55705B] bg-[#EEF3EE] px-2 py-0.5 rounded-full">
                              Chat
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#6B7268]">
                          <MapPin className="w-3 h-3 text-[#B98A3E]" strokeWidth={2} />
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
                        className="p-2 bg-[#12203B] text-white rounded-full hover:bg-[#1C2E4E] transition-colors opacity-0 group-hover:opacity-100"
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

        {/* Footer */}
        {(filteredConversations.length > 0 || filteredUsers.length > 0) && (
          <div className="sticky bottom-0 bg-white border-t border-[#DADCD3] px-4 py-2 flex justify-between items-center">
            <span className="text-xs text-[#8A9088]">
              {activeTab === 'chats' 
                ? `${filteredConversations.length} conversations`
                : `${filteredUsers.length} contacts`
              }
            </span>
            {activeTab === 'chats' && filteredConversations.length === 0 && !searchQuery && (
              <button
                onClick={handleStartNewChat}
                className="text-xs text-[#B98A3E] font-medium hover:text-[#12203B] transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Start New Chat
              </button>
            )}
            {activeTab === 'users' && searchQuery && (
              <span className="text-xs text-[#8A9088]">
                {filteredUsers.length} of {users.length} users
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}