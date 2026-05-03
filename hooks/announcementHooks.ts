import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/constants';

// Types for tutor checking
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

// Types for announcements
interface Comment {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

// API fetch functions
const fetchAnnouncements = async (): Promise<{ success: boolean; announcements: Announcement[] }> => {
  const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS);
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

// Tutor checking function
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

// Announcement hooks
export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for announcements
    select: (data) => data.announcements || [],
  });
};

interface CreateAnnouncementData {
  title: string;
  content: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  isActive: boolean;
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
