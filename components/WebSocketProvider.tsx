'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMessagingStore } from '@/stores/messagingStore';
import { pusherClient, subscribeToUser, subscribeToRole, subscribeToOnlineUsers, unsubscribeFromUser, unsubscribeFromRole, unsubscribeFromOnlineUsers } from '@/lib/pusher-client';
import type { PresenceChannel } from 'pusher-js';
import type { Message } from '@/types/messaging';

interface WebSocketProviderProps {
  children: ReactNode;
}

// Singleton channel instances
let userChannel: PresenceChannel | null = null;
let roleChannel: PresenceChannel | null = null;
let onlineUsersChannel: PresenceChannel | null = null;
let currentUserId: string | null = null;
let currentRole: string | null = null;

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuthStore();
  const { addOnlineUser, removeOnlineUser, addMessage } = useMessagingStore();
  const { activeConversationId } = useMessagingStore();

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (userChannel) {
        unsubscribeFromUser(currentUserId || '');
        userChannel = null;
      }
      if (roleChannel) {
        unsubscribeFromRole(currentRole || '');
        roleChannel = null;
      }
      if (onlineUsersChannel) {
        unsubscribeFromOnlineUsers();
        onlineUsersChannel = null;
      }
      currentUserId = null;
      currentRole = null;
      return;
    }

    const userId = user.id;
    const role = user.role?.name || 'student';
    const shouldReconnect = currentUserId !== userId || currentRole !== role;

    if (shouldReconnect) {
      // Unsubscribe from old channels
      if (userChannel && currentUserId) {
        unsubscribeFromUser(currentUserId);
      }
      if (roleChannel && currentRole) {
        unsubscribeFromRole(currentRole);
      }
      if (onlineUsersChannel) {
        unsubscribeFromOnlineUsers();
      }

      // Subscribe to new channels
      try {
        userChannel = subscribeToUser(userId);
        roleChannel = subscribeToRole(role);
        onlineUsersChannel = subscribeToOnlineUsers();

        currentUserId = userId;
        currentRole = role;

        // Listen for user-specific events (messages, notifications)
        userChannel.bind('new-message', (data: { message: Message; conversationId: string }) => {
          console.log('New message received:', data);
          if (data.conversationId === activeConversationId) {
            addMessage(data.message, data.conversationId);
          }
        });

        // Listen for presence channel events to track online users
        onlineUsersChannel.bind('pusher:subscription_succeeded', (members: any) => {
          console.log('Online users presence channel subscription succeeded', members);
          // Initialize online users from presence channel members
          members.each((member: any) => {
            if (member.id !== userId) {
              addOnlineUser(member.id);
            }
          });
        });

        onlineUsersChannel.bind('pusher:member_added', (member: any) => {
          console.log('User came online:', member.id);
          if (member.id !== userId) {
            addOnlineUser(member.id);
          }
        });

        onlineUsersChannel.bind('pusher:member_removed', (member: any) => {
          console.log('User went offline:', member.id);
          if (member.id !== userId) {
            removeOnlineUser(member.id);
          }
        });

        // Listen for connection state
        pusherClient.connection.bind('connected', () => {
          console.log('Pusher connected');
        });

        pusherClient.connection.bind('disconnected', () => {
          console.log('Pusher disconnected');
        });

        pusherClient.connection.bind('error', (err: any) => {
          console.error('Pusher connection error:', err);
        });
      } catch (err) {
        console.error('Error subscribing to Pusher channels:', err);
      }
    }

    return () => {
      // Cleanup connection listeners
      pusherClient.connection.unbind('connected');
      pusherClient.connection.unbind('disconnected');
      pusherClient.connection.unbind('error');
    };
  }, [user, addOnlineUser, removeOnlineUser, addMessage, activeConversationId]);

  return <>{children}</>;
}
