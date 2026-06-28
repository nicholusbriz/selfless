'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, X, User as UserIcon, MoreVertical } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useMessagingStore } from '@/stores/messagingStore';
import type { Conversation, User } from '@/types/messaging';

export default function MessagingTab() {
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    fetchConversations,
    setActiveConversation,
    createConversation,
    sendMessage,
    addMessage,
    addOnlineUser,
    removeOnlineUser,
    onlineUsers,
    deleteMessage
  } = useMessagingStore();

  const [messageInput, setMessageInput] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchAllUsers();
    }
  }, [user, fetchConversations]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users', {
        headers: { 'x-user-id': user?.id || '' }
      });
      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
        setFilteredUsers(users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Helper to get unread count for a user
  const getUnreadCount = (userId: string) => {
    const conversation = conversations.find(c =>
      c.participants?.some(p => p.id === userId)
    );
    return conversation?.unreadCount || 0;
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId) return;

    try {
      await sendMessage(activeConversationId, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversationId) return;

    try {
      await deleteMessage(messageId, activeConversationId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleSelectUser = async (selectedUser: User) => {
    setSelectedUser(selectedUser);
    try {
      const conversation = await createConversation(selectedUser.id);
      setActiveConversation(conversation.id);
      setShowChat(true); // Show chat on mobile when user is selected
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleBackToList = () => {
    setShowChat(false);
    setActiveConversation(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(u =>
        u.firstName.toLowerCase().includes(query.toLowerCase()) ||
        u.lastName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  return (
    <motion.div 
      className="space-y-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-gray-400 text-sm sm:text-base">Connect with your fellow students and teachers</p>
      </motion.div>

      {/* Main Content */}
      <div className="h-[calc(100vh-250px)] md:h-[calc(100vh-300px)]">
        {/* Users List - Full width, hidden when chat is shown */}
        {!showChat && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden flex flex-col"
          >
          {/* Search Bar */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loadingUsers ? (
              <div className="p-4 text-center text-gray-400">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No users found</div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left border-b border-white/5"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {`${u.firstName[0]}${u.lastName[0]}`}
                      </span>
                    </div>
                    {onlineUsers.has(u.id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <p className="text-white font-medium text-sm truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    {getUnreadCount(u.id) > 0 && (
                      <div className="ml-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {getUnreadCount(u.id)}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
        )}

        {/* Chat Area - Full width, shown when chat is selected */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden flex flex-col"
          >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                {/* Back button - Now shows on both mobile and desktop */}
                <button
                  onClick={handleBackToList}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {activeConversation.participants?.[0]?.firstName?.[0]}
                    {activeConversation.participants?.[0]?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {activeConversation.participants?.[0]?.firstName} {activeConversation.participants?.[0]?.lastName}
                  </p>
                  <p className="text-gray-400 text-sm">Online</p>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  activeMessages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </motion.div>
        )}
      </div>
    </motion.div>
  );
}
