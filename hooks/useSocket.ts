'use client';

import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useInvalidateMessages } from './queries/useMessaging';
import type { Message } from '@/types/messaging';

interface UseSocketOptions {
  userId: string;
  role: 'student' | 'teacher' | 'admin';
  onMessage?: (message: Message) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
  onTyping?: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  onMessageRead?: (data: { messageId: string; conversationId: string }) => void;
  enabled?: boolean;
}

export type UseSocketReturn = ReturnType<typeof useWebSocket>;

/**
 * Hook for managing WebSocket connection with real-time messaging
 * Integrates WebSocket events with React Query cache invalidation
 */
export const useSocket = ({
  enabled = true,
  onMessage,
  onUserOnline,
  onUserOffline,
  onTyping,
  onMessageRead,
}: UseSocketOptions) => {
  const wsData = useWebSocket();
  const invalidateMessages = useInvalidateMessages();

  // Listen to WebSocket events and bridge them into the active screen callbacks.
  useEffect(() => {
    if (!enabled || !wsData.socket || !wsData.isConnected) return;

    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      onMessage?.(data.message);
      invalidateMessages(data.conversationId);
    };

    // Handle typing indicators
    const handleTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      onTyping?.(data);
    };

    // Handle message read receipts
    const handleMessageRead = (data: { messageId: string; conversationId: string }) => {
      onMessageRead?.(data);
      invalidateMessages(data.conversationId);
    };

    const handleUserOnline = (data: { userId: string }) => {
      onUserOnline?.(data.userId);
    };

    const handleUserOffline = (data: { userId: string }) => {
      onUserOffline?.(data.userId);
    };

    // Pusher presence channel events for online status
    const handleMemberAdded = (member: any) => {
      console.log('Presence member added:', member.id);
      onUserOnline?.(member.id);
    };

    const handleMemberRemoved = (member: any) => {
      console.log('Presence member removed:', member.id);
      onUserOffline?.(member.id);
    };

    const handleSubscriptionSucceeded = (members: any) => {
      console.log('Presence subscription succeeded, initializing online users');
      // Initialize all current members as online
      members.each((member: any) => {
        onUserOnline?.(member.id);
      });
    };

    // Pusher uses bind/unbind instead of on/off
    wsData.socket.bind('new-message', handleNewMessage);
    wsData.socket.bind('user-online', handleUserOnline);
    wsData.socket.bind('user-offline', handleUserOffline);
    wsData.socket.bind('user-typing', handleTyping);
    wsData.socket.bind('message-read', handleMessageRead);

    // Presence channel events
    wsData.socket.bind('pusher:member_added', handleMemberAdded);
    wsData.socket.bind('pusher:member_removed', handleMemberRemoved);
    wsData.socket.bind('pusher:subscription_succeeded', handleSubscriptionSucceeded);

    return () => {
      wsData.socket?.unbind('new-message', handleNewMessage);
      wsData.socket?.unbind('user-online', handleUserOnline);
      wsData.socket?.unbind('user-offline', handleUserOffline);
      wsData.socket?.unbind('user-typing', handleTyping);
      wsData.socket?.unbind('message-read', handleMessageRead);
      wsData.socket?.unbind('pusher:member_added', handleMemberAdded);
      wsData.socket?.unbind('pusher:member_removed', handleMemberRemoved);
      wsData.socket?.unbind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
    };
  }, [
    enabled,
    wsData.socket,
    wsData.isConnected,
    onMessage,
    onUserOnline,
    onUserOffline,
    onTyping,
    onMessageRead,
    invalidateMessages,
  ]);

  return wsData;
};
