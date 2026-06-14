import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi, StudentWithCourses, WeeklyProgress } from '@/lib/api/teacher';

// Query Keys
const teacherKeys = {
  all: ['teacher'] as const,
  students: () => [...teacherKeys.all, 'students'] as const,
};

// Queries
export const useTeacherStudents = () => {
  return useQuery({
    queryKey: teacherKeys.students(),
    queryFn: teacherApi.getStudents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useAssignGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.assignGrade,
    onSuccess: (_, variables) => {
      // Invalidate teacher queries
      queryClient.invalidateQueries({ queryKey: teacherKeys.students() });
      
      // Invalidate the affected student's grades query so their dashboard updates
      queryClient.invalidateQueries({
        queryKey: ['student', variables.studentId, 'grades']
      });
    },
  });
};
