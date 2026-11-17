'use client';

import { LifeBuoy, MessageSquare, Plus, MapPin } from 'lucide-react';
import Image from 'next/image';
import type { Conversation, User } from '@/types/messaging';
import VerifiedBadge from '@/components/VerifiedBadge';
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

/* ─────────────────────────────────────────────────────────────────────────────
   Time formatting — compact & scannable
   ───────────────────────────────────────────────────────────────────────────── */

function formatCompactTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;

  const isToday =
    d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────────── */

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

  const supportUnread = supportConversation?.unreadCount ?? 0;

  /* ── Support row ── */
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
      aria-label={`Open chat with ${supportName}${
        supportUnread > 0 ? `, ${supportUnread} unread messages` : ''
      }`}
      className="group flex w-full items-center gap-3 border-b border-[#fef3c7] bg-[#fffbeb] px-3 py-2.5 text-left transition hover:bg-[#fef3c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#b98a3e]"
    >
      <div className="relative shrink-0">
        {supportContact.image ? (
          <Image
            src={supportContact.image}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-full border-2 border-[#b98a3e] object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a365d] text-white">
            <LifeBuoy className="h-4 w-4 text-[#d6b56d]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-[#1a365d]">
              {supportName}
            </span>
            <span className="shrink-0 rounded bg-[#b98a3e] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              Support
            </span>
          </div>
          {supportConversation?.lastMessage && (
            <span className="shrink-0 text-[10px] font-medium tabular-nums text-[#94a3b8]">
              {formatCompactTime(supportConversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-[#64748b]">
          {supportConversation?.lastMessage
            ? `${
                supportConversation.lastMessage.senderId === currentUserId
                  ? 'You: '
                  : ''
              }${supportConversation.lastMessage.content}`
            : 'Message Selfless Support'}
        </p>
      </div>

      {supportUnread > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#b98a3e] px-1.5 text-[10px] font-bold tabular-nums text-white">
          {supportUnread > 99 ? '99+' : supportUnread}
        </span>
      )}
    </button>
  );

  /* ── Header ── */
  const header = (
    <div className="flex items-center justify-between border-b border-[#e2e8f0] px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
        Recent chats
      </span>
      <button
        type="button"
        onClick={onStartNewChat}
        aria-label="Start a new chat"
        title="Start a new chat"
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#1a365d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div>
        {header}
        <div className="divide-y divide-[#f1f5f9]">
          {supportRow}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 px-3 py-2.5"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#f1f5f9]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 rounded bg-[#f1f5f9]" />
                <div className="h-3 w-2/3 rounded bg-[#f1f5f9]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (regularConversations.length === 0 && !supportConversation) {
    return (
      <div>
        {header}
        {supportRow && (
          <div className="border-b border-[#f1f5f9]">{supportRow}</div>
        )}
        <div className="px-4 py-12 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#94a3b8]">
            <MessageSquare className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#0f172a]">
            No conversations yet
          </p>
          <p className="mx-auto mt-1 max-w-[200px] text-xs leading-5 text-[#64748b]">
            Start a chat to connect with someone.
          </p>
          <button
            type="button"
            onClick={onStartNewChat}
            className="mx-auto mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white transition hover:bg-[#14294a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
          >
            <Plus className="h-3.5 w-3.5" />
            Start a chat
          </button>
        </div>
      </div>
    );
  }

  /* ── List ── */
  return (
    <div>
      {header}
      <div className="divide-y divide-[#f1f5f9]">
        {supportRow}

        {regularConversations.map((conversation) => {
          const otherUser = conversation.otherUser;
          const fullName = getDisplayName(otherUser);
          const initials = initialsOf(fullName);
          const lastMessage = conversation.lastMessage;
          const isUnread = (conversation.unreadCount ?? 0) > 0;
          const isOnline = otherUser
            ? onlineUserIds.has(otherUser.id)
            : false;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onConversationClick(conversation)}
              onMouseEnter={() => prefetchConversation?.(conversation.id)}
              aria-label={`Chat with ${fullName}${
                isUnread ? `, ${conversation.unreadCount} unread messages` : ''
              }`}
              className={`group relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#f8fafc] focus-visible:bg-[#f8fafc] focus-visible:outline-none ${
                isUnread ? 'bg-[#f8fbff]' : 'bg-white'
              }`}
            >
              {/* Unread accent bar */}
              {isUnread && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-[#1a365d]"
                />
              )}

              {/* Avatar */}
              <div className="relative shrink-0">
                {otherUser?.image ? (
                  <Image
                    src={otherUser.image}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-[#f1f5f9]"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">
                    {initials}
                  </div>
                )}
                {isOnline && (
                  <span
                    aria-label="Online"
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                  />
                )}
              </div>

              {/* Body */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1">
                    <h3
                      className={`truncate text-sm ${
                        isUnread
                          ? 'font-bold text-[#0f172a]'
                          : 'font-semibold text-[#334155]'
                      }`}
                    >
                      {fullName}
                    </h3>
                    {otherUser?.hasVerifiedBadge && (
                      <VerifiedBadge className="h-3 w-3 shrink-0" />
                    )}
                  </div>
                  {lastMessage && (
                    <span
                      className={`shrink-0 text-[10px] font-medium tabular-nums ${
                        isUnread ? 'text-[#1a365d]' : 'text-[#94a3b8]'
                      }`}
                    >
                      {formatCompactTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                  <MapPin
                    className="h-3 w-3 shrink-0 text-[#94a3b8]"
                    strokeWidth={2}
                  />
                  <span className="truncate text-[#64748b]">
                    {otherUser?.techCenter?.name || 'No location'}
                  </span>
                </div>

                {lastMessage && (
                  <p
                    className={`mt-0.5 truncate text-xs ${
                      isUnread
                        ? 'font-medium text-[#475569]'
                        : 'text-[#64748b]'
                    }`}
                  >
                    {lastMessage.senderId === currentUserId && (
                      <span className="text-[#94a3b8]">You: </span>
                    )}
                    {lastMessage.content}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {conversation.unreadCount && conversation.unreadCount > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#1a365d] px-1.5 text-[10px] font-bold tabular-nums text-white">
                  {conversation.unreadCount > 99
                    ? '99+'
                    : conversation.unreadCount}
                </span>
              ) : isUnread ? (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-[#1a365d]"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}