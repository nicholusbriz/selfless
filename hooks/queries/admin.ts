import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, StudentSummary, GPADistribution, AdminWeeklyProgress } from '@/lib/api/admin';

// Query Keys
const adminKeys = {
  all: ['admin'] as const,
  students: (params?: { gpaMin?: number; gpaMax?: number; search?: string; role?: string }) =>
    [...adminKeys.all, 'students', params] as const,
  student: (id: string) => [...adminKeys.all, 'student', id] as const,
  gpaDistribution: () => [...adminKeys.all, 'gpaDistribution'] as const,
  weeklyProgress: () => [...adminKeys.all, 'weeklyProgress'] as const,
};

// Queries
export const useAdminStudents = (params?: { gpaMin?: number; gpaMax?: number; search?: string; role?: string }) => {
  return useQuery({
    queryKey: adminKeys.students(params),
    queryFn: () => adminApi.getStudents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGPADistribution = () => {
  return useQuery({
    queryKey: adminKeys.gpaDistribution(),
    queryFn: adminApi.getGPADistribution,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useWeeklyProgress = () => {
  return useQuery({
    queryKey: adminKeys.weeklyProgress(),
    queryFn: adminApi.getWeeklyProgress,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutations
export const useUpdateTuitionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, tuitionPaid }: { studentId: string; tuitionPaid: boolean }) =>
      adminApi.updateTuitionStatus(studentId, tuitionPaid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminApi.updateUserRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: [...adminKeys.all, 'roles'] as const,
    queryFn: adminApi.getRoles,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
