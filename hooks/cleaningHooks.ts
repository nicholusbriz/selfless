import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/constants';

// Types for cleaning days
interface CleaningDay {
  id: string;
  dayName: string;
  date: string;
  week: number;
  registeredUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }>;
  registeredCount: number;
  maxSlots: number;
  isFull: boolean;
  formattedDate: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  createdAt?: string | Date;
}

// API fetch functions
const fetchUsers = async (): Promise<{ success: boolean; users: User[] }> => {
  const response = await fetch(API_ENDPOINTS.USERS);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

const fetchCleaningDays = async (): Promise<{ success: boolean; weeks: { [key: number]: CleaningDay[] } }> => {
  const response = await fetch(`${API_ENDPOINTS.CLEANING_FORM}?admin=true`);
  if (!response.ok) throw new Error('Failed to fetch cleaning days');
  return response.json();
};

// User hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes - perfect for PWA
    select: (data) => data.users || [],
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`${API_ENDPOINTS.USERS}?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Cleaning days hooks
export const useCleaningDays = () => {
  const { data: users = [] } = useUsers();

  return useQuery({
    queryKey: ['cleaning-days'],
    queryFn: fetchCleaningDays,
    staleTime: 3 * 60 * 1000, // 3 minutes - more frequent for registrations
    select: (data) => {
      if (!data.weeks) return [];

      const allRegisteredUsers: Array<{
        id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        formattedDate: string;
        dayId: string;
        email: string;
        phoneNumber?: string;
      }> = [];
      Object.values(data.weeks).forEach((weekDays) => {
        weekDays.forEach((day) => {
          day.registeredUsers.forEach((user: { id: string; firstName: string; lastName: string; fullName: string; email: string; createdAt: string; updatedAt: string }) => {
            // Find user's phone number from users array
            const userCredentials = users.find((u: User) => u.id === user.id);

            allRegisteredUsers.push({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              fullName: user.fullName,
              formattedDate: day.formattedDate,
              dayId: day.id.toString(),
              email: user.email,
              phoneNumber: userCredentials?.phoneNumber || undefined,
            });
          });
        });
      });

      return allRegisteredUsers;
    },
  });
};

export const useRemoveUserFromDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, dayId }: { userId: string; dayId: string }) => {
      const response = await fetch(`${API_ENDPOINTS.CLEANING_FORM}?userId=${userId}&dayId=${dayId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove user from cleaning day');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-days'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Dashboard stats hook for cleaning
export const useCleaningStats = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: days = [], isLoading: daysLoading } = useCleaningDays();
  
  return {
    totalUsers: users.length,
    registeredForDays: days.length,
    remainingDays: 75 - days.length,
    totalCapacity: 75,
    usedCapacity: days.length,
    isLoading: usersLoading || daysLoading,
  };
};
