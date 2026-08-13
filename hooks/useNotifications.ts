import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
      const response = await fetch(`/api/notifications?unreadOnly=${unreadOnly}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch notifications');
      }
      return response.json();
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
        const response = await fetch('/api/notifications?unreadOnly=true&limit=1');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch unread count');
        }
        const data = await response.json();
        return data.unreadCount || 0;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    // Removed refetchInterval to prevent repeated timeout errors
  });
}

// Hook to fetch announcement count
export function useAnnouncementCount() {
  return useQuery({
    queryKey: ['announcements', 'count'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/announcements');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch announcements');
        }
        const data = await response.json();
        return data.announcements?.length || 0;
      } catch (error) {
        console.error('Error fetching announcement count:', error);
        return 0;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark notification as read');
      }
      return response.json();
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
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark all as read');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
