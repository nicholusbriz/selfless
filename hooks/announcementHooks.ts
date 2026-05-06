/**
 * @fileoverview Announcement System Hooks
 * 
 * This file contains React Query hooks for managing the announcement system.
 * It provides a clean interface between components and the announcement API,
 * handling data fetching, caching, mutations, and error management.
 * 
 * Key Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for better UX
 * - Error handling and loading states
 * - Type-safe API interactions
 * 
 * Available Hooks:
 * - useAnnouncements: Fetch all announcements
 * - useCreateAnnouncement: Create new announcement
 * - useDeleteAnnouncement: Delete announcement
 * - usePostComment: Add comment to announcement
 * - usePostReply: Add reply to comment
 * - useDeleteComment: Delete comment/reply
 * - useCheckTutorStatus: Verify tutor permissions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * Type definitions for tutor status checking
 * Defines the structure of tutor permission responses
 */
interface TutorResponse {
  success: boolean;
  isTutor: boolean;
  tutor?: {
    id: string;
    userId: string;
    email: string;
    fullName: string;
    permissions: {
      canViewAnnouncements: boolean;
      canPostAnnouncements: boolean;
      canManageUsers: boolean;
    };
  };
}

/**
 * Type definitions for announcement comments
 * Supports nested replies for threaded discussions
 */
interface Comment {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[]; // Nested replies for threaded conversations
}

/**
 * Type definition for announcements
 * Contains announcement metadata and associated comments
 */
interface Announcement {
  id: string;
  title: string;
  content: string;
  adminId: string;        // Creator ID (admin or tutor)
  adminName: string;      // Creator display name
  adminEmail: string;     // Creator email
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];   // Associated comments
}

/**
 * Fetches all announcements from the API
 * 
 * This function handles the HTTP request to retrieve announcements.
 * It includes error handling and type safety.
 * 
 * @returns Promise resolving to announcements data
 * @throws Error if network request fails
 */
const fetchAnnouncements = async (): Promise<{ success: boolean; announcements: Announcement[] }> => {
  const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS);
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

/**
 * Checks if current user has tutor privileges
 * 
 * This function verifies the user's tutor status and permissions
 * by making a POST request to the tutor checking endpoint.
 * 
 * @returns Promise resolving to tutor status and permissions
 * @throws Error if network request fails
 */
const checkTutorStatus = async (): Promise<TutorResponse> => {
  const response = await fetch('/api/tutors/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check tutor status');
  }

  return response.json();
};

/**
 * React Query hook for fetching announcements
 * 
 * This hook provides a clean interface for fetching announcements
 * with automatic caching, background refetching, and error handling.
 * 
 * Features:
 * - Caches announcements for 2 minutes
 * - Automatically refetches on window focus
 * - Provides loading and error states
 * - Returns just the announcements array for convenience
 * 
 * @returns React Query result with announcements data
 */
export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for announcements
    select: (data) => data.announcements || [],
  });
};

/**
 * Type definition for creating new announcements
 * Defines the required fields for announcement creation
 */
interface CreateAnnouncementData {
  title: string;        // Announcement title
  content: string;       // Main announcement content
  adminId: string;       // Creator's user ID
  adminName: string;     // Creator's display name
  adminEmail: string;    // Creator's email
  isActive: boolean;     // Whether announcement is active
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementData: CreateAnnouncementData) => {
      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This will include cookies automatically
        body: JSON.stringify(announcementData),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle specific error messages
        if (error.message === 'Invalid or expired token') {
          throw new Error('Your session has expired. Please log in again.');
        } else if (error.message === 'Authorization token required') {
          throw new Error('Authentication required. Please log in again.');
        } else if (error.message === 'Only admins and authorized tutors can post announcements') {
          throw new Error('You do not have permission to create announcements.');
        } else {
          throw new Error(error.message || 'Failed to create announcement');
        }
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ announcementId, userId }: { announcementId: string; userId: string }) => {
      const response = await fetch(`${API_ENDPOINTS.ANNOUNCEMENTS}?id=${announcementId}&type=announcement&userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Enhanced announcement management hook
export const useCreateAnnouncementEnhanced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementData: {
      title: string;
      content: string;
      adminId: string;
      adminName: string;
    }) => {
      const response = await fetch('/api/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create announcement');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Enhanced announcement deletion hook
export const useDeleteAnnouncementEnhanced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ announcementId, adminId }: { announcementId: string; adminId: string }) => {
      const response = await fetch(`/api/announcements/delete?id=${announcementId}&adminId=${adminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Comment and reply hooks
export const usePostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData: {
      announcementId: string;
      userId: string;
      userName: string;
      userEmail: string;
      content: string;
    }) => {
      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'comment',
          ...commentData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const usePostReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (replyData: {
      commentId: string;
      announcementId: string;
      userId: string;
      userName: string;
      userEmail: string;
      content: string;
    }) => {
      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'reply',
          ...replyData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post reply');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, userId }: { commentId: string; userId: string }) => {
      const response = await fetch(`/api/announcements?type=comment&id=${commentId}&userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Tutor checking hook
export const useCheckTutorStatus = () => {
  return useQuery({
    queryKey: ['tutorStatus'],
    queryFn: checkTutorStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    select: (data) => ({
      isTutor: data.isTutor && data.tutor?.permissions?.canPostAnnouncements || false,
      tutor: data.tutor
    }),
  });
};
