'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  MoreVertical,
  Send,
  Trash2,
  AlertCircle,
  Check,
  CheckCheck,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';
import { useMessages } from '@/hooks/useMessages';
import { useQueryClient } from '@tanstack/react-query';
import type { ConversationCacheItem, Message } from '@/types/messaging';
import { getApiErrorMessage } from '@/lib/api-response';
import { getChatTheme, type ChatTheme } from '@/lib/messaging/chatThemes';

interface ChatProps {
  conversationId: string;
  currentUserId: string;
  theme: ChatTheme;
  profileImageUrl: string | null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Background layer
   ───────────────────────────────────────────────────────────────────────────── */

function ChatBackground({
  theme,
  profileImageUrl,
}: Pick<ChatProps, 'theme' | 'profileImageUrl'>) {
  if (theme !== 'profile-image' || !profileImageUrl) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <Image
        src={profileImageUrl}
        alt=""
        fill
        sizes="100vw"
        unoptimized
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/25" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: string) {
  const msgDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (msgDate.toDateString() === today.toDateString()) return 'Today';
  if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return msgDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year:
      msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────────────────────── */

export function Chat({
  conversationId,
  currentUserId,
  theme,
  profileImageUrl,
}: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(
    null,
  );
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const themeStyles = getChatTheme(theme);

  /* Close message menu on outside click / escape */
  useEffect(() => {
    if (!openMessageMenuId) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest('[data-message-menu]')
      ) {
        setOpenMessageMenuId(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMessageMenuId(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMessageMenuId]);

  const markedReadConversationRef = useRef<string | null>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    markMessagesAsRead,
    isSending,
  } = useMessages({ conversationId, currentUserId });

  /* ── Mark messages as read optimistically ── */
  useEffect(() => {
    if (
      !conversationId ||
      !currentUserId ||
      markedReadConversationRef.current === conversationId
    )
      return;

    markedReadConversationRef.current = conversationId;

    queryClient.setQueryData<ConversationCacheItem[] | undefined>(
      ['conversations', currentUserId],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
        );
      },
    );

    void markMessagesAsRead().catch((err) => {
      markedReadConversationRef.current = null;
      console.error('Failed to mark messages as read:', err);
    });
  }, [conversationId, currentUserId, markMessagesAsRead, queryClient]);

  /* ── Dedupe + scroll to bottom ── */
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((message: Message) => {
      if (seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uniqueMessages]);

  /* ── Handlers ── */
  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isSending) return;

    setNewMessage('');
    inputRef.current?.focus();
    await sendMessage(trimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (deletingMessageId || !window.confirm('Delete this message?')) return;

    setDeletingMessageId(messageId);
    setOpenMessageMenuId(null);

    const previousMessages = queryClient.getQueryData<Message[]>([
      'messages',
      conversationId,
    ]);
    queryClient.setQueryData<Message[]>(
      ['messages', conversationId],
      (oldMessages = []) =>
        oldMessages.filter((message) => message.id !== messageId),
    );

    try {
      const response = await fetch(
        `/api/messages/${conversationId}/${messageId}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw new Error(
          getApiErrorMessage(data, 'Failed to delete message'),
        );
      }

      void queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['conversations', currentUserId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['messages', 'unread-count', currentUserId],
      });
    } catch (err) {
      console.error('Failed to delete message:', err);
      if (previousMessages) {
        queryClient.setQueryData(
          ['messages', conversationId],
          previousMessages,
        );
      }
    } finally {
      setDeletingMessageId(null);
    }
  };

  /* ── Error state ── */
  if (error) {
    return (
      <div
        className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center"
        style={{ backgroundColor: themeStyles.canvasColor }}
      >
        <ChatBackground theme={theme} profileImageUrl={profileImageUrl} />
        <div className="relative z-10 max-w-xs rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-5 w-5" strokeWidth={2} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#0f172a]">
            Unable to load messages
          </p>
          <p className="mt-1 text-xs leading-5 text-[#64748b]">
            {error instanceof Error ? error.message : 'Something went wrong.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white transition hover:bg-[#14294a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div
        className="relative flex h-full flex-col overflow-hidden"
        style={{ backgroundColor: themeStyles.canvasColor }}
      >
        <ChatBackground theme={theme} profileImageUrl={profileImageUrl} />

        <div className="relative z-10 flex-1 overflow-hidden px-3 py-4 sm:px-4 sm:py-5">
          {/* incoming */}
          <div className="flex justify-start">
            <div className="w-[62%] space-y-2 rounded-2xl rounded-bl-md bg-white/80 px-3.5 py-2.5 shadow-sm">
              <div className="h-2.5 w-full animate-pulse rounded bg-[#e2e8f0]" />
              <div className="h-2.5 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />
            </div>
          </div>

          {/* outgoing */}
          <div className="mt-4 flex justify-end">
            <div className="w-[58%] space-y-2 rounded-2xl rounded-br-md bg-[#1a365d]/10 px-3.5 py-2.5">
              <div className="h-2.5 w-full animate-pulse rounded bg-[#d5dfec]" />
              <div className="h-2.5 w-1/2 animate-pulse rounded bg-[#d5dfec]" />
            </div>
          </div>

          {/* incoming */}
          <div className="mt-4 flex justify-start">
            <div className="w-[48%] space-y-2 rounded-2xl rounded-bl-md bg-white/80 px-3.5 py-2.5 shadow-sm">
              <div className="h-2.5 w-full animate-pulse rounded bg-[#e2e8f0]" />
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-[#e2e8f0] bg-white px-3 py-3">
          <div className="h-10 w-full animate-pulse rounded-xl bg-[#f1f5f9]" />
        </div>
      </div>
    );
  }

  /* ── Main chat ── */
  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{ backgroundColor: themeStyles.canvasColor }}
    >
      <ChatBackground theme={theme} profileImageUrl={profileImageUrl} />

      {/* Messages */}
      <div
        className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5"
        aria-live="polite"
        aria-label="Message thread"
      >
        {uniqueMessages.length === 0 ? (
          /* Empty thread */
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#1a365d] shadow-sm">
              <MessageSquare className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#0f172a]">
              Start the conversation
            </p>
            <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#64748b]">
              Send a message below to say hi.
            </p>
          </div>
        ) : (
          <>
            {/* First date divider */}
            <div className="mb-4 flex justify-center">
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748b] shadow-sm">
                {formatDate(uniqueMessages[0].createdAt)}
              </span>
            </div>

            {uniqueMessages.map((message: Message, index: number) => {
              const isOwn = message.senderId === currentUserId;

              const showDate =
                index > 0 &&
                new Date(message.createdAt).toDateString() !==
                  new Date(uniqueMessages[index - 1].createdAt).toDateString();

              const isMenuOpen = openMessageMenuId === message.id;

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-4 flex justify-center">
                      <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748b] shadow-sm">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`mb-2 flex ${
                      isOwn ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`relative max-w-[86%] border border-black/[0.04] px-3.5 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:max-w-[72%] ${
                        isOwn
                          ? 'rounded-2xl rounded-br-md pr-8'
                          : 'rounded-2xl rounded-bl-md'
                      }`}
                      style={{
                        backgroundColor: isOwn
                          ? themeStyles.outgoingBubbleColor
                          : themeStyles.incomingBubbleColor,
                        color: isOwn
                          ? '#FFFFFF'
                          : themeStyles.incomingTextColor,
                      }}
                    >
                      {/* Message menu trigger */}
                      {isOwn && (
                        <div
                          data-message-menu
                          className="absolute right-0.5 top-0.5"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMessageMenuId((currentId) =>
                                currentId === message.id ? null : message.id,
                              )
                            }
                            aria-label="Message actions"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                            className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div
                              role="menu"
                              aria-label="Message actions"
                              className="absolute right-0 top-7 z-20 w-56 overflow-hidden rounded-lg border border-[#e2e8f0] bg-white p-1 text-[#0f172a] shadow-xl"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleDeleteMessage(message.id)}
                                disabled={deletingMessageId === message.id}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                {deletingMessageId === message.id
                                  ? 'Deleting…'
                                  : 'Delete for everyone'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="break-words text-sm leading-[1.45]">
                        {message.content}
                      </p>

                      {/* Timestamp + status */}
                      <div className="mt-0.5 flex items-center justify-end gap-1">
                        <span
                          className={`text-[10px] tabular-nums ${
                            isOwn ? 'text-white/60' : 'text-[#94a3b8]'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </span>

                        {isOwn && (
                          <span
                            className={`flex items-center ${
                              message.isRead
                                ? 'text-[#7dd3fc]'
                                : 'text-white/55'
                            }`}
                            aria-label={
                              message.isRead ? 'Read' : 'Sent'
                            }
                          >
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3" strokeWidth={2.5} />
                            ) : (
                              <Check className="h-3 w-3" strokeWidth={2.5} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="relative z-10 shrink-0 border-t border-[#e2e8f0] bg-white px-2.5 py-2.5 sm:px-3.5">
        <div className="flex w-full items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={isSending ? '' : newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message…"
            disabled={isSending}
            aria-label="Message"
            className="min-w-0 flex-1 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition focus:border-[#1a365d] focus:bg-white focus:ring-2 focus:ring-[#1a365d]/10 disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:opacity-60"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            aria-label="Send message"
            title="Send message"
            aria-busy={isSending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a365d] text-white transition hover:bg-[#14294a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <p className="mt-1.5 hidden select-none px-1 text-[10px] font-medium text-[#94a3b8] sm:block">
          Press <kbd className="rounded border border-[#e2e8f0] bg-white px-1 py-0.5 font-mono text-[9px] text-[#64748b]">Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}