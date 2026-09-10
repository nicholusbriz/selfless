'use client';

import { MessageSquare, Plus } from 'lucide-react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { Conversation } from '@/types/messaging';

interface ChatsListProps {
  conversations: Conversation[];
  isLoading: boolean;
  currentUserId: string;
  onlineUserIds: Set<string>;
  onConversationClick: (conversation: Conversation) => void;
  onStartNewChat: () => void;
  prefetchConversation?: (conversationId: string) => void;
}

export function ChatsList({
  conversations,
  isLoading,
  currentUserId,
  onlineUserIds,
  onConversationClick,
  onStartNewChat,
  prefetchConversation,
}: ChatsListProps) {
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

  if (isLoading) {
    return (
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
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="py-16 text-center">
        <MessageSquare className="mx-auto w-12 h-12 text-[#A0AEC0]" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-[#4A5568]">No conversations yet</p>
        <p className="text-xs text-[#718096] mt-1">Start a new chat to connect with someone</p>
        <button
          onClick={onStartNewChat}
          className="mt-4 px-4 py-2 bg-[#1A365D] text-white text-sm rounded-lg hover:bg-[#153475] transition-colors flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          Start New Chat
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#F7F9FC]">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser;
        const fullName = otherUser?.fullName || 'Unknown User';
        const initials = otherUser 
          ? `${otherUser.firstName.charAt(0)}${otherUser.lastName.charAt(0)}`.toUpperCase()
          : '??';
        const lastMessage = conversation.lastMessage;
        const isUnread = (conversation.unreadCount ?? 0) > 0;
        const isOnline = otherUser ? onlineUserIds.has(otherUser.id) : false;

        return (
          <div
            key={conversation.id}
            onClick={() => onConversationClick(conversation)}
            onMouseEnter={() => prefetchConversation?.(conversation.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onConversationClick(conversation);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Chat with ${fullName}${isUnread ? `, ${conversation.unreadCount} unread messages` : ''}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7FAFC] cursor-pointer transition-colors group focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:ring-inset"
          >
            {/* Avatar */}
            {otherUser?.image ? (
              <Image
                src={otherUser.image}
                alt={fullName}
                width={48}
                height={48}
                unoptimized
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
              <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                <span className={isOnline ? 'text-[#3F8F5B]' : 'text-[#8A9088]'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
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
            ) : isUnread ? (
              <div className="w-2.5 h-2.5 bg-[#3182CE] rounded-full flex-shrink-0 pointer-events-none" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
