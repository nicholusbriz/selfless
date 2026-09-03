'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Send } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';

interface ChatProps {
  conversationId: string;
  currentUserId: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export function Chat({ conversationId, currentUserId }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, isSending } = useMessages({
    conversationId,
    currentUserId,
  });

  // Deduplicate messages by ID - ensures no duplicate keys
  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter((message: Message) => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [uniqueMessages]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isSending) return;

    await sendMessage(trimmed);
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format time
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date for message grouping
  const formatDate = (date: string) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#B98A3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-[#6B7268]">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {uniqueMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-[#F1F1EC] rounded-full flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-[#8A9088]" />
            </div>
            <p className="text-sm text-[#6B7268] font-medium">No messages yet</p>
            <p className="text-xs text-[#8A9088] mt-1">Start the conversation!</p>
          </div>
        ) : (
          <>
            {/* Show date for first message */}
            {uniqueMessages.length > 0 && (
              <div className="text-center">
                <span className="text-xs text-[#8A9088] bg-[#F1F1EC] px-3 py-1 rounded-full">
                  {formatDate(uniqueMessages[0].createdAt)}
                </span>
              </div>
            )}

            {uniqueMessages.map((message: Message, index: number) => {
              const isOwn = message.senderId === currentUserId;
              const showDate = index > 0 && 
                new Date(message.createdAt).toDateString() !== 
                new Date(uniqueMessages[index - 1].createdAt).toDateString();

              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="text-xs text-[#8A9088] bg-[#F1F1EC] px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-[#12203B] text-white'
                          : 'bg-[#F1F1EC] text-[#12203B]'
                      }`}
                    >
                      <p className="text-sm break-words leading-relaxed">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[9px] ${isOwn ? 'text-white/70' : 'text-[#8A9088]'}`}>
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwn && (
                          <span className={`text-[9px] ${message.isRead ? 'text-[#B98A3E]' : 'text-white/50'}`}>
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
      <div className="p-3 border-t border-[#DADCD3] bg-[#FCFCFA]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="
              flex-1 px-4 py-2.5
              border border-[#DADCD3] rounded-full
              text-sm text-[#12203B]
              placeholder:text-[#8A9088]
              focus:outline-none focus:border-[#B98A3E] focus:ring-1 focus:ring-[#B98A3E]
              disabled:opacity-50
              transition-all
            "
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="
              w-11 h-11 bg-[#12203B] text-white rounded-full
              hover:bg-[#1C2E4E] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center flex-shrink-0
            "
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}