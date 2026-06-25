import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

export const useTeacherAssignments = (status?: string, teacherId?: string, fetchAll?: boolean) => {
  return useQuery({
    queryKey: ['teacher-assignments', { status, teacherId, fetchAll }],
    queryFn: async () => {
      const params: any = {};
      if (status) params.status = status;
      if (teacherId) params.teacherId = teacherId;
      if (fetchAll) params.all = 'true';
      const response = await axios.get('/api/teacher/assignments', { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateTeacherAssignmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string } }) =>
      axios.patch(`/api/teacher/assignments/${id}`, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['teacher-assignments'] });

      // Snapshot previous value
      const previousAssignments = queryClient.getQueryData(['teacher-assignments']);

      // Optimistically update the assignment status
      queryClient.setQueryData(['teacher-assignments'], (old: any) => {
        const existingAssignments = old || [];
        return existingAssignments.map((assignment: any) =>
          assignment.id === id ? { ...assignment, status: data.status } : assignment
        );
      });

      return { previousAssignments };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousAssignments) {
        queryClient.setQueryData(['teacher-assignments'], context.previousAssignments);
      }
    },
    onSuccess: () => {
      // Invalidate all teacher-assignments queries regardless of parameters
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      // Also invalidate all-teachers to ensure teacher counts are updated
      queryClient.invalidateQueries({ queryKey: ['all-teachers'] });
    },
  });
};

export const useAllTeachers = () => {
  return useQuery({
    queryKey: ['all-teachers'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/teachers');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};