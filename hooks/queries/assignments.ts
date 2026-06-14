import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '@/lib/api/assignments';

const assignmentKeys = {
  all: ['assignments'] as const,
  list: (params?: { teacherId?: string; studentId?: string }) =>
    [...assignmentKeys.all, 'list', params] as const,
  teachers: () => [...assignmentKeys.all, 'teachers'] as const,
};

export const useAssignments = (params?: { teacherId?: string; studentId?: string }) => {
  return useQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: () => assignmentsApi.getAssignments(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTeachers = () => {
  return useQuery({
    queryKey: assignmentKeys.teachers(),
    queryFn: async () => {
      const response = await assignmentsApi.getTeachers();
      return response;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// Use the bulk endpoint for creating multiple assignments
export const useCreateBulkAssignments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignmentsApi.createBulkAssignments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.teachers() });
    },
    onError: (error: any) => {
      console.error('Create bulk assignments error:', error.response?.data || error.message);
    },
  });
};

// Use the bulk endpoint for deleting multiple assignments
export const useDeleteBulkAssignments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignmentsApi.deleteBulkAssignments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.teachers() });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; notes?: string } }) =>
      assignmentsApi.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.teachers() });
    },
  });
};