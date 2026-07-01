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
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: assignmentKeys.list() });

      // Snapshot previous value
      const previousAssignments = queryClient.getQueryData(assignmentKeys.list());

      // Optimistically add assignments
      queryClient.setQueryData(assignmentKeys.list(), (old: any) => {
        const existingAssignments = Array.isArray(old) ? old : (old?.assignments || []);
        const newAssignments = variables.studentIds.map((studentId: string) => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          teacherId: variables.teacherId,
          studentId,
          status: variables.status || 'active',
          notes: variables.notes,
          assignedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        return [...existingAssignments, ...newAssignments];
      });

      return { previousAssignments };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousAssignments) {
        queryClient.setQueryData(assignmentKeys.list(), context.previousAssignments);
      }
      console.error('Create bulk assignments error:', error);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.teachers() });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['all-teachers'] });
      // Invalidate student profiles for affected students
      variables.studentIds.forEach((studentId: string) => {
        queryClient.invalidateQueries({ queryKey: ['student', studentId, 'profile'] });
      });
    },
  });
};

// Use the bulk endpoint for deleting multiple assignments
export const useDeleteBulkAssignments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignmentsApi.deleteBulkAssignments,
    onMutate: async (assignmentIds: string[]) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: assignmentKeys.list() });

      // Snapshot previous value
      const previousAssignments = queryClient.getQueryData(assignmentKeys.list());

      // Optimistically remove assignments
      queryClient.setQueryData(assignmentKeys.list(), (old: any) => {
        const existingAssignments = Array.isArray(old) ? old : (old?.assignments || []);
        return existingAssignments.filter((assignment: any) => 
          !assignmentIds.includes(assignment.id)
        );
      });

      return { previousAssignments };
    },
    onError: (error, assignmentIds, context) => {
      // Rollback to previous value on error
      if (context?.previousAssignments) {
        queryClient.setQueryData(assignmentKeys.list(), context.previousAssignments);
      }
    },
    onSuccess: (_, assignmentIds) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.teachers() });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['all-teachers'] });
      // Invalidate all student profiles since we don't have student IDs from assignment IDs
      // This ensures all affected students get their stats updated
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; notes?: string } }) =>
      assignmentsApi.updateAssignment(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: assignmentKeys.list() });

      // Snapshot previous value
      const previousAssignments = queryClient.getQueryData(assignmentKeys.list());

      // Optimistically update the assignment
      queryClient.setQueryData(assignmentKeys.list(), (old: any) => {
        const existingAssignments = Array.isArray(old) ? old : (old?.assignments || []);
        return existingAssignments.map((assignment: any) =>
          assignment.id === id ? { ...assignment, ...data } : assignment
        );
      });

      return { previousAssignments };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousAssignments) {
        queryClient.setQueryData(assignmentKeys.list(), context.previousAssignments);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.teachers() });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['all-teachers'] });
      // Invalidate all student profiles since status changes affect tutor display
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
  });
};