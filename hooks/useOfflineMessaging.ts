import { useState, useEffect, useCallback } from 'react';
import { Message, Conversation, ChatUser } from '@/types';

interface OfflineStorage {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  users: ChatUser[];
  queuedMessages: Message[];
  lastSync: string;
}

const OFFLINE_STORAGE_KEY = 'offline_messaging_data';
const QUEUED_MESSAGES_KEY = 'queued_messages';

export function useOfflineMessaging() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineStorage>({
    conversations: [],
    messages: {},
    users: [],
    queuedMessages: [],
    lastSync: new Date().toISOString(),
  });

  // Load offline data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      const queued = localStorage.getItem(QUEUED_MESSAGES_KEY);

      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
      }

      if (queued) {
        const queuedMessages = JSON.parse(queued);
        setOfflineData(prev => ({ ...prev, queuedMessages }));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }, []);

  // Sync queued messages when back online
  const syncQueuedMessages = useCallback(async () => {
    if (!isOnline || offlineData.queuedMessages.length === 0) return;

    console.log(`📤 Syncing ${offlineData.queuedMessages.length} queued messages`);

    try {
      // Send each queued message
      for (const message of offlineData.queuedMessages) {
        try {
          const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': document.cookie,
            },
            body: JSON.stringify({
              receiverId: message.receiverId,
              content: message.content,
            }),
          });

          if (response.ok) {
            console.log('✅ Queued message sent successfully');
          } else {
            console.error('❌ Failed to send queued message');
          }
        } catch (error) {
          console.error('❌ Error sending queued message:', error);
        }
      }

      // Clear queued messages after sending
      setOfflineData(prev => {
        const updated = { ...prev, queuedMessages: [] };
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('❌ Error syncing queued messages:', error);
    }
  }, [isOnline, offlineData.queuedMessages]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Back online - syncing queued messages');
      setIsOnline(true);
      syncQueuedMessages();
    };

    const handleOffline = () => {
      console.log('🔴 Gone offline - using cached data');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueuedMessages]);

  // Save conversations for offline use
  const saveConversationsOffline = useCallback((conversations: Conversation[]) => {
    setOfflineData(prev => {
      const updated = { ...prev, conversations, lastSync: new Date().toISOString() };
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Save messages for offline use
  const saveMessagesOffline = useCallback((conversationId: string, messages: Message[]) => {
    setOfflineData(prev => {
      const updatedMessages = { ...prev.messages, [conversationId]: messages };
      const updated = { ...prev, messages: updatedMessages, lastSync: new Date().toISOString() };
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Save users for offline use
  const saveUsersOffline = useCallback((users: ChatUser[]) => {
    setOfflineData(prev => {
      const updated = { ...prev, users, lastSync: new Date().toISOString() };
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Queue message for sending when online
  const queueMessage = useCallback((message: Message) => {
    setOfflineData(prev => {
      const queuedMessages = [...prev.queuedMessages, message];
      const updated = { ...prev, queuedMessages };
      localStorage.setItem(QUEUED_MESSAGES_KEY, JSON.stringify(queuedMessages));
      return updated;
    });
  }, []);

  // Get cached conversations
  const getCachedConversations = useCallback(() => {
    return offlineData.conversations;
  }, [offlineData.conversations]);

  // Get cached messages
  const getCachedMessages = useCallback((conversationId: string) => {
    return offlineData.messages[conversationId] || [];
  }, [offlineData.messages]);

  // Get cached users
  const getCachedUsers = useCallback(() => {
    return offlineData.users;
  }, [offlineData.users]);

  // Get queued messages
  const getQueuedMessages = useCallback(() => {
    return offlineData.queuedMessages;
  }, [offlineData.queuedMessages]);


  // Clear offline cache
  const clearOfflineCache = useCallback(() => {
    setOfflineData({
      conversations: [],
      messages: {},
      users: [],
      queuedMessages: [],
      lastSync: new Date().toISOString(),
    });
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    localStorage.removeItem(QUEUED_MESSAGES_KEY);
  }, []);

  return {
    isOnline,
    offlineData,
    saveConversationsOffline,
    saveMessagesOffline,
    saveUsersOffline,
    queueMessage,
    getCachedConversations,
    getCachedMessages,
    getCachedUsers,
    getQueuedMessages,
    syncQueuedMessages,
    clearOfflineCache,
  };
}
