import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/constants';

// Types for admin and tutor management
interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  fullName?: string;
  addedAt?: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  experience: string;
  createdAt: string;
  fullName?: string;
  addedAt?: string;
  permissions?: {
    canManageCourses?: boolean;
    canViewStudents?: boolean;
    canManageSchedule?: boolean;
    canViewAnnouncements?: boolean;
    canPostAnnouncements?: boolean;
  };
}

// API fetch functions
const fetchAdmins = async (): Promise<{ success: boolean; admins: Admin[] }> => {
  const response = await fetch(API_ENDPOINTS.ADMINS);
  if (!response.ok) throw new Error('Failed to fetch admins');
  return response.json();
};

const fetchTutors = async (): Promise<{ success: boolean; tutors: Tutor[] }> => {
  const response = await fetch(API_ENDPOINTS.TUTORS);
  if (!response.ok) throw new Error('Failed to fetch tutors');
  return response.json();
};

// Admin hooks
export const useAdmins = () => {
  return useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.admins || [],
  });
};

interface AddAdminData {
  email: string;
  firstName: string;
  lastName: string;
}

export const useAddAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminData: AddAdminData) => {
      const response = await fetch(API_ENDPOINTS.ADMINS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add admin');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useRemoveAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const response = await fetch(`${API_ENDPOINTS.ADMINS}?id=${adminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove admin');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

// Tutor hooks
export const useTutors = () => {
  return useQuery({
    queryKey: ['tutors'],
    queryFn: fetchTutors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.tutors || [],
  });
};

interface AddTutorData {
  email: string;
  permissions: {
    canViewAnnouncements: boolean;
    canPostAnnouncements: boolean;
    canManageUsers: boolean;
  };
}

export const useAddTutor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tutorData: AddTutorData) => {
      const response = await fetch(API_ENDPOINTS.TUTORS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add tutor');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
    },
  });
};

export const useRemoveTutor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tutorId: string) => {
      const response = await fetch(`${API_ENDPOINTS.TUTORS}?id=${tutorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove tutor');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
    },
  });
};
