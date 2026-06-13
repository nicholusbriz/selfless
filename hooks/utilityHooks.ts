import { useQueryClient } from '@tanstack/react-query';
import { useUsers, useCleaningDays } from './cleaningHooks';

// Refetch controls hook
export const useRefetchControls = () => {
  const queryClient = useQueryClient();

  const refetchUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] });
  const refetchCourses = () => queryClient.invalidateQueries({ queryKey: ['course-registrations'] });
  const refetchDays = () => queryClient.invalidateQueries({ queryKey: ['cleaning-days'] });
  const refetchStats = () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  const refetchAnnouncements = () => queryClient.invalidateQueries({ queryKey: ['announcements'] });
  const refetchUserStatus = () => queryClient.invalidateQueries({ queryKey: ['user-status'] });
  const refetchAll = () => {
    refetchUsers();
    refetchCourses();
    refetchDays();
    refetchStats();
    refetchAnnouncements();
    refetchUserStatus();
  };

  return {
    refetchUsers,
    refetchCourses,
    refetchDays,
    refetchStats,
    refetchAnnouncements,
    refetchUserStatus,
    refetchAll,
  };
};

// Dashboard stats hook
export const useDashboardStats = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: days = [], isLoading: daysLoading } = useCleaningDays();
  const queryClient = useQueryClient();

  // Get course registrations directly from query cache to avoid circular import
  const courseData = queryClient.getQueryData(['course-registrations']) as { registrations: Array<{ id: string; studentName: string; courseName: string; credits: number }> } | undefined;
  // Use the transformed data length, not raw registrations
  const courseRegistrations = courseData?.registrations || [];

  return {
    totalUsers: users.length,
    registeredForDays: days.length,
    remainingDays: 75 - days.length,
    courseSubmissions: courseRegistrations.length, // Use actual course data
    usedCapacity: days.length,
    totalCapacity: 75,
    isLoading: usersLoading || daysLoading,
  };
};
