import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, StudentSummary } from '@/lib/api/admin';
import { teacherApi } from '@/lib/api/teacher';

// Query Keys for shared grades
const sharedGradesKeys = {
  all: ['shared', 'grades'] as const,
  students: () => [...sharedGradesKeys.all, 'students'] as const,
};

// Unified query hook for fetching students with grades data
// Used by both teachers and admins to ensure they see the same data
export const useSharedGradesStudents = () => {
  return useQuery({
    queryKey: sharedGradesKeys.students(),
    queryFn: async () => {
      // Use admin endpoint to get all students with grades
      // This ensures both teachers and admins see the same complete dataset
      const response = await adminApi.getStudents();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Unified mutation hook for assigning grades
// Used by both teachers and admins
export const useSharedAssignGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.assignGrade,
    onSuccess: (_, variables) => {
      // Invalidate shared grades query
      queryClient.invalidateQueries({ queryKey: sharedGradesKeys.students() });
      
      // Invalidate the affected student's grades query so their dashboard updates
      queryClient.invalidateQueries({
        queryKey: ['student', variables.studentId, 'grades']
      });
    },
  });
};
