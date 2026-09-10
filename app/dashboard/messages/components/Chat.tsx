'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MoreVertical, Send, Trash2, AlertCircle } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useQueryClient } from '@tanstack/react-query';
import type { Message, ConversationCacheItem } from '@/types/messaging';

interface ChatProps {
  conversationId: string;
  currentUserId: string;
}

export function Chat({ conversationId, currentUserId }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Track if we've already marked as read for this conversation
  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  const { messages, isLoading, error, sendMessage, isSending } = useMessages({
    conversationId,
    currentUserId,
  });

  // ============================================================
  // FIXED: Mark messages as read WITHOUT blocking the UI
  // ============================================================
  useEffect(() => {
    // Skip if already marked or missing required data
    if (!conversationId || !currentUserId || hasMarkedRead) return;

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
    fetch(`/api/messages/${conversationId}/mark-read`, {
      method: 'POST',
    })
      .then(() => {
        setHasMarkedRead(true);
        // Sync with server in background
        queryClient.invalidateQueries({ 
          queryKey: ['conversations', currentUserId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['messages', 'unread-count', currentUserId] 
        });
      })
      .catch((error) => {
        console.error('Failed to mark messages as read:', error);
        // On error, revert the optimistic update
        queryClient.invalidateQueries({ 
          queryKey: ['conversations', currentUserId] 
        });
      });
  }, [conversationId, currentUserId, queryClient, hasMarkedRead]);

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
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete message');
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
      <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
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
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-white">
        {/* Lightweight skeletons instead of a spinner. */}
        <div className="flex-1 overflow-hidden px-4 py-5">
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

        <div className="border-t border-[#E2E8F0] bg-white px-3 py-3">
          <div className="h-12 w-full animate-pulse rounded-xl bg-[#F3F6F9]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F8FAFC]">
      {/* Messages List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">
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
              <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-[11px] font-medium text-[#64748B] shadow-sm">
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
                      <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-[11px] font-medium text-[#64748B] shadow-sm">
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
                      className={`relative max-w-[86%] px-3.5 py-2.5 shadow-sm sm:max-w-[72%] ${
                        isOwn
                          ? 'rounded-2xl rounded-br-md bg-[#1A365D] pt-7 pr-9 text-white'
                          : 'rounded-2xl rounded-bl-md border border-[#E2E8F0] bg-white text-[#1A365D]'
                      }`}
                    >
                      {isOwn && (
                        <div className="absolute right-1 top-1">
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
                            <div className="absolute right-0 top-8 z-10 min-w-[150px] rounded-lg border border-[#E2E8F0] bg-white p-1 text-[#1A365D] shadow-lg">
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(message.id)}
                                disabled={deletingMessageId === message.id}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#C53030] transition-colors hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {deletingMessageId === message.id ? 'Deleting...' : 'Delete message'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="break-words text-[13px] leading-5 sm:text-sm">
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
      <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-3 py-3 sm:px-4">
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
              min-w-0 flex-1 rounded-xl border border-[#CBD5E1] bg-white
              px-3.5 py-3 text-sm text-[#1A365D]
              placeholder:text-[#94A3B8]
              outline-none transition
              focus:border-[#3182CE] focus:ring-2 focus:ring-[#3182CE]/15
              disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60
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
              bg-[#1A365D] text-white
              transition-colors hover:bg-[#153475]
              focus:outline-none focus:ring-2 focus:ring-[#3182CE]/30
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