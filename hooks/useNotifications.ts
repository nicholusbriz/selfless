import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  readAt: string | null;
  generatedBy: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

// Hook to fetch user notifications
export function useNotifications(unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      const response = await axios.get<NotificationsData>(`/api/notifications?unreadOnly=${unreadOnly}`);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch only unread count (for badges)
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await axios.get<NotificationsData>('/api/notifications?unreadOnly=true&limit=1');
        return response.data.unreadCount || 0;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0; // Return 0 on error to avoid showing stale badges
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    // Removed refetchInterval to prevent repeated timeout errors
  });
}

// Hook to mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await axios.patch(`/api/notifications/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Hook to mark all notifications as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
