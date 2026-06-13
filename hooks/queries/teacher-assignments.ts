import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

export const useTeacherAssignments = (status?: string, teacherId?: string) => {
  return useQuery({
    queryKey: ['teacher-assignments', { status, teacherId }],
    queryFn: async () => {
      const params: any = {};
      if (status) params.status = status;
      if (teacherId) params.teacherId = teacherId;
      const response = await axios.get('/api/teacher/assignments', { params });
      console.log('Teacher assignments response:', response.data);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
  });
};