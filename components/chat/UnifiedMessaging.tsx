'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Message, Conversation, ChatUser } from '@/types';
import { useChat } from '@/hooks/chatHooks';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import MobileGestureTutorial from './MobileGestureTutorial';


interface UnifiedMessagingProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function UnifiedMessaging({ isOpen, setIsOpen }: UnifiedMessagingProps) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'conversations' | 'users'>('conversations');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; senderName: string } | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    activeConversation,
    conversations,
    messages,
    users,
    totalUnreadCount,
    isLoading,
    sendMessage,
    deleteMessage,
    startNewConversation,
    selectConversation,
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  useEffect(() => {
    // Add CSS animations only on client side
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);



  // Check if user should see mobile tutorial
  useEffect(() => {
    const checkMobileAndTutorial = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasSeenTutorial = localStorage.getItem('mobileChatTutorialSeen');

      if (isMobileDevice && !hasSeenTutorial && isOpen) {
        // Show tutorial after a short delay when chat opens
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    };

    checkMobileAndTutorial();
  }, [isOpen]);

  // Navigation functions
  const navigateToMessages = () => {
    setActiveView('conversations');
    // Clear active conversation to show sidebar
    selectConversation(null);
    // Optional: Navigate to a dedicated messages page if you have one
    // router.push('/messages');
  };

  const navigateToUsers = () => {
    setActiveView('users');
    // Optional: Navigate to a dedicated users page if you have one
    // router.push('/users');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    const receiverId = activeConversation.participants.find(p => p.userId !== user?.id)?.userId;
    if (!receiverId) return;

    const messageContent = messageInput.trim();

    try {
      await sendMessage.mutateAsync({
        content: messageContent,
        receiverId,
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setSelectedMessage(null);
      setShowDeleteOptions(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleMessageLongPress = (messageId: string) => {
    const message = messages.find(m => (m._id || m.id) === messageId);
    if (message && message.senderId === user?.id) {
      setSelectedMessage(messageId);
      setShowDeleteOptions(true);
    }
  };

  const handleReply = (messageId?: string) => {
    if (!messageId) return;
    const message = messages.find(m => (m._id || m.id) === messageId);
    if (message) {
      setReplyingTo({
        id: messageId,
        content: message.content,
        senderName: message.senderName
      });
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleReaction = async (messageId: string, emoji: string, action: 'add' | 'remove') => {
    try {
      const response = await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        body: JSON.stringify({ messageId, emoji, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to manage reaction');
      }

      const result = await response.json();
      console.log('Reaction managed successfully:', result);

      // Invalidate messages cache to show updated reactions
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversation?.id] });
    } catch (error) {
      console.error('Error managing reaction:', error);
    }
  };

  // Touch tracking for swipe gestures
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent, messageId?: string) => {
    if (!messageId) return;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent, messageId?: string) => {
    if (!messageId) return;
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if it's a horizontal swipe (not vertical scroll)
    if (absDeltaX > absDeltaY && absDeltaX > 50) {
      // Swipe right to reply (positive deltaX)
      if (deltaX > 0) {
        handleReply(messageId);
      }
      // Swipe left for long press/delete (negative deltaX)
      else if (deltaX < 0) {
        const message = messages.find(m => (m._id || m.id) === messageId);
        if (message && message.senderId === user?.id) {
          handleMessageLongPress(messageId);
        }
      }
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== user?.id);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(chatUser =>
    chatUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chatUser.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:w-[450px] md:h-[650px] lg:w-[500px] lg:h-[700px] max-w-[90vw] max-h-[90vh] border border-gray-100 backdrop-blur-xl bg-white/95 transition-all duration-500 ease-out ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-5 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                title="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl mb-1 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Messages</h3>
                    <p className="text-xs text-white/90 font-medium">Connect with students & admin</p>
                  </div>

                  {/* Help Button */}
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Mobile gestures tutorial"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* View Toggle Tabs */}
          <div className="flex gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl p-1.5 relative">
            <div className={`absolute top-1.5 left-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white rounded-lg shadow-lg transition-all duration-300 ease-out ${activeView === 'conversations' ? 'translate-x-0' : 'translate-x-full'
              }`} />
            <button
              onClick={navigateToMessages}
              className={`relative flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${activeView === 'conversations'
                ? 'text-indigo-600 font-semibold'
                : 'text-white/80 hover:text-white'
                }`}
              title="Navigate to messages"
            >
              <span className="hidden sm:inline">Chats</span>
              <span className="sm:hidden">💬</span>
            </button>
            <button
              onClick={navigateToUsers}
              className={`relative flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${activeView === 'users'
                ? 'text-indigo-600 font-semibold'
                : 'text-white/80 hover:text-white'
                }`}
              title="Navigate to users"
            >
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">👥</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className={`${activeConversation ? 'w-0' : 'w-full'} flex flex-col bg-gradient-to-b from-gray-50 to-white transition-all duration-500 ease-out`}>
            {/* Conversations View */}
            {activeView === 'conversations' && (
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-center font-semibold text-gray-700 mb-2">No conversations yet</p>
                    <p className="text-sm text-gray-400 mb-4">Start messaging other users</p>
                    <button
                      onClick={navigateToUsers}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
                    >
                      Find Users
                    </button>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {conversations.map((conversation, index) => {
                      const otherUser = getOtherParticipant(conversation);
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => selectConversation(conversation)}
                          className={`w-full p-3 md:p-4 hover:bg-white rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-md group ${index === 0 ? 'mt-2' : ''
                            }`}
                          style={{
                            animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                          }}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-base md:text-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                              {otherUser?.userName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{otherUser?.userName}</p>
                              <p className="text-xs text-gray-400">
                                {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md">
                                {conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Users View */}
            {activeView === 'users' && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                    />
                    <svg
                      className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
                        title="Clear search"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-600">No registered students found</p>
                      {searchQuery && (
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map((chatUser, index) => (
                        <button
                          key={chatUser.id}
                          onClick={() => {
                            console.log('🔍 Clicking user:', chatUser.name, 'ID:', chatUser.id);
                            console.log('🔍 Current user ID:', user?.id);
                            startNewConversation(chatUser);
                            // Don't change view - let the conversation open automatically
                            // The conversation will open in the chat area
                          }}
                          className="w-full p-4 hover:bg-white rounded-xl flex items-center gap-4 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-md group"
                          style={{
                            animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                          }}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                              {chatUser.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 text-base mb-2">{chatUser.name}</p>
                            <div className="flex gap-2">
                              {chatUser.isAdmin && (
                                <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs rounded-full font-medium shadow-sm">
                                  Admin
                                </span>
                              )}
                              {chatUser.isTutor && (
                                <span className="px-2 py-1 bg-gradient-to-r from-emerald-400 to-green-400 text-white text-xs rounded-full font-medium shadow-sm">
                                  Tutor
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          {activeConversation && (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-white border-b p-4 flex items-center gap-3">
                <button
                  onClick={navigateToMessages}
                  className="hover:bg-gray-100 rounded-full p-1"
                  title="Back to conversations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getOtherParticipant(activeConversation)?.userName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {getOtherParticipant(activeConversation)?.userName}
                  </p>
                </div>
              </div>

              {/* Encryption Notice */}
              <div className="px-4 py-2 bg-gray-50 border-b">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Messages are end-to-end encrypted</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    const messageId = message._id || message.id;
                    return (
                      <div
                        key={messageId}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 sm:px-4 sm:py-2 rounded-2xl relative group cursor-pointer transition-transform ${isOwn
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (isOwn && messageId) handleMessageLongPress(messageId);
                          }}
                          onTouchStart={(e) => handleTouchStart(e, messageId)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={(e) => handleTouchEnd(e, messageId)}
                          onClick={() => handleReply(messageId)}
                        >
                          <p className="text-xs sm:text-sm break-words">{message.content}</p>
                          <div className={`flex items-center justify-between mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                            <span className="text-xs">{formatTime(message.timestamp)}</span>
                            {isOwn && (
                              <div className="flex items-center gap-1">
                                {/* Delete Button */}
                                <button
                                  onClick={() => messageId && handleMessageLongPress(messageId)}
                                  className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete message"
                                >
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.reactions.map((reaction, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs"
                                  title={`${reaction.userName} reacted with ${reaction.emoji}`}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-gray-600">{1}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reaction Picker */}
                          {showReactions === messageId && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1">
                              {['❤️', '😂', '😮', '😢', '😡', '👍', '👎'].map((emoji) => {
                                const hasReacted = message.reactions?.some(r => r.userId === user?.id && r.emoji === emoji);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(messageId, emoji, hasReacted ? 'remove' : 'add')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 transition-colors ${hasReacted ? 'bg-blue-100' : ''}`}
                                    title={hasReacted ? `Remove ${emoji}` : `React with ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Reaction Button */}
                          <button
                            onClick={() => setShowReactions(showReactions === messageId ? null : (messageId ?? null))}
                            className="absolute bottom-2 right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                            title="Add reaction"
                          >
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-3 py-2 bg-blue-50 border-l-4 border-blue-500 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900">Replying to {replyingTo.senderName}</p>
                    <p className="text-sm text-gray-600 truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={cancelReply}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    autoFocus={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                    spellCheck={true}
                    enterKeyHint="send"
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base touch-manipulation"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendMessage.isPending}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-2 sm:p-2 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {showDeleteOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Message</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDeleteMessage(selectedMessage!)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <div>
                  <p className="font-medium text-red-600">Delete Message</p>
                  <p className="text-sm text-gray-500">Message will be deleted for all participants</p>
                </div>
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteOptions(false);
                  setSelectedMessage(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Gesture Tutorial */}
      <MobileGestureTutorial
        isVisible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}
