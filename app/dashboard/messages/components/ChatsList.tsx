'use client';

import { LifeBuoy, MessageSquare, Plus } from 'lucide-react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { Conversation, User } from '@/types/messaging';
import { getDisplayName } from '@/lib/messaging/displayName';

interface ChatsListProps {
  conversations: Conversation[];
  isLoading: boolean;
  currentUserId: string;
  onlineUserIds: Set<string>;
  onConversationClick: (conversation: Conversation) => void;
  onStartNewChat: () => void;
  supportContact?: User;
  onSupportClick?: () => void;
  prefetchConversation?: (conversationId: string) => void;
}

export function ChatsList({
  conversations,
  isLoading,
  currentUserId,
  onlineUserIds,
  onConversationClick,
  onStartNewChat,
  supportContact,
  onSupportClick,
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

  const supportName = getDisplayName(supportContact, 'Selfless Support');
  const supportConversation = supportContact
    ? conversations.find(
        (conversation) =>
          conversation.otherUser?.id === supportContact.id ||
          conversation.participants.includes(supportContact.id),
      )
    : undefined;
  const regularConversations = supportContact
    ? conversations.filter(
        (conversation) =>
          conversation.otherUser?.id !== supportContact.id &&
          !conversation.participants.includes(supportContact.id),
      )
    : conversations;
  const supportRow = supportContact && (
    <button
      type="button"
      onClick={() => {
        if (supportConversation) {
          onConversationClick(supportConversation);
        } else {
          onSupportClick?.();
        }
      }}
      className="flex w-full items-center gap-3 border-b border-[#EEE8DA] bg-[#FFFCF5] px-4 py-3.5 text-left transition-colors hover:bg-[#FBF4E5] focus:outline-none focus:ring-2 focus:ring-[#B98A3E] focus:ring-inset sm:px-6"
      aria-label={`Open chat with Selfless Support, ${supportName}${(supportConversation?.unreadCount ?? 0) > 0 ? `, ${supportConversation?.unreadCount} unread messages` : ''}`}
    >
      {supportContact.image ? (
        <Image
          src={supportContact.image}
          alt=""
          width={48}
          height={48}
          unoptimized
          className="h-12 w-12 shrink-0 rounded-full border-2 border-[#B98A3E] object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-white">
          <LifeBuoy className="h-5 w-5 text-[#D6B56D]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-[#1A365D]">
            {supportName}
          </span>
          <span className="shrink-0 rounded-full bg-[#B98A3E] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            Support
          </span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-[#718096]">
          {supportConversation?.lastMessage
            ? `${supportConversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}${supportConversation.lastMessage.content}`
            : 'Message Selfless Support'}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        {supportConversation?.lastMessage && (
          <span className="text-[10px] text-[#718096]">
            {formatTime(supportConversation.lastMessage.createdAt)}
          </span>
        )}
        {(supportConversation?.unreadCount ?? 0) > 0 ? (
          <span className="min-w-5 rounded-full bg-[#B98A3E] px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
            {(supportConversation?.unreadCount ?? 0) > 99
              ? '99+'
              : supportConversation?.unreadCount}
          </span>
        ) : (
          <MessageSquare className="h-4 w-4 text-[#B98A3E]" />
        )}
      </span>
    </button>
  );

  const recentChatsHeader = (
    <div className="flex items-center justify-between border-b border-[#E8ECF2] px-4 py-3 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#718096]">
        Recent chats
      </span>
      <button
        type="button"
        onClick={onStartNewChat}
        aria-label="Start a new chat"
        title="Start a new chat"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#1A2B4C] transition-colors hover:bg-[#F0F2F5] hover:text-[#9A7436] focus:outline-none focus:ring-2 focus:ring-[#B98A3E] focus:ring-offset-1"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {recentChatsHeader}
        <div className="divide-y divide-[#EEF1F5]">
          {supportRow}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3 sm:px-6">
              <div className="h-12 w-12 rounded-full bg-[#F0F2F5]" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-[#F0F2F5]" />
                <div className="mt-1 h-3 w-48 rounded bg-[#F0F2F5]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (regularConversations.length === 0 && !supportConversation) {
    return (
      <div>
        {recentChatsHeader}
        {supportRow && <div className="border-b border-[#EEF1F5]">{supportRow}</div>}
        <div className="px-5 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F2F5]">
            <MessageSquare className="h-5 w-5 text-[#788397]" strokeWidth={1.8} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#26354D]">No other conversations yet</p>
          <p className="mt-1 text-xs text-[#8791A1]">Start a chat to connect with someone.</p>
          <button
            type="button"
            onClick={onStartNewChat}
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1A2B4C] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#263B60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]"
          >
            <Plus className="h-4 w-4" />
            Start a chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {recentChatsHeader}

      <div className="divide-y divide-[#EEF1F5]">
        {supportRow}
        {regularConversations.map((conversation) => {
        const otherUser = conversation.otherUser;
        const fullName = getDisplayName(otherUser);
        const initials = fullName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join('')
          .toUpperCase();
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
            className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#B98A3E] focus:ring-inset group sm:px-6"
          >
            {/* Avatar */}
            {otherUser?.image ? (
              <Image
                src={otherUser.image}
                alt={fullName}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#F0F2F5]"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A2B4C]">
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
            )}

            {/* Chat Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`truncate text-sm ${isUnread ? 'font-bold text-[#1A2B4C]' : 'font-semibold text-[#26354D]'}`}>
                  {fullName}
                </h3>
                {lastMessage && (
                  <span className="shrink-0 text-[11px] text-[#8791A1]">
                    {formatTime(lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#788397]">
                <span className={`inline-flex items-center gap-1.5 ${isOnline ? 'text-[#3F8F5B]' : 'text-[#8791A1]'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#3F8F5B]' : 'bg-[#AAB2BF]'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <MapPin className="h-3 w-3 text-[#A0A9B6]" strokeWidth={2} />
                <span className="truncate">
                  {otherUser?.techCenter?.name || 'No location'}
                </span>
              </div>
              {lastMessage && (
                <p className={`mt-1 truncate text-xs ${isUnread ? 'font-medium text-[#52617A]' : 'text-[#8791A1]'}`}>
                  {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                  {lastMessage.content}
                </p>
              )}
            </div>

            {/* Unread count badge */}
            {conversation.unreadCount && conversation.unreadCount > 0 ? (
              <div className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#1A2B4C] px-1.5 pointer-events-none">
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
    </div>
  );
}
