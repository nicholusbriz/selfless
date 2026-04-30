import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types for your API responses
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  createdAt?: string | Date;
}

interface CourseRegistration {
  id: string;
  userId: string;
  user?: { fullName?: string; firstName?: string; lastName?: string };
  takesReligion?: boolean;
  courses?: Array<{ name: string }>;
  totalCredits?: number;
  registrationDate?: string;
  createdAt?: string;
  status?: string;
}

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

// API fetch functions
const fetchUsers = async (): Promise<{ success: boolean; users: User[] }> => {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

const fetchCourseRegistrations = async (): Promise<{ success: boolean; registrations: CourseRegistration[] }> => {
  const response = await fetch('/api/all-course-registrations');
  if (!response.ok) throw new Error('Failed to fetch course registrations');
  return response.json();
};

const fetchCleaningDays = async (): Promise<{ success: boolean; weeks: { [key: number]: CleaningDay[] } }> => {
  const response = await fetch('/api/cleaning-days');
  if (!response.ok) throw new Error('Failed to fetch cleaning days');
  return response.json();
};

// Custom hooks for data fetching
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes - perfect for PWA
    select: (data) => data.users || [],
  });
};

export const useCourseRegistrations = () => {
  return useQuery({
    queryKey: ['course-registrations'],
    queryFn: fetchCourseRegistrations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      return data.registrations.map((reg) => ({
        id: reg.id,
        userId: reg.userId,
        userName: reg.user?.fullName || `${reg.user?.firstName || ''} ${reg.user?.lastName || ''}`.trim(),
        religion: reg.takesReligion ? 'Yes' : 'No',
        courseName: reg.courses?.map((c) => c.name).join(', ') || 'Unknown',
        credits: reg.totalCredits || 0,
        submittedAt: reg.registrationDate || reg.createdAt || new Date().toISOString(),
        status: (reg.status || 'approved') as 'pending' | 'approved' | 'rejected'
      }));
    },
  });
};

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
          day.registeredUsers.forEach((user: any) => {
            // Find user's phone number from users array
            const userCredentials = users.find((u: any) => u.id === user.id);

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

// Mutation hooks for actions
export const useRemoveUserFromDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, dayId }: { userId: string; dayId: string }) => {
      const response = await fetch(`/api/cleaning-days?userId=${userId}&dayId=${dayId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove user from day');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['cleaning-days'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useClearCourseSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await fetch(`/api/courses/clear?id=${submissionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear course submission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/permanent?id=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-days'] });
      queryClient.invalidateQueries({ queryKey: ['course-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const { data: users = [] } = useUsers();
  const { data: cleaningDays = [] } = useCleaningDays();
  const { data: courseRegistrations = [] } = useCourseRegistrations();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => {
      const totalUsers = users.length;
      const registeredForDays = new Set(cleaningDays.map(user => user.id)).size;
      const totalRegistrations = cleaningDays.length;
      const remainingDays = Math.max(0, 75 - totalRegistrations); // 75 total capacity
      const courseSubmissions = courseRegistrations.length;

      return {
        totalUsers,
        registeredForDays,
        remainingDays,
        totalCapacity: 75,
        usedCapacity: totalRegistrations,
        courseSubmissions,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
  });
};

// Hook for manual refetch controls
export const useRefetchControls = () => {
  const queryClient = useQueryClient();

  const refetchUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] });
  const refetchCourses = () => queryClient.invalidateQueries({ queryKey: ['course-registrations'] });
  const refetchDays = () => queryClient.invalidateQueries({ queryKey: ['cleaning-days'] });
  const refetchStats = () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  const refetchAll = () => {
    refetchUsers();
    refetchCourses();
    refetchDays();
    refetchStats();
  };

  return {
    refetchUsers,
    refetchCourses,
    refetchDays,
    refetchStats,
    refetchAll,
  };
};
