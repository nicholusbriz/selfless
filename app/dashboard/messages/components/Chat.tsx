'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MoreVertical, Send, Trash2, AlertCircle } from 'lucide-react';
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

export function Chat({
  conversationId,
  currentUserId,
  theme,
  profileImageUrl,
}: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const themeStyles = getChatTheme(theme);

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

  // Track if we've already marked as read for this conversation
  const markedReadConversationRef = useRef<string | null>(null);

  const { messages, isLoading, error, sendMessage, markMessagesAsRead, isSending } = useMessages({
    conversationId,
    currentUserId,
  });

  // ============================================================
  // FIXED: Mark messages as read WITHOUT blocking the UI
  // ============================================================
  useEffect(() => {
    // Skip if already marked or missing required data
    if (
      !conversationId ||
      !currentUserId ||
      markedReadConversationRef.current === conversationId
    ) return;

    markedReadConversationRef.current = conversationId;

    // Optimistically update the unread count in the UI immediately
    queryClient.setQueryData<ConversationCacheItem[] | undefined>(
      ['conversations', currentUserId],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((conv) =>
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        );
      }
    );

    // Mark as read in the background - DON'T wait for this to complete
    void markMessagesAsRead().catch((error) => {
      markedReadConversationRef.current = null;
      console.error('Failed to mark messages as read:', error);
    });
  }, [conversationId, currentUserId, markMessagesAsRead, queryClient]);

  // Keep the message list stable even if the API/realtime layer returns a duplicate.
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();

    return messages.filter((message: Message) => {
      if (seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
  }, [messages]);

  // Keep the newest message visible.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uniqueMessages]);

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
      (oldMessages = []) => oldMessages.filter((message) => message.id !== messageId)
    );

    try {
      const response = await fetch(
        `/api/messages/${conversationId}/${messageId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(data, 'Failed to delete message'));
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
    } catch (error) {
      console.error('Failed to delete message:', error);
      if (previousMessages) {
        queryClient.setQueryData(['messages', conversationId], previousMessages);
      }
    } finally {
      setDeletingMessageId(null);
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (date: string) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return 'Today';
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return msgDate.toLocaleDateString();
  };

  if (error) {
    return (
      <div
        className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center"
        style={{ backgroundColor: themeStyles.canvasColor }}
      >
        <ChatBackground theme={theme} profileImageUrl={profileImageUrl} />
        <div className="relative z-10 flex flex-col items-center">
          <AlertCircle className="mb-3 h-12 w-12 text-[#E53E3E]" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[#1A365D]">Unable to load messages</p>
          <p className="mt-1 text-xs text-[#64748B]">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#1A365D] px-4 py-2 text-sm text-white transition-colors hover:bg-[#153475]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="relative flex h-full flex-col overflow-hidden"
        style={{ backgroundColor: themeStyles.canvasColor }}
      >
        <ChatBackground theme={theme} profileImageUrl={profileImageUrl} />
        {/* Lightweight skeletons instead of a spinner. */}
        <div className="relative z-10 flex-1 overflow-hidden px-4 py-5">
          <div className="flex justify-start">
            <div className="w-[62%] space-y-2 rounded-2xl rounded-bl-md bg-[#F3F6F9] px-4 py-3">
              <div className="h-3 w-full animate-pulse rounded bg-[#E2E8F0]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <div className="w-[58%] space-y-2 rounded-2xl rounded-br-md bg-[#1A365D]/10 px-4 py-3">
              <div className="h-3 w-full animate-pulse rounded bg-[#D5DFEC]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#D5DFEC]" />
            </div>
          </div>

          <div className="mt-5 flex justify-start">
            <div className="w-[48%] space-y-2 rounded-2xl rounded-bl-md bg-[#F3F6F9] px-4 py-3">
              <div className="h-3 w-full animate-pulse rounded bg-[#E2E8F0]" />
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-[#E2E8F0] bg-white px-3 py-3">
          <div className="h-12 w-full animate-pulse rounded-xl bg-[#F3F6F9]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{ backgroundColor: themeStyles.canvasColor }}
    >
      <ChatBackground theme={theme} profileImageUrl={profileImageUrl} />
      {/* Messages List */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">
        {uniqueMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#E2E8F0] bg-white">
              <Send className="h-5 w-5 text-[#3182CE]" strokeWidth={1.8} />
            </div>
            <p className="text-sm font-semibold text-[#1A365D]">No messages yet</p>
            <p className="mt-1 text-xs text-[#64748B]">
              Send a message to start the conversation.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#788397]">
                {formatDate(uniqueMessages[0].createdAt)}
              </span>
            </div>

            {uniqueMessages.map((message: Message, index: number) => {
              const isOwn = message.senderId === currentUserId;

              const showDate =
                index > 0 &&
                new Date(message.createdAt).toDateString() !==
                  new Date(uniqueMessages[index - 1].createdAt).toDateString();

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-5 flex justify-center">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#788397]">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`mb-2.5 flex ${
                      isOwn ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`relative max-w-[86%] border border-black/[0.04] px-4 py-3 shadow-[0_2px_8px_rgba(20,33,61,0.12)] sm:max-w-[72%] ${
                        isOwn
                          ? 'rounded-2xl rounded-br-md pt-3 pr-9'
                          : 'rounded-2xl rounded-bl-md'
                      }`}
                      style={{
                        backgroundColor: isOwn
                          ? themeStyles.outgoingBubbleColor
                          : themeStyles.incomingBubbleColor,
                        color: isOwn ? '#FFFFFF' : themeStyles.incomingTextColor,
                      }}
                    >
                      {isOwn && (
                        <div
                          data-message-menu
                          className="absolute right-1 top-1"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenMessageMenuId((currentId) => (
                              currentId === message.id ? null : message.id
                            ))}
                            aria-label="Message actions"
                            aria-expanded={openMessageMenuId === message.id}
                            className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMessageMenuId === message.id && (
                            <div
                              role="menu"
                              aria-label="Message actions"
                              className="absolute right-0 top-8 z-20 w-60 overflow-hidden rounded-xl border border-[#E7EAF0] bg-white p-1.5 text-[#1A365D] shadow-[0_12px_32px_rgba(15,23,42,0.18)]"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleDeleteMessage(message.id)}
                                disabled={deletingMessageId === message.id}
                                className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-[#FFF4F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C94C3B]/40 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0ED] text-[#B84032] transition-colors group-hover:bg-[#FDE2DD]">
                                  <Trash2 className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-[13px] font-semibold text-[#A93429]">
                                    {deletingMessageId === message.id
                                      ? 'Deleting…'
                                      : 'Delete for everyone'}
                                  </span>
                                  <span className="mt-0.5 block text-[11px] leading-4 text-[#788397]">
                                    Remove this message for everyone in the chat
                                  </span>
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="break-words text-sm leading-[1.45]">
                        {message.content}
                      </p>

                      <div className="mt-1 flex items-center justify-end gap-1.5">
                        <span
                          className={`text-[10px] ${
                            isOwn ? 'text-white/65' : 'text-[#94A3B8]'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </span>

                        {isOwn && (
                          <span
                            className={`text-[10px] font-medium ${
                              message.isRead ? 'text-[#63B3ED]' : 'text-white/55'
                            }`}
                            aria-label={message.isRead ? 'Read' : 'Sent'}
                          >
                            {message.isRead ? '✓✓' : '✓'}
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

      {/* Message Input */}
      <div className="relative z-10 shrink-0 border-t border-[#E8ECF2] bg-white px-3 py-3 sm:px-5">
        <div className="flex w-full items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={isSending ? '' : newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            aria-label="Message"
            className="
              min-w-0 flex-1 rounded-xl border border-[#E2E7EE] bg-[#F8F9FB]
              px-3.5 py-3 text-sm text-[#1A365D]
              placeholder:text-[#9AA3B1]
              outline-none transition
              focus:border-[#B98A3E] focus:bg-white focus:ring-2 focus:ring-[#B98A3E]/15
              disabled:cursor-not-allowed disabled:bg-[#F8F9FB] disabled:opacity-60
            "
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            aria-label="Send message"
            title="Send message"
            className="
              flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
              bg-[#1A2B4C] text-white
              transition-colors hover:bg-[#263B60]
              focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/40
              disabled:cursor-not-allowed disabled:opacity-45
            "
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}