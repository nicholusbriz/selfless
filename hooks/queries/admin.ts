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
    onMutate: async ({ studentId, tuitionPaid }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminKeys.students() });

      // Snapshot previous value
      const previousStudents = queryClient.getQueryData(adminKeys.students());

      // Optimistically update the student's tuition status
      queryClient.setQueryData(adminKeys.students(), (old: any) => {
        const students = old || [];
        return students.map((student: any) =>
          student.id === studentId ? { ...student, tuitionPaid } : student
        );
      });

      return { previousStudents };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousStudents) {
        queryClient.setQueryData(adminKeys.students(), context.previousStudents);
      }
    },
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
    onMutate: async ({ userId, roleId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminKeys.students() });

      // Snapshot previous value
      const previousStudents = queryClient.getQueryData(adminKeys.students());

      // Optimistically update the user's role
      queryClient.setQueryData(adminKeys.students(), (old: any) => {
        const students = old?.students || old || [];
        if (!Array.isArray(students)) return old;
        return students.map((student: any) =>
          student.id === userId ? { ...student, roleId } : student
        );
      });

      return { previousStudents };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousStudents) {
        queryClient.setQueryData(adminKeys.students(), context.previousStudents);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { firstName: string; lastName: string; email: string; phoneNumber?: string } }) =>
      adminApi.updateStudent(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminKeys.students() });

      // Snapshot previous value
      const previousStudents = queryClient.getQueryData(adminKeys.students());

      // Optimistically update the student details
      queryClient.setQueryData(adminKeys.students(), (old: any) => {
        const students = old || [];
        return students.map((student: any) =>
          student.id === id ? { ...student, ...data } : student
        );
      });

      return { previousStudents };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousStudents) {
        queryClient.setQueryData(adminKeys.students(), context.previousStudents);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteStudent(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminKeys.students() });

      // Snapshot previous value
      const previousStudents = queryClient.getQueryData(adminKeys.students());

      // Optimistically remove the student
      queryClient.setQueryData(adminKeys.students(), (old: any) => {
        const students = old || [];
        return students.filter((student: any) => student.id !== id);
      });

      return { previousStudents };
    },
    onError: (error, id, context) => {
      // Rollback to previous value on error
      if (context?.previousStudents) {
        queryClient.setQueryData(adminKeys.students(), context.previousStudents);
      }
    },
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
